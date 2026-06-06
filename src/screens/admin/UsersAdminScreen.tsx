import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery } from '../../api/useQuery';
import { useMutation } from '../../api/useMutation';
import { getUsers, deleteUser } from '../../api/endpoints';
import UserEditModal from '../../components/UserEditModal';
import type { UserDto } from '../../api/types';

export default function UsersAdminScreen() {
  const { data: users, loading, error, refetch } = useQuery<UserDto[]>(getUsers);
  const { mutate: doDelete } = useMutation((id: number) => deleteUser(id));
  const [editTarget, setEditTarget] = useState<UserDto | null>(null);

  const handleDelete = (user: UserDto) => {
    Alert.alert(
      'Kullanıcıyı Sil',
      `"${user.fullName}" adlı kullanıcıyı silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await doDelete(user.id);
              refetch();
            } catch {
              Alert.alert('Hata', 'Kullanıcı silinirken hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Kullanıcı Yönetimi</Text>
          <Text style={styles.headerSub}>
            {users ? `${users.length} kayıtlı kullanıcı` : 'Yükleniyor...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={refetch}>
          <Text style={styles.refreshText}>Yenile</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0071e3" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Ad Soyad</Text>
            <Text style={[styles.th, { flex: 2.5 }]}>E-posta</Text>
            <Text style={[styles.th, { flex: 1 }]}>Rol</Text>
            <Text style={[styles.th, { flex: 1 }]}>Durum</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Kayıt Tarihi</Text>
            <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>İşlem</Text>
          </View>

          {(users ?? []).map((user, idx) => (
            <View
              key={user.id}
              style={[styles.row, idx % 2 === 1 && styles.rowAlt]}
            >
              <View style={[styles.cell, { flex: 2 }]}>
                <Text style={styles.cellName}>{user.fullName}</Text>
                <Text style={styles.cellId}>#{user.id}</Text>
              </View>
              <Text style={[styles.cell, styles.cellText, { flex: 2.5 }]}>
                {user.email}
              </Text>
              <View style={[styles.cell, { flex: 1 }]}>
                <View style={[styles.badge, user.role === 'Admin' ? styles.badgeAdmin : styles.badgeUser]}>
                  <Text style={styles.badgeText}>
                    {user.role === 'Admin' ? 'Admin' : 'Müşteri'}
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, { flex: 1 }]}>
                <View style={[styles.badge, user.isActive ? styles.badgeActive : styles.badgeInactive]}>
                  <Text style={styles.badgeText}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cell, styles.cellText, { flex: 1.5 }]}>
                {formatDate(user.createdDate)}
              </Text>
              <View style={[styles.cell, { width: 90, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }]}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setEditTarget(user)}
                >
                  <Text style={styles.editBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(user)}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <UserEditModal
        user={editTarget}
        visible={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSaved={() => {
          setEditTarget(null);
          refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1d1d1f' },
  headerSub: { fontSize: 13, color: '#86868b', marginTop: 2 },
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d2d7',
  },
  refreshText: { fontSize: 13, fontWeight: '600', color: '#1d1d1f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ff3b30', marginBottom: 12 },
  retryButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  scroll: { flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
    backgroundColor: '#fff',
  },
  rowAlt: { backgroundColor: '#fafafa' },
  cell: { paddingRight: 8 },
  cellName: { fontSize: 14, fontWeight: '600', color: '#1d1d1f' },
  cellId: { fontSize: 11, color: '#86868b', marginTop: 1 },
  cellText: { fontSize: 13, color: '#1d1d1f' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeAdmin: { backgroundColor: '#ffe5e5' },
  badgeUser: { backgroundColor: '#e5f0ff' },
  badgeActive: { backgroundColor: '#e5f9ee' },
  badgeInactive: { backgroundColor: '#f0f0f2' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#1d1d1f' },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 14 },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 14 },
});
