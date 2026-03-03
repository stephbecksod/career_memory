import { useState, useMemo } from 'react';
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
import { colors } from '@/constants/colors';

type PasswordStrength = 'weak' | 'moderate' | 'strong' | null;

function getPasswordStrength(pw: string): PasswordStrength {
  if (pw.length === 0) return null;
  if (pw.length < 8) return 'weak';
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong';
  return 'moderate';
}

const strengthColors: Record<string, string> = {
  weak: colors.danger,
  moderate: colors.amber,
  strong: colors.moss,
};

const strengthLabels: Record<string, string> = {
  weak: 'Too short',
  moderate: 'Moderate',
  strong: 'Strong',
};

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSignUp = async () => {
    if (!email.trim() || !password || password.length < 8) return;
    const result = await signUp(email.trim(), password);
    if (result) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successInner}>
          <Text style={styles.title}>Account created</Text>
          <Text style={styles.successText}>
            Check your email to confirm your account, then sign in below.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(auth)/sign-in')}
          >
            <Text style={styles.buttonText}>Go to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
  const isDisabled = !email.trim() || password.length < 8 || !passwordsMatch || loading;

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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Free to start. No credit card needed.</Text>

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

          {/* Password field with strength meter */}
          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.umber}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
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

          {/* Strength meter */}
          {strength && (
            <View style={styles.strengthSection}>
              <View style={styles.strengthBars}>
                {[1, 2, 3].map((i) => {
                  const active =
                    (strength === 'weak' && i <= 1) ||
                    (strength === 'moderate' && i <= 2) ||
                    strength === 'strong';
                  return (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: active ? strengthColors[strength] : colors.cardBorder },
                      ]}
                    />
                  );
                })}
              </View>
              <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                {strengthLabels[strength]}
              </Text>
            </View>
          )}

          {/* Confirm password field */}
          <Text style={[styles.fieldLabel, { marginTop: 6 }]}>CONFIRM PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter your password"
              placeholderTextColor={colors.umber}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword((v) => !v)}
              hitSlop={8}
            >
              <FontAwesome
                name={showConfirmPassword ? 'eye-slash' : 'eye'}
                size={16}
                color={colors.umber}
              />
            </TouchableOpacity>
          </View>
          {showMismatch && (
            <Text style={styles.mismatchText}>Passwords don't match</Text>
          )}

          {/* Create account button */}
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled, { marginTop: strength ? 20 : 14 }]}
            onPress={handleSignUp}
            disabled={isDisabled}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Create account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
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

          {/* Terms text */}
          <Text style={styles.termsText}>
            By continuing you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom link */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.bottomLink}>Sign in</Text>
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
  successInner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
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
    marginBottom: 24,
  },
  successText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.umber,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
    marginBottom: 8,
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
  strengthSection: {
    marginBottom: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
  mismatchText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.danger,
    marginBottom: 4,
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
    marginBottom: 14,
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
  termsText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11.5,
    color: colors.umber,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: colors.moss,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
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
