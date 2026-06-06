import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { ProductDto } from '../api/types';

interface Props {
  product: ProductDto;
  onAddToCart: (product: ProductDto) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=640&q=80';

export default function ProductCard({ product, onAddToCart }: Props) {
  const imageUri = product.imageUrl?.startsWith('http')
    ? product.imageUrl
    : FALLBACK_IMAGE;

  const formatPrice = (price: number) =>
    price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.description}
        </Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            <Text style={styles.stock}>
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Tükendi'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.cartButton, product.stock === 0 && styles.cartButtonDisabled]}
            onPress={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <Text style={styles.cartButtonText}>Sepete Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    width: 280,
    margin: 8,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f2',
  },
  body: { padding: 16 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#86868b',
    marginBottom: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0071e3',
  },
  stock: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 2,
  },
  cartButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cartButtonDisabled: {
    backgroundColor: '#d2d2d7',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
