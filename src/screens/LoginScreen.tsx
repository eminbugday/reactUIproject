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
} from 'react-native';
import { useMutation } from '../api/useMutation';
import { login } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import type { AuthScreenProps } from '../navigation/types';

type Props = AuthScreenProps<'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const { mutate, loading, error } = useMutation(login);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      const response = await mutate({ email: email.trim(), password });
      await signIn(response);
    } catch {
      // error state handled by useMutation
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
          <Text style={styles.title}>AutoShop</Text>
          <Text style={styles.subtitle}>Hesabına giriş yap</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="E-posta adresi"
            placeholderTextColor="#86868b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            placeholderTextColor="#86868b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.linkText}>Hesabın yok mu? </Text>
            <Text style={[styles.linkText, styles.linkBold]}>Kayıt Ol</Text>
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>Admin demo: admin@admin.com / Admin123!</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1f',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 24,
  },
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
  button: {
    backgroundColor: '#0071e3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: { fontSize: 14, color: '#86868b' },
  linkBold: { color: '#0071e3', fontWeight: '600' },
  hint: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  hintText: { fontSize: 12, color: '#0071e3', textAlign: 'center' },
});
