import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/colors';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    const result = await signIn(email.trim(), password);
    if (result) {
      // Check if onboarding is complete
      try {
        const { data } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('user_id', result.user.id)
          .is('deleted_at', null)
          .limit(1);

        if (data && data.length > 0 && !data[0].onboarding_complete) {
          router.replace('/(auth)/onboarding');
          return;
        }
      } catch {
        // If check fails, proceed to tabs
      }
      router.replace('/(tabs)');
    }
  };

  const isDisabled = !email.trim() || !password || loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* App logo */}
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[colors.mossDeep, colors.moss]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoSquare}
            >
              <FontAwesome name="star" size={16} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
            <Text style={styles.logoText}>Career Memory</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your account.</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Email field */}
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.umber}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          {/* Password field */}
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor={colors.umber}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={8}
            >
              <FontAwesome
                name={showPassword ? 'eye-slash' : 'eye'}
                size={16}
                color={colors.umber}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign in button */}
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isDisabled}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons (UI-only for V1) */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={16} color={colors.walnut} />
              <Text style={styles.socialLabel}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={17} color={colors.walnut} />
              <Text style={styles.socialLabel}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom link */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.bottomLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  inner: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 36,
  },
  logoSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: colors.walnut,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: colors.walnut,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
    marginBottom: 28,
  },
  error: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.dangerFaint,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fieldLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    color: colors.umber,
    marginBottom: 7,
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.walnut,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    marginBottom: 6,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.walnut,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 2,
  },
  forgotText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.moss,
  },
  button: {
    backgroundColor: colors.moss,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(173,156,142,0.3)',
  },
  buttonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.umber,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 12,
  },
  socialLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13.5,
    color: colors.walnut,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingBottom: 44,
  },
  bottomText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13.5,
    color: colors.umber,
  },
  bottomLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13.5,
    color: colors.moss,
  },
});
