import { Platform } from 'react-native';
import { supabase, withTimeout } from '@/lib/supabase';
import { decode as base64Decode } from 'base64-arraybuffer';

const AUDIO_BUCKET = 'audio-recordings';
const DEFAULT_RETENTION_DAYS = 30;

interface TranscriptionResult {
  text: string;
  storagePath: string;
  durationSeconds: number;
  expiresAt: string;
}

/**
 * Upload an audio recording to Supabase Storage, call the transcribe Edge
 * Function, and return the transcript along with storage metadata.
 */
export async function transcribeAudio(
  uri: string,
  userId: string,
  mimeType: string,
  retentionDays: number = DEFAULT_RETENTION_DAYS,
): Promise<TranscriptionResult> {
  // Determine file extension from mimeType
  const ext = mimeExtension(mimeType);
  const storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  console.log('[whisper] Uploading audio to Storage:', storagePath);

  // Upload audio file to Supabase Storage
  await uploadAudio(uri, storagePath, mimeType);

  try {
    console.log('[whisper] Calling transcribe Edge Function...');

    const { data, error } = await withTimeout(
      supabase.functions.invoke('transcribe', {
        body: { storagePath },
      }),
      60000, // Whisper can take longer than synthesis
      'Transcription',
    );

    if (error) {
      console.error('[whisper] Edge Function error:', error);
      throw new Error(error.message || 'Transcription request failed');
    }

    if (data?.error) {
      console.error('[whisper] API error:', data.error);
      throw new Error(data.error);
    }

    const text: string = data.text ?? '';
    const durationSeconds: number = data.duration_seconds ?? 0;

    // Compute expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    console.log('[whisper] Transcription complete. Length:', text.length);

    return {
      text,
      storagePath,
      durationSeconds,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (err) {
    // Attempt to clean up the uploaded file on failure
    console.warn('[whisper] Transcription failed, cleaning up uploaded audio...');
    supabase.storage.from(AUDIO_BUCKET).remove([storagePath]).catch(() => {});
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Upload helpers (platform-aware)
// ---------------------------------------------------------------------------

async function uploadAudio(uri: string, storagePath: string, mimeType: string): Promise<void> {
  if (Platform.OS === 'web') {
    await uploadWeb(uri, storagePath, mimeType);
  } else {
    await uploadNative(uri, storagePath, mimeType);
  }
}

/** Web: fetch the blob from the object URL and upload */
async function uploadWeb(uri: string, storagePath: string, mimeType: string): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('[whisper] Storage upload failed (web):', error);
    throw new Error(`Audio upload failed: ${error.message}`);
  }
}

/** Native: read file as base64 via expo-file-system, decode, and upload */
async function uploadNative(uri: string, storagePath: string, mimeType: string): Promise<void> {
  const FileSystem = require('expo-file-system');
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const arrayBuffer = base64Decode(base64);

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('[whisper] Storage upload failed (native):', error);
    throw new Error(`Audio upload failed: ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function mimeExtension(mimeType: string): string {
  if (mimeType.includes('m4a') || mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
}
