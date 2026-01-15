// Supabase Edge Function: generate-tile-spec
// Generates actual tile pixel data using Claude AI

import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TileRequest {
  tileType: string;
  subtype: string;
  width: number;
  height: number;
  artStyle?: string;
  perspective?: string;
  paletteSize?: number;
  outlineStyle?: string;
  shadingStyle?: string;
  biome?: string;
  season?: string;
  timeOfDay?: string;
  wearLevel?: string;
  customColors?: string[];
  customInstructions?: string;
}

function buildPrompt(request: TileRequest): string {
  const width = request.width;
  const height = request.height;
  const totalPixels = width * height;

  return `You are an expert pixel artist. Your task is to generate actual pixel data for a game tile.

## TILE SPECIFICATIONS

**Type:** ${request.tileType} - ${request.subtype}
**Dimensions:** ${width}x${height} pixels (${totalPixels} total pixels)
**Art Style:** ${(request.artStyle || "pixel_16bit").replace(/_/g, " ")}
**Perspective:** ${(request.perspective || "top_down").replace(/_/g, " ")}
**Max Colors:** ${request.paletteSize || 16}
**Outline:** ${(request.outlineStyle || "thin_black").replace(/_/g, " ")}
**Shading:** ${(request.shadingStyle || "dithered").replace(/_/g, " ")}
**Biome/Theme:** ${request.biome || "fantasy"}
**Condition:** ${request.wearLevel || "used"}
${request.customColors?.length ? `**Must use colors:** ${request.customColors.join(", ")}` : ""}
${request.customInstructions ? `**Special instructions:** ${request.customInstructions}` : ""}

## YOUR TASK

Generate a ${width}x${height} pixel tile. Output the EXACT pixel colors as a 2D array of hex values.

Think carefully about:
1. The overall composition and what this tile should depict
2. A cohesive color palette (max ${request.paletteSize || 16} colors)
3. Proper shading and depth
4. How this tile might tile/repeat seamlessly if applicable

## OUTPUT FORMAT

Return ONLY valid JSON with this exact structure:
{
  "tileName": "descriptive_name",
  "description": "Brief description of the tile",
  "palette": ["#hex1", "#hex2", ...],
  "pixels": [
    ["#hex", "#hex", "#hex", ...],
    ["#hex", "#hex", "#hex", ...],
    ...
  ]
}

The "pixels" array must have exactly ${height} rows, and each row must have exactly ${width} hex color values.
Use "#00000000" for transparent pixels.

Generate the complete pixel data now:`;
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

    const request: TileRequest = await req.json();

    // Validate required fields
    if (!request.tileType || !request.subtype || !request.width || !request.height) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tileType, subtype, width, height" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit size for reasonable generation
    if (request.width > 32 || request.height > 32) {
      return new Response(
        JSON.stringify({ error: "Maximum tile size is 32x32 for AI generation" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(request);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000, // Need more tokens for pixel data
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
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate pixel array dimensions
    if (!result.pixels || !Array.isArray(result.pixels)) {
      throw new Error("Response missing pixels array");
    }

    if (result.pixels.length !== request.height) {
      console.warn(`Expected ${request.height} rows, got ${result.pixels.length}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating tile:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate tile" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
