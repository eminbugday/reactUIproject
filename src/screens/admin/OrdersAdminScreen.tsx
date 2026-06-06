import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '../../api/useQuery';
import { getAllOrders } from '../../api/endpoints';
import type { OrderDto } from '../../api/types';

const STATUS_LABELS: Record<OrderDto['status'], string> = {
  Pending: 'Beklemede',
  Paid: 'Ödendi',
  Shipped: 'Kargoda',
  Cancelled: 'İptal',
};

const STATUS_COLORS: Record<OrderDto['status'], string> = {
  Pending: '#fff3e5',
  Paid: '#e5f9ee',
  Shipped: '#e5f0ff',
  Cancelled: '#fff0f0',
};

export default function OrdersAdminScreen() {
  const { data: orders, loading, error, refetch } = useQuery<OrderDto[]>(getAllOrders);

  const formatPrice = (n: number) =>
    n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sipariş Yönetimi</Text>
          <Text style={styles.headerSub}>
            {orders ? `${orders.length} sipariş` : 'Yükleniyor...'}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
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
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 50 }]}>#</Text>
            <Text style={[styles.th, { flex: 1 }]}>Kullanıcı</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>Tarih</Text>
            <Text style={[styles.th, { flex: 1 }]}>Toplam</Text>
            <Text style={[styles.th, { width: 80 }]}>Durum</Text>
            <Text style={[styles.th, { flex: 1 }]}>Adres</Text>
          </View>

          {(orders ?? []).length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Henüz sipariş bulunmuyor.</Text>
            </View>
          )}

          {(orders ?? []).map((order, idx) => (
            <View key={order.id} style={[styles.row, idx % 2 === 1 && styles.rowAlt]}>
              <Text style={[styles.cell, styles.cellId, { width: 50 }]}>
                #{order.id}
              </Text>
              <Text style={[styles.cell, styles.cellText, { flex: 1 }]}>
                User #{order.userId}
              </Text>
              <Text style={[styles.cell, styles.cellText, { flex: 1.5 }]}>
                {formatDate(order.createdDate)}
              </Text>
              <Text style={[styles.cell, styles.cellPrice, { flex: 1 }]}>
                {formatPrice(order.totalAmount)}
              </Text>
              <View style={{ width: 80, paddingRight: 8 }}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
                  <Text style={styles.statusText}>
                    {STATUS_LABELS[order.status]}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cell, styles.cellText, { flex: 1 }]} numberOfLines={2}>
                {order.shippingAddress || '—'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
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
  refreshBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d2d7',
  },
  refreshText: { fontSize: 13, fontWeight: '600', color: '#1d1d1f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { color: '#ff3b30', marginBottom: 12, fontSize: 14 },
  retryBtn: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#86868b', fontSize: 14 },
  scroll: { flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cellId: { fontSize: 12, color: '#86868b', fontWeight: '600' },
  cellText: { fontSize: 13, color: '#1d1d1f' },
  cellPrice: { fontSize: 13, fontWeight: '700', color: '#0071e3' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#1d1d1f' },
});
