import { Platform } from 'react-native';

export interface RecordingResult {
  uri: string;
  durationMs: number;
  mimeType: string;
}

export interface RecordingHandle {
  stop: () => Promise<RecordingResult>;
  cancel: () => void;
}

const MAX_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Request microphone permission.
 * Returns true if granted, false otherwise.
 */
export async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream immediately
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }

  // Native: use expo-av
  const { Audio } = require('expo-av');
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Start an audio recording.
 * Returns a handle with stop() and cancel() methods.
 * Automatically stops after 5 minutes.
 */
export async function startRecording(): Promise<RecordingHandle> {
  if (Platform.OS === 'web') {
    return startWebRecording();
  }
  return startNativeRecording();
}

// ---------------------------------------------------------------------------
// Native (iOS/Android) — expo-av
// ---------------------------------------------------------------------------

async function startNativeRecording(): Promise<RecordingHandle> {
  const { Audio } = require('expo-av');

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const recording = new Audio.Recording();
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();

  const startTime = Date.now();
  let cancelled = false;

  // Auto-stop at max duration
  const maxTimer = setTimeout(async () => {
    try {
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
      }
    } catch {
      // Already stopped
    }
  }, MAX_DURATION_MS);

  return {
    stop: async (): Promise<RecordingResult> => {
      clearTimeout(maxTimer);
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.stopAndUnloadAsync();
      }
      const uri = recording.getURI();
      if (!uri) throw new Error('No recording URI available');

      const durationMs = Date.now() - startTime;

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      });

      return {
        uri,
        durationMs,
        mimeType: 'audio/m4a',
      };
    },
    cancel: () => {
      cancelled = true;
      clearTimeout(maxTimer);
      recording.stopAndUnloadAsync().catch(() => {});
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
      }).catch(() => {});
    },
  };
}

// ---------------------------------------------------------------------------
// Web — MediaRecorder API
// ---------------------------------------------------------------------------

async function startWebRecording(): Promise<RecordingHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream, { mimeType: getWebMimeType() });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start(1000); // collect chunks every second
  const startTime = Date.now();

  // Auto-stop at max duration
  const maxTimer = setTimeout(() => {
    if (recorder.state === 'recording') {
      recorder.stop();
    }
  }, MAX_DURATION_MS);

  return {
    stop: () =>
      new Promise<RecordingResult>((resolve, reject) => {
        clearTimeout(maxTimer);

        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const uri = URL.createObjectURL(blob);
          resolve({
            uri,
            durationMs: Date.now() - startTime,
            mimeType: recorder.mimeType || 'audio/webm',
          });
        };

        recorder.onerror = (e) => {
          stream.getTracks().forEach((t) => t.stop());
          reject(new Error('Recording failed'));
        };

        if (recorder.state === 'recording') {
          recorder.stop();
        } else {
          // Already stopped (e.g. by max timer)
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const uri = URL.createObjectURL(blob);
          resolve({
            uri,
            durationMs: Date.now() - startTime,
            mimeType: recorder.mimeType || 'audio/webm',
          });
        }
      }),
    cancel: () => {
      clearTimeout(maxTimer);
      if (recorder.state === 'recording') {
        recorder.stop();
      }
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

function getWebMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
  return 'audio/webm';
}
