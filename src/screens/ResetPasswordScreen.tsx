import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useMutation } from '../api/useMutation';
import { resetPassword } from '../api/endpoints';
import PasswordStrengthBar, { getPasswordStrength } from '../components/PasswordStrengthBar';
import type { AuthScreenProps } from '../navigation/types';

type Props = AuthScreenProps<'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: Props) {
  const { email, resetCode: prefillCode } = route.params;
  const [code, setCode] = useState(prefillCode);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { mutate, loading, error } = useMutation(resetPassword);

  const strength = getPasswordStrength(newPassword);
  const isPasswordValid = strength.score === 4;

  const handleReset = async () => {
    if (!code.trim() || !newPassword) return;
    if (!isPasswordValid) {
      Alert.alert('Zayıf Şifre', 'Şifreniz tüm gereksinimleri karşılamalıdır.');
      return;
    }
    try {
      await mutate({ email, resetCode: code.trim(), newPassword });
      setSuccess(true);
    } catch {
      // handled by useMutation
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Şifre Güncellendi!</Text>
        <Text style={styles.successSub}>
          Yeni şifrenizle giriş yapabilirsiniz.
        </Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.successButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Yeni Şifre</Text>
          <Text style={styles.subtitle}>
            Hesabınız: <Text style={styles.emailText}>{email}</Text>
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Demo bilgilendirmesi */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Modu</Text>
            <Text style={styles.demoText}>
              Gerçek uygulamada kod e-posta ile gelir. Şimdi otomatik dolduruldu:
            </Text>
            <Text style={styles.demoCode}>{prefillCode}</Text>
          </View>

          <Text style={styles.label}>Sıfırlama Kodu</Text>
          <TextInput
            style={styles.input}
            placeholder="6 haneli kod"
            placeholderTextColor="#86868b"
            keyboardType="numeric"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />

          <Text style={styles.label}>Yeni Şifre</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Yeni şifre"
              placeholderTextColor="#86868b"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Strength bar */}
          <PasswordStrengthBar password={newPassword} />

          <TouchableOpacity
            style={[
              styles.button,
              (!isPasswordValid || !code.trim() || loading) && styles.buttonDisabled,
            ]}
            onPress={handleReset}
            disabled={loading || !isPasswordValid || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Şifremi Güncelle</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backText}>← Girişe Dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  icon: { fontSize: 44, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1d1d1f', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#86868b', textAlign: 'center', marginBottom: 20 },
  emailText: { color: '#0071e3', fontWeight: '600' },
  errorText: {
    backgroundColor: '#fff0f0',
    color: '#ff3b30',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoBox: {
    backgroundColor: '#fff8e5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffe0a0',
  },
  demoTitle: { fontSize: 12, fontWeight: '700', color: '#b8860b', marginBottom: 4 },
  demoText: { fontSize: 12, color: '#86868b', marginBottom: 6 },
  demoCode: { fontSize: 22, fontWeight: '800', color: '#1d1d1f', letterSpacing: 4, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#1d1d1f', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    backgroundColor: '#f5f5f7',
    marginBottom: 12,
  },
  passwordInput: { flex: 1, padding: 12, fontSize: 15, color: '#1d1d1f' },
  eyeBtn: { paddingHorizontal: 12 },
  eyeText: { fontSize: 18 },
  button: {
    backgroundColor: '#0071e3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backRow: { alignItems: 'center', marginTop: 20 },
  backText: { fontSize: 14, color: '#0071e3', fontWeight: '500' },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: 40,
  },
  successIcon: { fontSize: 60, marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#1d1d1f', marginBottom: 12 },
  successSub: { fontSize: 14, color: '#86868b', textAlign: 'center', marginBottom: 32 },
  successButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
