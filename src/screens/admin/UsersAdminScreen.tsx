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
import { getCreditData, scoreColor, formatBalance } from '../../utils/creditScore';

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
        <ScrollView style={styles.scroll} horizontal={false}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { width: 130 }]}>Ad Soyad</Text>
                <Text style={[styles.th, { width: 160 }]}>E-posta</Text>
                <Text style={[styles.th, { width: 70 }]}>Rol</Text>
                <Text style={[styles.th, { width: 60 }]}>Durum</Text>
                <Text style={[styles.th, { width: 90 }]}>Kayıt</Text>
                <Text style={[styles.th, { width: 70, textAlign: 'center' }]}>Ziraat</Text>
                <Text style={[styles.th, { width: 70, textAlign: 'center' }]}>İşBank</Text>
                <Text style={[styles.th, { width: 70, textAlign: 'center' }]}>Garanti</Text>
                <Text style={[styles.th, { width: 120, textAlign: 'right' }]}>Bakiye</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'right' }]}>İşlem</Text>
              </View>

              {(users ?? []).map((user, idx) => {
                const credit = getCreditData(user.id);
                return (
                  <View
                    key={user.id}
                    style={[styles.row, idx % 2 === 1 && styles.rowAlt]}
                  >
                    {/* Name */}
                    <View style={{ width: 130, paddingRight: 8 }}>
                      <Text style={styles.cellName} numberOfLines={1}>{user.fullName}</Text>
                      <Text style={styles.cellId}>#{user.id}</Text>
                    </View>

                    {/* Email */}
                    <Text style={[styles.cellText, { width: 160, paddingRight: 8 }]} numberOfLines={1}>
                      {user.email}
                    </Text>

                    {/* Role */}
                    <View style={{ width: 70, paddingRight: 8 }}>
                      <View style={[styles.badge, user.role === 'Admin' ? styles.badgeAdmin : styles.badgeUser]}>
                        <Text style={styles.badgeText}>
                          {user.role === 'Admin' ? 'Admin' : 'Müşteri'}
                        </Text>
                      </View>
                    </View>

                    {/* Status */}
                    <View style={{ width: 60, paddingRight: 8 }}>
                      <View style={[styles.badge, user.isActive ? styles.badgeActive : styles.badgeInactive]}>
                        <Text style={styles.badgeText}>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </Text>
                      </View>
                    </View>

                    {/* Date */}
                    <Text style={[styles.cellText, { width: 90, paddingRight: 8, fontSize: 11 }]}>
                      {formatDate(user.createdDate)}
                    </Text>

                    {/* Ziraat score */}
                    <View style={{ width: 70, alignItems: 'center', paddingRight: 8 }}>
                      <Text style={[styles.scoreText, { color: scoreColor(credit.ziraat) }]}>
                        {credit.ziraat}
                      </Text>
                      <Text style={styles.scoreBank}>Ziraat</Text>
                    </View>

                    {/* İşBank score */}
                    <View style={{ width: 70, alignItems: 'center', paddingRight: 8 }}>
                      <Text style={[styles.scoreText, { color: scoreColor(credit.isBank) }]}>
                        {credit.isBank}
                      </Text>
                      <Text style={styles.scoreBank}>İşBank</Text>
                    </View>

                    {/* Garanti score */}
                    <View style={{ width: 70, alignItems: 'center', paddingRight: 8 }}>
                      <Text style={[styles.scoreText, { color: scoreColor(credit.garanti) }]}>
                        {credit.garanti}
                      </Text>
                      <Text style={styles.scoreBank}>Garanti</Text>
                    </View>

                    {/* Balance */}
                    <View style={{ width: 120, alignItems: 'flex-end', paddingRight: 8 }}>
                      <Text
                        style={[
                          styles.balanceText,
                          credit.hasHighBalance ? styles.balanceHigh : styles.balanceLow,
                        ]}
                        numberOfLines={1}
                      >
                        {formatBalance(credit.balance)}
                      </Text>
                      {credit.hasHighBalance ? (
                        <Text style={styles.balanceTag}>✓ 5M+</Text>
                      ) : (
                        <Text style={styles.balanceTagLow}>✗ Düşük</Text>
                      )}
                    </View>

                    {/* Actions */}
                    <View style={{ width: 80, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
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
                );
              })}
            </View>
          </ScrollView>
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
    fontSize: 10,
    fontWeight: '700',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
    backgroundColor: '#fff',
  },
  rowAlt: { backgroundColor: '#fafafa' },
  cellName: { fontSize: 13, fontWeight: '600', color: '#1d1d1f' },
  cellId: { fontSize: 10, color: '#86868b', marginTop: 1 },
  cellText: { fontSize: 12, color: '#1d1d1f' },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeAdmin: { backgroundColor: '#ffe5e5' },
  badgeUser: { backgroundColor: '#e5f0ff' },
  badgeActive: { backgroundColor: '#e5f9ee' },
  badgeInactive: { backgroundColor: '#f0f0f2' },
  badgeText: { fontSize: 10, fontWeight: '600', color: '#1d1d1f' },
  scoreText: { fontSize: 13, fontWeight: '700' },
  scoreBank: { fontSize: 9, color: '#86868b', marginTop: 1 },
  balanceText: { fontSize: 11, fontWeight: '700' },
  balanceHigh: { color: '#34c759' },
  balanceLow: { color: '#86868b' },
  balanceTag: { fontSize: 9, color: '#34c759', fontWeight: '700', marginTop: 1 },
  balanceTagLow: { fontSize: 9, color: '#ff3b30', fontWeight: '600', marginTop: 1 },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 13 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 13 },
});
