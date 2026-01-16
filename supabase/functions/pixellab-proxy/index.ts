// Supabase Edge Function: pixellab-proxy
// Proxies requests to PixelLab API with server-side authentication
// Keeps API token secure and enables rate limiting

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PIXELLAB_API_URL = "https://api.pixellab.ai/v2";

// Map our action names to PixelLab endpoints
const ENDPOINT_MAP: Record<string, string> = {
  // Characters
  "create_character": "/generate-character-rotations",
  "animate_character": "/animate-with-skeleton",
  "get_character": "/characters",

  // Top-down tilesets
  "create_topdown_tileset": "/generate-tileset",
  "get_topdown_tileset": "/tilesets",

  // Sidescroller tilesets
  "create_sidescroller_tileset": "/generate-sidescroller-tileset",
  "get_sidescroller_tileset": "/sidescroller-tilesets",

  // Isometric tiles
  "create_isometric_tile": "/generate-isometric-tile",
  "get_isometric_tile": "/isometric-tiles",

  // Map objects
  "create_map_object": "/generate-map-object",
  "get_map_object": "/map-objects",

  // Skeleton
  "estimate_skeleton": "/estimate-skeleton",

  // Jobs
  "get_job_status": "/background-jobs",
};

interface ProxyRequest {
  action: string;
  endpoint?: string;
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiToken = Deno.env.get("PIXELLAB_API_TOKEN");
    if (!apiToken) {
      throw new Error("PIXELLAB_API_TOKEN not configured. Add it in Supabase Project Settings → Edge Functions → Secrets");
    }

    const body: ProxyRequest = await req.json();
    const { action, endpoint, ...params } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing required 'action' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine the PixelLab endpoint
    let pixelLabEndpoint = ENDPOINT_MAP[action];

    if (!pixelLabEndpoint) {
      // Try using the endpoint field directly if provided
      if (endpoint) {
        pixelLabEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      } else {
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle GET endpoints (status checks, retrievals)
    const isGetAction = action.startsWith("get_");
    let method = "POST";
    let url = `${PIXELLAB_API_URL}${pixelLabEndpoint}`;

    // For get actions, we need to append IDs to the URL
    if (isGetAction) {
      method = "GET";

      // Append relevant ID to URL
      if (action === "get_character" && params.character_id) {
        url = `${PIXELLAB_API_URL}/characters/${params.character_id}`;
        if (params.include_preview) {
          url += "?include_preview=true";
        }
      } else if (action === "get_topdown_tileset" && params.tileset_id) {
        url = `${PIXELLAB_API_URL}/tilesets/${params.tileset_id}`;
      } else if (action === "get_sidescroller_tileset" && params.tileset_id) {
        url = `${PIXELLAB_API_URL}/sidescroller-tilesets/${params.tileset_id}`;
      } else if (action === "get_isometric_tile" && params.tile_id) {
        url = `${PIXELLAB_API_URL}/isometric-tiles/${params.tile_id}`;
      } else if (action === "get_map_object" && params.object_id) {
        url = `${PIXELLAB_API_URL}/map-objects/${params.object_id}`;
      } else if (action === "get_job_status" && params.job_id) {
        url = `${PIXELLAB_API_URL}/background-jobs/${params.job_id}`;
      }
    }

    // Build request options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    };

    // Add body for POST requests
    if (method === "POST") {
      // Remove our wrapper fields, send clean params to PixelLab
      const pixelLabParams = { ...params };
      delete pixelLabParams.action;
      delete pixelLabParams.endpoint;

      fetchOptions.body = JSON.stringify(pixelLabParams);
    }

    // Make request to PixelLab
    console.log(`PixelLab ${method} ${url}`);
    const response = await fetch(url, fetchOptions);

    // Get response data
    const responseData = await response.json();

    // Check for errors
    if (!response.ok) {
      console.error("PixelLab error:", responseData);
      return new Response(
        JSON.stringify({
          error: responseData.error || responseData.message || "PixelLab request failed",
          details: responseData
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: responseData.data || responseData,
        usage: responseData.usage
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Proxy request failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
