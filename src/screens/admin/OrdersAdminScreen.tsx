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
import { getAllOrders, approveOrder, rejectOrder } from '../../api/endpoints';
import type { OrderDto } from '../../api/types';
import { getCreditData, scoreColor } from '../../utils/creditScore';

const STATUS_LABELS: Record<OrderDto['status'], string> = {
  Pending: 'Beklemede',
  Paid: 'Onaylandı',
  Shipped: 'Kargoda',
  Cancelled: 'Reddedildi',
};

const STATUS_COLORS: Record<OrderDto['status'], { bg: string; text: string }> = {
  Pending: { bg: '#fff8e5', text: '#b45309' },
  Paid: { bg: '#e5f9ee', text: '#15803d' },
  Shipped: { bg: '#e5f0ff', text: '#1d4ed8' },
  Cancelled: { bg: '#fff0f0', text: '#dc2626' },
};

export default function OrdersAdminScreen() {
  const { data: orders, loading, error, refetch } = useQuery<OrderDto[]>(getAllOrders);
  const { mutate: doApprove, loading: approving } = useMutation((id: number) => approveOrder(id));
  const { mutate: doReject, loading: rejecting } = useMutation((id: number) => rejectOrder(id));
  const [actionId, setActionId] = useState<number | null>(null);

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

  const handleApprove = (order: OrderDto) => {
    Alert.alert(
      'Siparişi Onayla',
      `#${order.id} nolu siparişi onaylamak istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            setActionId(order.id);
            try {
              await doApprove(order.id);
              refetch();
            } catch {
              Alert.alert('Hata', 'Sipariş onaylanamadı.');
            } finally {
              setActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = (order: OrderDto) => {
    Alert.alert(
      'Siparişi Reddet',
      `#${order.id} nolu siparişi reddetmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            setActionId(order.id);
            try {
              await doReject(order.id);
              refetch();
            } catch {
              Alert.alert('Hata', 'Sipariş reddedilemedi.');
            } finally {
              setActionId(null);
            }
          },
        },
      ]
    );
  };

  const pendingCount = (orders ?? []).filter((o) => o.status === 'Pending').length;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sipariş Yönetimi</Text>
          <Text style={styles.headerSub}>
            {orders
              ? `${orders.length} sipariş${pendingCount > 0 ? ` · ${pendingCount} onay bekliyor` : ''}`
              : 'Yükleniyor...'}
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
          {(orders ?? []).length === 0 && (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Henüz sipariş bulunmuyor.</Text>
            </View>
          )}

          {(orders ?? []).map((order, idx) => {
            const credit = getCreditData(order.userId);
            const avgScore = Math.floor((credit.ziraat + credit.isBank + credit.garanti) / 3);
            const isLowRisk = credit.hasHighBalance && avgScore >= 600;
            const isActioning = actionId === order.id && (approving || rejecting);

            return (
              <View key={order.id} style={[styles.card, order.status === 'Pending' && styles.cardPending]}>
                {/* Card header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status].bg }]}>
                      <Text style={[styles.statusText, { color: STATUS_COLORS[order.status].text }]}>
                        {STATUS_LABELS[order.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.orderDate}>{formatDate(order.createdDate)}</Text>
                </View>

                {/* User + credit info */}
                <View style={styles.infoRow}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{order.userFullName || `Kullanıcı #${order.userId}`}</Text>
                    <Text style={styles.userEmail}>{order.userEmail}</Text>
                  </View>
                  <View style={styles.creditInfo}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.creditLabel}>Ziraat</Text>
                      <Text style={[styles.creditScore, { color: scoreColor(credit.ziraat) }]}>
                        {credit.ziraat}
                      </Text>
                      <Text style={styles.creditLabel}>İşBank</Text>
                      <Text style={[styles.creditScore, { color: scoreColor(credit.isBank) }]}>
                        {credit.isBank}
                      </Text>
                      <Text style={styles.creditLabel}>Garanti</Text>
                      <Text style={[styles.creditScore, { color: scoreColor(credit.garanti) }]}>
                        {credit.garanti}
                      </Text>
                    </View>
                    <View style={styles.riskRow}>
                      <View style={[styles.riskBadge, { backgroundColor: isLowRisk ? '#e5f9ee' : '#fff0f0' }]}>
                        <Text style={[styles.riskText, { color: isLowRisk ? '#15803d' : '#dc2626' }]}>
                          {isLowRisk ? '✓ Onay önerilir' : '⚠ Risk var'}
                        </Text>
                      </View>
                      <Text style={[styles.balanceTag, { color: credit.hasHighBalance ? '#15803d' : '#86868b' }]}>
                        {credit.hasHighBalance ? '5M+ TL bakiye' : 'Düşük bakiye'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Items & address */}
                <View style={styles.detailRow}>
                  <Text style={styles.addressText} numberOfLines={1}>
                    📍 {order.shippingAddress || '—'}
                  </Text>
                  <Text style={styles.totalText}>{formatPrice(order.totalAmount)}</Text>
                </View>

                <Text style={styles.itemsText} numberOfLines={1}>
                  {order.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                </Text>

                {/* Approve / Reject buttons for Pending orders */}
                {order.status === 'Pending' && (
                  <View style={styles.actionRow}>
                    {isActioning ? (
                      <ActivityIndicator color="#0071e3" />
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.approveBtn}
                          onPress={() => handleApprove(order)}
                        >
                          <Text style={styles.approveBtnText}>✓ Onayla</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => handleReject(order)}
                        >
                          <Text style={styles.rejectBtnText}>✗ Reddet</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })}
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
  scroll: { flex: 1, padding: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  cardPending: {
    borderColor: '#f5a623',
    borderLeftWidth: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderId: { fontSize: 15, fontWeight: '700', color: '#1d1d1f' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderDate: { fontSize: 11, color: '#86868b' },

  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: '#1d1d1f' },
  userEmail: { fontSize: 11, color: '#86868b', marginTop: 2 },
  creditInfo: { flex: 1.4 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  creditLabel: { fontSize: 9, color: '#86868b', fontWeight: '600' },
  creditScore: { fontSize: 13, fontWeight: '700', marginRight: 4 },
  riskRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  riskText: { fontSize: 10, fontWeight: '700' },
  balanceTag: { fontSize: 10, fontWeight: '600' },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressText: { fontSize: 12, color: '#86868b', flex: 1, marginRight: 8 },
  totalText: { fontSize: 15, fontWeight: '700', color: '#0071e3' },
  itemsText: { fontSize: 11, color: '#86868b', marginBottom: 12 },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#e5f9ee',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34c759',
  },
  approveBtnText: { color: '#15803d', fontWeight: '700', fontSize: 14 },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#fff0f0',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  rejectBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
});
