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
}

function buildPrompt(request: CharacterRequest): string {
  const width = request.width;
  const height = request.height;
  const paletteSize = request.paletteSize || 16;

  return `You are an expert pixel artist specializing in game character sprites. Generate a complete character sprite sheet with multiple poses.

## CHARACTER SPECIFICATIONS

**Description:** ${request.prompt}
**Dimensions:** ${width}x${height} pixels per frame
**Art Style:** ${(request.artStyle || "pixel_16bit").replace(/_/g, " ")}
**Perspective:** ${(request.perspective || "side_view").replace(/_/g, " ")} (character facing RIGHT)
**Character Type:** ${request.characterType || "humanoid"}
**Max Palette Colors:** ${paletteSize}
${request.customColors?.length ? `**Include these colors:** ${request.customColors.join(", ")}` : ""}
${request.customInstructions ? `**Special instructions:** ${request.customInstructions}` : ""}

## POSES TO GENERATE

Generate these poses with the specified frame counts:
1. **idle** - 2 frames (subtle breathing/movement)
2. **walk** - 4 frames (walk cycle)
3. **attack** - 3 frames (attack animation)
4. **hurt** - 2 frames (taking damage)
5. **death** - 3 frames (death sequence)

Total: 14 frames

## IMPORTANT RULES

1. Create ONE shared color palette used across ALL frames
2. Use PALETTE INDICES (0, 1, 2, etc.) instead of hex colors in the pixel data
3. Index 0 should ALWAYS be transparent
4. Keep the character visually consistent across all poses
5. Each frame must be exactly ${width}x${height} pixels

## OUTPUT FORMAT

Return ONLY valid JSON with this exact structure:
{
  "characterName": "descriptive_name",
  "description": "Brief character description",
  "palette": ["#00000000", "#hex1", "#hex2", ...],
  "poses": {
    "idle": [
      [[0,1,2,...], [0,1,2,...], ...],
      [[0,1,2,...], [0,1,2,...], ...]
    ],
    "walk": [
      [[...], [...], ...],
      [[...], [...], ...],
      [[...], [...], ...],
      [[...], [...], ...]
    ],
    "attack": [
      [[...], [...], ...],
      [[...], [...], ...],
      [[...], [...], ...]
    ],
    "hurt": [
      [[...], [...], ...],
      [[...], [...], ...]
    ],
    "death": [
      [[...], [...], ...],
      [[...], [...], ...],
      [[...], [...], ...]
    ]
  }
}

Each pose is an array of frames. Each frame is a 2D array of ${height} rows x ${width} palette indices.

Generate the complete character sprite data now:`;
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

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 32000, // Need more tokens for multiple frames
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text content
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Parse JSON from response
    let result;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      result = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", textContent.text.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate response structure
    if (!result.palette || !Array.isArray(result.palette)) {
      throw new Error("Response missing palette array");
    }

    if (!result.poses || typeof result.poses !== "object") {
      throw new Error("Response missing poses object");
    }

    // Validate each pose has frames
    const requiredPoses = ["idle", "walk", "attack", "hurt", "death"];
    for (const pose of requiredPoses) {
      if (!result.poses[pose] || !Array.isArray(result.poses[pose])) {
        console.warn(`Missing or invalid pose: ${pose}`);
      }
    }

    console.log("Successfully generated character with", result.palette.length, "colors");

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
