import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '../api/useMutation';
import { createOrder } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import type { UserScreenProps } from '../navigation/types';

type Props = UserScreenProps<'Checkout'>;

export default function CheckoutScreen({ navigation }: Props) {
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [success, setSuccess] = useState(false);
  const { mutate, loading, error } = useMutation(createOrder);

  const formatPrice = (price: number) =>
    price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const handlePlaceOrder = async () => {
    if (!address.trim() || !cardHolder.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      return;
    }
    try {
      await mutate({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: address.trim(),
        cardHolderName: cardHolder.trim(),
        cardNumber: cardNumber.replace(/\s/g, ''),
      });
      clearCart();
      setSuccess(true);
    } catch {
      // handled by useMutation
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.successTitle}>Siparişiniz Alındı!</Text>
        <Text style={styles.successSub}>
          Ödeme entegrasyonu aktif olduğunda burada gerçek ödeme işlemi yapılacak.
          {'\n'}Şu an sipariş sisteme kaydedildi.
        </Text>
        <TouchableOpacity
          style={styles.successButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.successButtonText}>Alışverişe Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Order summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <Text style={styles.summaryName} numberOfLines={1}>
              {item.name} × {item.quantity}
            </Text>
            <Text style={styles.summaryPrice}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Toplam</Text>
          <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
        </View>
      </View>

      {/* Shipping */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Adres, şehir, posta kodu"
          placeholderTextColor="#86868b"
          multiline
          numberOfLines={3}
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ödeme Bilgileri</Text>
        <View style={styles.paymentNotice}>
          <Text style={styles.paymentNoticeText}>
            🔒 Ödeme entegrasyonu yakında eklenecek. Şu an demo amaçlı.
          </Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Kart sahibinin adı"
          placeholderTextColor="#86868b"
          autoCapitalize="words"
          value={cardHolder}
          onChangeText={setCardHolder}
        />
        <TextInput
          style={styles.input}
          placeholder="Kart numarası (16 hane)"
          placeholderTextColor="#86868b"
          keyboardType="numeric"
          maxLength={19}
          value={cardNumber}
          onChangeText={(v) => setCardNumber(formatCardNumber(v))}
        />
        <View style={styles.cardRow}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="AA/YY"
            placeholderTextColor="#86868b"
            keyboardType="numeric"
            maxLength={5}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="CVV"
            placeholderTextColor="#86868b"
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.orderButton, loading && styles.orderButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.orderButtonText}>
            Siparişi Onayla · {formatPrice(total)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  content: { padding: 20 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 14,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f2',
  },
  summaryName: { fontSize: 14, color: '#1d1d1f', flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 14, fontWeight: '600', color: '#1d1d1f' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalLabel: { fontSize: 15, color: '#86868b', fontWeight: '500' },
  totalAmount: { fontSize: 18, fontWeight: '700', color: '#0071e3' },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 10,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  paymentNotice: {
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentNoticeText: { fontSize: 12, color: '#0071e3' },
  cardRow: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  errorText: {
    backgroundColor: '#fff0f0',
    color: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  orderButton: {
    backgroundColor: '#34c759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  orderButtonDisabled: { opacity: 0.6 },
  orderButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: 40,
  },
  successIcon: { fontSize: 64, marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#1d1d1f', marginBottom: 12 },
  successSub: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
