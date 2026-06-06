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
import { forgotPassword } from '../api/endpoints';
import type { AuthScreenProps } from '../navigation/types';

type Props = AuthScreenProps<'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const { mutate, loading, error } = useMutation(forgotPassword);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    try {
      const res = await mutate({ email: email.trim() });
      // Demo: kodu direkt göster, gerçekte e-posta ile gelir
      navigation.navigate('ResetPassword', {
        email: email.trim(),
        resetCode: res.resetCode,
      });
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
          <Text style={styles.icon}>🔑</Text>
          <Text style={styles.title}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Kayıtlı e-posta adresinizi girin. Şifre sıfırlama kodunuzu göndereceğiz.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>E-posta Adresi</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@mail.com"
            placeholderTextColor="#86868b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[styles.button, (!email.trim() || loading) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!email.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Kod Gönder</Text>
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
  title: { fontSize: 24, fontWeight: '700', color: '#1d1d1f', textAlign: 'center', marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
    lineHeight: 20,
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
  label: { fontSize: 13, fontWeight: '600', color: '#1d1d1f', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0071e3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  backRow: { alignItems: 'center', marginTop: 20 },
  backText: { fontSize: 14, color: '#0071e3', fontWeight: '500' },
});
