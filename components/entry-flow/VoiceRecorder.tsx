import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/colors';
import { startRecording, requestMicPermission, type RecordingHandle } from '@/lib/audio';
import { transcribeAudio } from '@/lib/whisper';
import { useUserStore } from '@/stores/userStore';
import type { AudioMeta } from '@/types/app';

type RecorderState = 'idle' | 'recording' | 'transcribing' | 'error';

interface VoiceRecorderProps {
  onTranscript: (text: string, meta: AudioMeta) => void;
  disabled?: boolean;
}

const MAX_DURATION_SEC = 5 * 60;

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const recordingRef = useRef<RecordingHandle | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userId = useUserStore((s) => s.authUser?.id);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recordingRef.current?.cancel();
    };
  }, []);

  const autoStopRef = useRef(false);

  const startTimer = useCallback(() => {
    setElapsed(0);
    autoStopRef.current = false;
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= MAX_DURATION_SEC && !autoStopRef.current) {
          autoStopRef.current = true;
          // Clear interval first, then stop async outside setState
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Trigger stop outside the setState callback
          setTimeout(() => {
            recordingRef.current?.stop().catch(() => {});
          }, 0);
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleStart = async () => {
    setErrorMsg('');
    try {
      if (!userId) {
        setErrorMsg('Please sign in to record.');
        setState('error');
        return;
      }

      const permitted = await requestMicPermission();
      if (!permitted) {
        setErrorMsg('Microphone access denied. Check your browser or device settings.');
        setState('error');
        return;
      }

      const handle = await startRecording();
      recordingRef.current = handle;
      setState('recording');
      startTimer();
    } catch (err) {
      console.error('[VoiceRecorder] Start failed:', err);
      setErrorMsg('Could not start recording. Please try again.');
      setState('error');
    }
  };

  const handleStop = async () => {
    stopTimer();

    if (!recordingRef.current) {
      setState('idle');
      return;
    }

    try {
      const result = await recordingRef.current.stop();
      recordingRef.current = null;
      setState('transcribing');

      if (!userId) throw new Error('Not signed in');

      const transcript = await transcribeAudio(
        result.uri,
        userId,
        result.mimeType,
      );

      if (!transcript.text.trim()) {
        setErrorMsg('No speech detected. Try again in a quieter environment.');
        setState('error');
        return;
      }

      onTranscript(transcript.text, {
        storagePath: transcript.storagePath,
        durationSeconds: transcript.durationSeconds,
        expiresAt: transcript.expiresAt,
      });
      setState('idle');
      setElapsed(0);
    } catch (err) {
      console.error('[VoiceRecorder] Stop/transcribe failed:', err);
      setErrorMsg('Transcription failed. Please try again.');
      setState('error');
    }
  };

  const handleRetry = () => {
    setErrorMsg('');
    setState('idle');
    setElapsed(0);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (state === 'error') {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={[styles.micButton, styles.errorButton]}
          onPress={handleRetry}
          disabled={disabled}
        >
          <FontAwesome name="refresh" size={18} color={colors.danger} />
        </TouchableOpacity>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
      </View>
    );
  }

  if (state === 'transcribing') {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.micButton, styles.transcribingButton]}>
          <ActivityIndicator size="small" color={colors.white} />
        </View>
        <Text style={styles.statusLabel}>Transcribing...</Text>
      </View>
    );
  }

  if (state === 'recording') {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={[styles.micButton, styles.recordingButton]}
          onPress={handleStop}
        >
          <FontAwesome name="stop" size={14} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        <Text style={styles.statusLabel}>Tap to stop</Text>
      </View>
    );
  }

  // idle
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.micButton}
        onPress={handleStart}
        disabled={disabled}
      >
        <FontAwesome name="microphone" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 4,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.moss,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: colors.danger,
  },
  transcribingButton: {
    backgroundColor: colors.moss,
  },
  errorButton: {
    backgroundColor: colors.dangerFaint,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  timerText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  statusLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.umber,
    marginTop: 2,
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.danger,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 100,
  },
});
