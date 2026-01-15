// Supabase Edge Function: generate-character-sprites
// Generates multiple pose sprites for a game character using Claude AI

import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CharacterRequest {
  prompt: string;           // Character description
  width: number;            // Sprite width (max 32)
  height: number;           // Sprite height (max 32)
  artStyle?: string;        // pixel_8bit, pixel_16bit, pixel_32bit
  perspective?: string;     // side_view, top_down
  paletteSize?: number;     // 4, 8, 16, 32
  characterType?: string;   // humanoid, creature, robot, etc.
  customColors?: string[];  // Optional base colors to use
  customInstructions?: string;
  poses?: string[];         // Which poses to generate (default: all)
  existingPalette?: string[]; // Reuse palette from previous generation
}

const POSE_CONFIG: Record<string, { frames: number; description: string }> = {
  idle: { frames: 2, description: "subtle breathing/movement" },
  walk: { frames: 4, description: "walk cycle" },
  attack: { frames: 3, description: "attack animation" },
  hurt: { frames: 2, description: "taking damage" },
  death: { frames: 3, description: "death sequence" }
};

function buildPrompt(request: CharacterRequest): string {
  const width = request.width;
  const height = request.height;
  const paletteSize = request.paletteSize || 16;
  const posesToGenerate = request.poses || Object.keys(POSE_CONFIG);

  // Calculate total frames
  const totalFrames = posesToGenerate.reduce((sum, pose) =>
    sum + (POSE_CONFIG[pose]?.frames || 2), 0);

  // Build poses list
  const posesList = posesToGenerate
    .map((pose, i) => {
      const config = POSE_CONFIG[pose];
      if (!config) return null;
      return `${i + 1}. **${pose}** - ${config.frames} frames (${config.description})`;
    })
    .filter(Boolean)
    .join("\n");

  // Build output structure example
  const posesExample = posesToGenerate
    .map(pose => {
      const frames = POSE_CONFIG[pose]?.frames || 2;
      const frameArrays = Array(frames).fill("[[...], [...], ...]").join(",\n      ");
      return `    "${pose}": [\n      ${frameArrays}\n    ]`;
    })
    .join(",\n");

  // Palette instruction
  const paletteInstruction = request.existingPalette
    ? `**USE THIS EXACT PALETTE:** ${JSON.stringify(request.existingPalette)}
Do NOT create a new palette. Use these exact colors with these exact indices.`
    : `**Max Palette Colors:** ${paletteSize}`;

  return `You are an expert pixel artist specializing in game character sprites.

## CHARACTER SPECIFICATIONS

**Description:** ${request.prompt}
**Dimensions:** ${width}x${height} pixels per frame
**Art Style:** ${(request.artStyle || "pixel_16bit").replace(/_/g, " ")}
**Perspective:** ${(request.perspective || "side_view").replace(/_/g, " ")} (character facing RIGHT)
**Character Type:** ${request.characterType || "humanoid"}
${paletteInstruction}
${request.customColors?.length ? `**Include these colors:** ${request.customColors.join(", ")}` : ""}
${request.customInstructions ? `**Special instructions:** ${request.customInstructions}` : ""}

## POSES TO GENERATE

Generate these poses with the specified frame counts:
${posesList}

Total: ${totalFrames} frames

## IMPORTANT RULES

1. ${request.existingPalette ? "Use the EXACT palette provided above" : "Create ONE shared color palette used across ALL frames"}
2. Use PALETTE INDICES (0, 1, 2, etc.) instead of hex colors in the pixel data
3. Index 0 should ALWAYS be transparent
4. Keep the character visually consistent across all poses
5. Each frame must be exactly ${width}x${height} pixels

## OUTPUT FORMAT

Return ONLY valid JSON with this exact structure:
{
  "characterName": "descriptive_name",
  "description": "Brief character description",
  "palette": [${request.existingPalette ? '"...existing palette..."' : '"#00000000", "#hex1", "#hex2", ...'}],
  "poses": {
${posesExample}
  }
}

Each pose is an array of frames. Each frame is a 2D array of ${height} rows x ${width} palette indices.

Generate the sprite data now:`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const request: CharacterRequest = await req.json();

    // Validate required fields
    if (!request.prompt || !request.width || !request.height) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: prompt, width, height" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit size for reasonable generation
    if (request.width > 32 || request.height > 32) {
      return new Response(
        JSON.stringify({ error: "Maximum sprite size is 32x32 for AI generation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(request);

    console.log("Generating character sprites for:", request.prompt);

    // Use streaming to avoid timeout for long generations
    let fullText = "";

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 32000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Collect streamed text
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        fullText += event.delta.text;
      }
    }

    if (!fullText) {
      throw new Error("No text response from Claude");
    }

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", fullText.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate response structure
    if (!result.palette || !Array.isArray(result.palette)) {
      throw new Error("Response missing palette array");
    }

    if (!result.poses || typeof result.poses !== "object") {
      throw new Error("Response missing poses object");
    }

    // Validate each requested pose has frames
    const requestedPoses = request.poses || Object.keys(POSE_CONFIG);
    for (const pose of requestedPoses) {
      if (!result.poses[pose] || !Array.isArray(result.poses[pose])) {
        console.warn(`Missing or invalid pose: ${pose}`);
      }
    }

    console.log("Successfully generated", requestedPoses.length, "poses with", result.palette.length, "colors");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating character:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate character" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
