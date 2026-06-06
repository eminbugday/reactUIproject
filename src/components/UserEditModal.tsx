import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '../api/useMutation';
import { updateUser } from '../api/endpoints';
import type { UserDto } from '../api/types';

interface Props {
  user: UserDto | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserEditModal({ user, visible, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Customer' | 'Admin'>('Customer');
  const [isActive, setIsActive] = useState(true);
  const { mutate, loading, error } = useMutation(
    (data: { id: number; fullName: string; email: string; role: 'Customer' | 'Admin'; isActive: boolean }) =>
      updateUser(data.id, { fullName: data.fullName, email: data.email, role: data.role, isActive: data.isActive })
  );

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setRole(user.role);
      setIsActive(user.isActive);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await mutate({ id: user.id, fullName, email, role, isActive });
      onSaved();
    } catch {
      // handled by useMutation
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Kullanıcı Düzenle</Text>
          <Text style={styles.subtitle}>#{user?.id} · {user?.email}</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ad Soyad"
          />

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Rol</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'Customer' && styles.roleActive]}
              onPress={() => setRole('Customer')}
            >
              <Text style={[styles.roleText, role === 'Customer' && styles.roleTextActive]}>
                Müşteri
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'Admin' && styles.roleActiveAdmin]}
              onPress={() => setRole('Admin')}
            >
              <Text style={[styles.roleText, role === 'Admin' && styles.roleTextActive]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Aktif Hesap</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ true: '#34c759', false: '#d2d2d7' }}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 480,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1d1d1f', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#86868b', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#1d1d1f', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 14,
  },
  errorText: {
    backgroundColor: '#fff0f0',
    color: '#ff3b30',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 14,
  },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d2d7',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  roleActive: { backgroundColor: '#0071e3', borderColor: '#0071e3' },
  roleActiveAdmin: { backgroundColor: '#ff3b30', borderColor: '#ff3b30' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#86868b' },
  roleTextActive: { color: '#fff' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actions: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d2d2d7',
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600', color: '#1d1d1f' },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#0071e3',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  saveText: { fontWeight: '700', color: '#fff' },
});
