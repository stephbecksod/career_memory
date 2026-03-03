import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const WHISPER_MODEL = "whisper-1";
const AUDIO_BUCKET = "audio-recordings";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Transcribe Edge Function
 *
 * Receives: { storagePath: string }
 * Downloads audio from Supabase Storage, sends to OpenAI Whisper,
 * returns: { text: string, duration_seconds: number }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials not configured");
    }

    // Validate auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { storagePath } = (await req.json()) as { storagePath: string };

    if (!storagePath) {
      return new Response(
        JSON.stringify({ error: "Missing storagePath" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("[transcribe] Downloading audio from Storage:", storagePath);

    // Download audio from Supabase Storage using service role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(AUDIO_BUCKET)
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error("[transcribe] Download failed:", downloadError);
      throw new Error(`Failed to download audio: ${downloadError?.message ?? "no data"}`);
    }

    console.log("[transcribe] Audio downloaded, size:", fileData.size, "bytes");

    // Determine filename extension from storage path
    const ext = storagePath.split(".").pop() ?? "webm";
    const filename = `recording.${ext}`;

    // Build multipart form data for Whisper API
    const formData = new FormData();
    formData.append("file", new File([fileData], filename, { type: fileData.type || "audio/webm" }));
    formData.append("model", WHISPER_MODEL);
    formData.append("response_format", "verbose_json");

    console.log("[transcribe] Calling Whisper API...");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("[transcribe] Whisper API error:", whisperResponse.status, errorText);
      throw new Error(`Whisper API error (${whisperResponse.status}): ${errorText}`);
    }

    const whisperResult = await whisperResponse.json();
    const text = whisperResult.text?.trim() ?? "";
    const durationSeconds = Math.round(whisperResult.duration ?? 0);

    console.log("[transcribe] Transcription complete. Length:", text.length, "Duration:", durationSeconds, "s");

    return new Response(
      JSON.stringify({ text, duration_seconds: durationSeconds }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[transcribe] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
