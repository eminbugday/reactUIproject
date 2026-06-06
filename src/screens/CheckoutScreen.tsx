import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useMutation } from '../api/useMutation';
import { createOrder } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import type { UserScreenProps } from '../navigation/types';

type Props = UserScreenProps<'Checkout'>;

function CreditCard({
  cardHolder,
  cardNumber,
  expiry,
  cvv,
  isFlipped,
}: {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  isFlipped: boolean;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: isFlipped ? 180 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontRotate = anim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backRotate = anim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });

  const maskedNumber = cardNumber
    ? cardNumber.replace(/\s/g, '').padEnd(16, '•').match(/.{1,4}/g)!.join(' ')
    : '•••• •••• •••• ••••';

  return (
    <View style={card.wrapper}>
      {/* Front */}
      <Animated.View
        style={[card.face, card.front, { transform: [{ rotateY: frontRotate }] }]}
      >
        <View style={card.chip} />
        <Text style={card.network}>VISA</Text>
        <Text style={card.number}>{maskedNumber}</Text>
        <View style={card.bottomRow}>
          <View>
            <Text style={card.label}>KART SAHİBİ</Text>
            <Text style={card.holderName} numberOfLines={1}>
              {cardHolder.trim() || 'AD SOYAD'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={card.label}>GEÇERLİLİK</Text>
            <Text style={card.expiryText}>{expiry || 'AA/YY'}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Back */}
      <Animated.View
        style={[card.face, card.back, { transform: [{ rotateY: backRotate }] }]}
      >
        <View style={card.magneticStrip} />
        <View style={card.signatureArea}>
          <View style={card.signatureLines} />
          <View style={card.cvvBox}>
            <Text style={card.cvvText}>{cvv || '•••'}</Text>
          </View>
        </View>
        <Text style={card.backNote}>CVV / CVC</Text>
      </Animated.View>
    </View>
  );
}

export default function CheckoutScreen({ navigation }: Props) {
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cvvFocused, setCvvFocused] = useState(false);
  const [success, setSuccess] = useState(false);
  const { mutate, loading, error } = useMutation(createOrder);

  const formatPrice = (price: number) =>
    price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const canSubmit =
    address.trim().length > 3 &&
    cardHolder.trim().length > 1 &&
    cardNumber.replace(/\s/g, '').length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handlePlaceOrder = async () => {
    if (!canSubmit) return;
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
        <Text style={styles.successIcon}>⏳</Text>
        <Text style={styles.successTitle}>Admin Onayı Bekleniyor</Text>
        <Text style={styles.successSub}>
          Siparişiniz başarıyla alındı ve admin onayına gönderildi.{'\n'}
          Onaylandıktan sonra işleme alınacak.
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
    <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

      {/* Payment — two-column layout */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ödeme Bilgileri</Text>
        <View style={styles.paymentRow}>
          {/* Left: form */}
          <View style={styles.paymentForm}>
            <TextInput
              style={styles.input}
              placeholder="Kart sahibinin adı"
              placeholderTextColor="#86868b"
              autoCapitalize="characters"
              value={cardHolder}
              onChangeText={setCardHolder}
            />
            <TextInput
              style={styles.input}
              placeholder="Kart numarası"
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
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                placeholderTextColor="#86868b"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={cvv}
                onChangeText={setCvv}
                onFocus={() => setCvvFocused(true)}
                onBlur={() => setCvvFocused(false)}
              />
            </View>
          </View>

          {/* Right: animated card */}
          <View style={styles.cardVisualWrapper}>
            <CreditCard
              cardHolder={cardHolder}
              cardNumber={cardNumber}
              expiry={expiry}
              cvv={cvv}
              isFlipped={cvvFocused}
            />
          </View>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.orderButton, (!canSubmit || loading) && styles.orderButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={!canSubmit || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.orderButtonText}>
            Siparişi Gönder · {formatPrice(total)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const card = StyleSheet.create({
  wrapper: {
    width: 165,
    height: 105,
  },
  face: {
    position: 'absolute',
    width: 165,
    height: 105,
    borderRadius: 10,
    padding: 12,
    backfaceVisibility: 'hidden',
  },
  front: {
    backgroundColor: '#1a1a2e',
    justifyContent: 'space-between',
  },
  back: {
    backgroundColor: '#16213e',
  },
  chip: {
    width: 24,
    height: 18,
    backgroundColor: '#f5c518',
    borderRadius: 3,
  },
  network: {
    position: 'absolute',
    top: 12,
    right: 12,
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  number: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  holderName: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    maxWidth: 90,
  },
  expiryText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  magneticStrip: {
    width: '108%',
    height: 22,
    backgroundColor: '#000',
    marginLeft: -12,
    marginTop: 4,
  },
  signatureArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  signatureLines: {
    flex: 1,
    height: 22,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  cvvBox: {
    width: 34,
    height: 22,
    backgroundColor: '#fff',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvvText: { fontSize: 11, fontWeight: '700', color: '#1d1d1f' },
  backNote: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 7,
    marginTop: 6,
    textAlign: 'right',
  },
});

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
  paymentRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  paymentForm: { flex: 1 },
  cardVisualWrapper: {
    paddingTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 10,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
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
    backgroundColor: '#0071e3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  orderButtonDisabled: { opacity: 0.5 },
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
