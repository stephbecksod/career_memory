import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const AUDIO_BUCKET = "audio-recordings";
const BATCH_LIMIT = 100;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Cleanup Audio Edge Function
 *
 * Deletes expired audio files from Storage and clears their DB references.
 * Designed to run on a nightly cron schedule.
 *
 * Query: achievement_responses WHERE audio_expires_at < now() AND audio_file_url IS NOT NULL
 * Actions: delete file from Storage, null out audio_file_url + audio_expires_at on the row
 * Limit: 100 rows per invocation to stay within Edge Function timeout
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase service credentials not configured");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find expired audio rows
    const { data: expiredRows, error: queryError } = await supabaseAdmin
      .from("achievement_responses")
      .select("response_id, audio_file_url")
      .not("audio_file_url", "is", null)
      .lt("audio_expires_at", new Date().toISOString())
      .limit(BATCH_LIMIT);

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }

    if (!expiredRows || expiredRows.length === 0) {
      console.log("[cleanup-audio] No expired audio files found");
      return new Response(
        JSON.stringify({ deleted: 0, errors: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[cleanup-audio] Found ${expiredRows.length} expired audio files`);

    let deleted = 0;
    let errors = 0;

    for (const row of expiredRows) {
      try {
        // Extract storage path from the URL
        // audio_file_url is stored as the storage path (e.g. "user-id/filename.webm")
        const storagePath = row.audio_file_url;

        // Delete file from Storage
        const { error: storageError } = await supabaseAdmin.storage
          .from(AUDIO_BUCKET)
          .remove([storagePath]);

        if (storageError) {
          console.error(`[cleanup-audio] Storage delete failed for ${storagePath}:`, storageError);
          // Continue even if storage delete fails — still clear the DB reference
        }

        // Clear DB references
        const { error: updateError } = await supabaseAdmin
          .from("achievement_responses")
          .update({
            audio_file_url: null,
            audio_expires_at: null,
          })
          .eq("response_id", row.response_id);

        if (updateError) {
          console.error(`[cleanup-audio] DB update failed for ${row.response_id}:`, updateError);
          errors++;
          continue;
        }

        deleted++;
      } catch (rowError) {
        console.error(`[cleanup-audio] Error processing row ${row.response_id}:`, rowError);
        errors++;
      }
    }

    console.log(`[cleanup-audio] Complete. Deleted: ${deleted}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({ deleted, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[cleanup-audio] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
