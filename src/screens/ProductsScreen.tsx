import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '../api/useQuery';
import { getProducts } from '../api/endpoints';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import type { UserScreenProps } from '../navigation/types';
import type { ProductDto } from '../api/types';

type Props = UserScreenProps<'Products'>;

export default function ProductsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const { addItem, itemCount } = useCart();
  const { signOut, user } = useAuth();

  const { data: products, loading, error, refetch } = useQuery<ProductDto[]>(
    () => getProducts(search ? { search } : undefined),
    [search]
  );

  return (
    <View style={styles.root}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navLogo}>🚗 AutoShop</Text>
        <View style={styles.navRight}>
          <Text style={styles.navUser}>{user?.fullName}</Text>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={styles.cartButtonText}>
              🛒 {itemCount > 0 ? `(${itemCount})` : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Premium Araç Koleksiyonu</Text>
          <Text style={styles.heroSub}>
            Türkiye'nin en prestijli araç seçenekleri tek platformda
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Araç ara..."
            placeholderTextColor="#86868b"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Products */}
        {loading && !products ? (
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
          <>
            <Text style={styles.countText}>
              {products?.length ?? 0} araç listeleniyor
            </Text>
            <View style={styles.grid}>
              {(products ?? []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                />
              ))}
            </View>
            {(products?.length ?? 0) === 0 && (
              <View style={styles.center}>
                <Text style={styles.emptyText}>Araç bulunamadı.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.floatingCartText}>
            🛒 Sepete Git · {itemCount} ürün
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  navbar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navLogo: { fontSize: 18, fontWeight: '700', color: '#1d1d1f' },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navUser: { fontSize: 13, color: '#86868b' },
  cartButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cartButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d2d7',
  },
  logoutText: { color: '#1d1d1f', fontSize: 13, fontWeight: '500' },
  content: { padding: 20, alignItems: 'center' },
  hero: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#1d1d1f',
    borderRadius: 20,
    padding: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    color: '#86868b',
    textAlign: 'center',
  },
  searchRow: {
    width: '100%',
    maxWidth: 900,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1d1d1f',
  },
  countText: {
    alignSelf: 'flex-start',
    width: '100%',
    maxWidth: 900,
    fontSize: 13,
    color: '#86868b',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  center: {
    marginTop: 60,
    alignItems: 'center',
  },
  errorText: { color: '#ff3b30', fontSize: 14, marginBottom: 12 },
  retryButton: {
    backgroundColor: '#0071e3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyText: { color: '#86868b', fontSize: 15 },
  floatingCart: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: '#0071e3',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#0071e3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCartText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
