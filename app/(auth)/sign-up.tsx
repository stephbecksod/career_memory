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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp, loading, error } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!firstName.trim() || !email.trim() || !password) return;
    const result = await signUp(email.trim(), password, firstName.trim());
    if (result) {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.inner}>
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

  const isDisabled = !firstName.trim() || !email.trim() || !password || loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Career Memory</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.umber}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoComplete="given-name"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.umber}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.umber}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={isDisabled}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextBold}>Sign in</Text>
          </Text>
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
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 32,
    color: colors.walnut,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.umber,
    textAlign: 'center',
    marginBottom: 32,
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
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.walnut,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.moss,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.white,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.umber,
  },
  linkTextBold: {
    fontFamily: 'DMSans_500Medium',
    color: colors.moss,
  },
});
