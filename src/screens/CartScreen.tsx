import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useCart } from '../context/CartContext';
import type { UserScreenProps } from '../navigation/types';

type Props = UserScreenProps<'Cart'>;

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80';

export default function CartScreen({ navigation }: Props) {
  const { items, removeItem, updateQuantity, total } = useCart();

  const formatPrice = (price: number) =>
    price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Sepetiniz boş</Text>
        <Text style={styles.emptySub}>Araç listesine dönüp ürün ekleyebilirsiniz.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.backButtonText}>Araçlara Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Image
              source={{ uri: item.imageUrl?.startsWith('http') ? item.imageUrl : FALLBACK_IMAGE }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.lineTotal}>
                {formatPrice(item.price * item.quantity)}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeItem(item.id)}
              >
                <Text style={styles.removeText}>Kaldır</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Summary bar */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Toplam</Text>
          <Text style={styles.summaryTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutText}>Ödemeye Geç →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  content: { padding: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1d1d1f', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#86868b', textAlign: 'center', marginBottom: 24 },
  backButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  item: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  itemImage: { width: 100, height: 100 },
  itemInfo: { flex: 1, padding: 12 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#1d1d1f', marginBottom: 4 },
  itemPrice: { fontSize: 13, color: '#86868b', marginBottom: 10 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#f0f0f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '600', color: '#1d1d1f' },
  qtyText: { fontSize: 15, fontWeight: '600', color: '#1d1d1f', minWidth: 20, textAlign: 'center' },
  itemRight: {
    padding: 12,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  lineTotal: { fontSize: 15, fontWeight: '700', color: '#1d1d1f' },
  removeButton: { padding: 4 },
  removeText: { fontSize: 13, color: '#ff3b30', fontWeight: '500' },
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryLabel: { fontSize: 16, color: '#86868b', fontWeight: '500' },
  summaryTotal: { fontSize: 20, fontWeight: '700', color: '#1d1d1f' },
  checkoutButton: {
    backgroundColor: '#34c759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
