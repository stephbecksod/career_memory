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

  // Native: use expo-audio
  const { requestRecordingPermissionsAsync } = require('expo-audio');
  const { granted } = await requestRecordingPermissionsAsync();
  return granted;
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
// Native (iOS/Android) — expo-audio
// ---------------------------------------------------------------------------

async function startNativeRecording(): Promise<RecordingHandle> {
  const { setAudioModeAsync, RecordingPresets } = require('expo-audio');
  const AudioModule = require('expo-audio/build/AudioModule').default;

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  const { createRecordingOptions } = require('expo-audio/build/utils/options');
  const opts = createRecordingOptions(RecordingPresets.HIGH_QUALITY);
  const recorder = new AudioModule.AudioRecorder(opts);

  await recorder.prepareToRecordAsync();
  recorder.record();

  const startTime = Date.now();

  // Auto-stop at max duration
  const maxTimer = setTimeout(async () => {
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
    } catch {
      // Already stopped
    }
  }, MAX_DURATION_MS);

  return {
    stop: async (): Promise<RecordingResult> => {
      clearTimeout(maxTimer);
      if (recorder.isRecording) {
        await recorder.stop();
      }
      const uri = recorder.uri;
      if (!uri) throw new Error('No recording URI available');

      const durationMs = Date.now() - startTime;

      // Reset audio mode
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
      });

      return {
        uri,
        durationMs,
        mimeType: 'audio/m4a',
      };
    },
    cancel: () => {
      clearTimeout(maxTimer);
      recorder.stop().catch(() => {});
      setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: false,
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
