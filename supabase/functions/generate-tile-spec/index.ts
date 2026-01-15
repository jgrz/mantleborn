// Supabase Edge Function: generate-tile-spec
// Generates tile specifications using Claude AI

import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TileSpecRequest {
  // Core
  tileType: string;
  subtype: string;
  width: number;
  height: number;

  // Style
  artStyle: string;
  perspective: string;
  paletteSize: number;
  outlineStyle: string;
  shadingStyle: string;

  // Context
  biome: string;
  season: string;
  timeOfDay: string;
  wearLevel: string;

  // Optional
  customColors?: string[];
  negativePrompt?: string;
  customInstructions?: string;
}

interface TileSpecResponse {
  tileName: string;
  description: string;
  colors: Array<{ name: string; hex: string; usage: string }>;
  pixelGuidance: string;
  variations: string[];
  edgeNotes: string;
  animationSuggestion?: {
    frames: number;
    description: string;
  };
}

function buildPrompt(request: TileSpecRequest): string {
  let prompt = `You are an expert pixel artist specializing in game tile creation. Generate a detailed specification for a tile based on these parameters:

**Tile Type:** ${request.tileType} - ${request.subtype}
**Dimensions:** ${request.width}x${request.height} pixels
**Art Style:** ${request.artStyle.replace(/_/g, " ")}
**Perspective:** ${request.perspective.replace(/_/g, " ")}
**Palette Size:** ${request.paletteSize} colors maximum
**Outline:** ${request.outlineStyle.replace(/_/g, " ")}
**Shading:** ${request.shadingStyle.replace(/_/g, " ")}
**Biome:** ${request.biome}
**Season:** ${request.season}
**Time of Day:** ${request.timeOfDay.replace(/_/g, " ")}
**Condition:** ${request.wearLevel}
`;

  if (request.customColors && request.customColors.length > 0) {
    prompt += `\n**Must include these colors:** ${request.customColors.join(", ")}`;
  }

  if (request.customInstructions) {
    prompt += `\n**Additional instructions:** ${request.customInstructions}`;
  }

  if (request.negativePrompt) {
    prompt += `\n**Avoid:** ${request.negativePrompt}`;
  }

  prompt += `

Generate a JSON specification with:
1. A descriptive name for this tile (tileName)
2. A brief description of what the tile depicts (description)
3. An exact color palette with ${request.paletteSize} or fewer colors (colors array with name, hex, usage)
4. Detailed pixel-by-pixel drawing guidance appropriate for ${request.width}x${request.height} pixels (pixelGuidance)
5. Notes on how edges should work for seamless tiling (edgeNotes)
6. 2-3 variation suggestions (variations array)
7. Optional animation suggestion if applicable (animationSuggestion with frames and description, or null)

Return ONLY valid JSON matching this structure:
{
  "tileName": "string",
  "description": "string",
  "colors": [{"name": "string", "hex": "#XXXXXX", "usage": "string"}],
  "pixelGuidance": "string",
  "variations": ["string"],
  "edgeNotes": "string",
  "animationSuggestion": {"frames": number, "description": "string"} | null
}`;

  return prompt;
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

    const request: TileSpecRequest = await req.json();

    // Validate required fields
    if (!request.tileType || !request.subtype || !request.width || !request.height) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tileType, subtype, width, height" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set defaults
    request.artStyle = request.artStyle || "pixel_16bit";
    request.perspective = request.perspective || "top_down";
    request.paletteSize = request.paletteSize || 16;
    request.outlineStyle = request.outlineStyle || "thin_black";
    request.shadingStyle = request.shadingStyle || "dithered";
    request.biome = request.biome || "fantasy";
    request.season = request.season || "timeless";
    request.timeOfDay = request.timeOfDay || "day";
    request.wearLevel = request.wearLevel || "used";

    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(request);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
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
    let specification: TileSpecResponse;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      specification = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", textContent.text);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify(specification), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating tile spec:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate tile specification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
