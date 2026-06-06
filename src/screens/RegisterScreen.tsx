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
import { register } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthBar, { getPasswordStrength } from '../components/PasswordStrengthBar';
import type { AuthScreenProps } from '../navigation/types';

type Props = AuthScreenProps<'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const { mutate, loading, error } = useMutation(register);

  const strength = getPasswordStrength(password);
  const isPasswordValid = strength.score === 4;

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Eksik Alan', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Zayıf Şifre', 'Şifreniz tüm gereksinimleri karşılamalıdır.');
      return;
    }
    try {
      const response = await mutate({ fullName: fullName.trim(), email: email.trim(), password });
      await signIn(response);
    } catch {
      // handled by useMutation
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.logo}>🚗</Text>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>AutoShop'a üye ol</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor="#86868b"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="E-posta adresi"
            placeholderTextColor="#86868b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password field with show/hide */}
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Şifre"
              placeholderTextColor="#86868b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Strength bar — appears as soon as user types */}
          <PasswordStrengthBar password={password} />

          <TouchableOpacity
            style={[
              styles.button,
              (!isPasswordValid || loading) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading || !isPasswordValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>Zaten hesabın var mı? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Giriş Yap</Text>
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
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#1d1d1f', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#86868b', textAlign: 'center', marginBottom: 24 },
  errorText: {
    backgroundColor: '#fff0f0',
    color: '#ff3b30',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 12,
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
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#1d1d1f',
  },
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
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontSize: 14, color: '#86868b' },
  linkBold: { color: '#0071e3', fontWeight: '600' },
});
