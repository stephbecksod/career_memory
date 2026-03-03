-- Create the audio-recordings storage bucket for voice entries
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('audio-recordings', 'audio-recordings', false, 26214400)  -- 25 MB limit
ON CONFLICT (id) DO NOTHING;

-- RLS policy: users can upload to their own folder (userId/*)
CREATE POLICY "Users can upload own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: users can read their own audio files
CREATE POLICY "Users can read own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: users can delete their own audio files
CREATE POLICY "Users can delete own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role needs full access for the transcribe Edge Function
-- (service role bypasses RLS by default, so no additional policy needed)
