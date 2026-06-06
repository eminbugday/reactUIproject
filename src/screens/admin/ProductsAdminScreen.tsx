import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useQuery } from '../../api/useQuery';
import { useMutation } from '../../api/useMutation';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../api/endpoints';
import type { ProductDto, CategoryDto, ProductCreateDto } from '../../api/types';

const EMPTY_FORM: ProductCreateDto = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  imageUrl: '',
  categoryId: 0,
};

const FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=80&q=80';

export default function ProductsAdminScreen() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductCreateDto>(EMPTY_FORM);

  const { data: products, loading, error, refetch } = useQuery<ProductDto[]>(getProducts);
  const { data: categories } = useQuery<CategoryDto[]>(getCategories);
  const { mutate: doCreate, loading: creating } = useMutation(createProduct);
  const { mutate: doUpdate, loading: updating } = useMutation(
    (v: { id: number; data: ProductCreateDto }) => updateProduct(v.id, v.data)
  );
  const { mutate: doDelete } = useMutation((id: number) => deleteProduct(id));

  const saving = creating || updating;

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: ProductDto) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.categoryId) {
      Alert.alert('Eksik Alan', 'Ürün adı ve kategori zorunludur.');
      return;
    }
    try {
      if (editId !== null) {
        await doUpdate({ id: editId, data: form });
      } else {
        await doCreate(form);
      }
      setShowForm(false);
      refetch();
    } catch {
      Alert.alert('Hata', 'Ürün kaydedilemedi.');
    }
  };

  const handleDelete = (p: ProductDto) => {
    Alert.alert('Ürünü Sil', `"${p.name}" silinecek. Emin misiniz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await doDelete(p.id);
            refetch();
          } catch {
            Alert.alert('Hata', 'Ürün silinemedi.');
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ürün Yönetimi</Text>
          <Text style={styles.headerSub}>
            {products ? `${products.length} ürün` : 'Yükleniyor...'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
            <Text style={styles.refreshText}>Yenile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Yeni Ürün</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Inline form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editId !== null ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </Text>
          <View style={styles.formGrid}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Ürün Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ürün adı"
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Kısa açıklama"
                multiline
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              />
              <Text style={styles.label}>Görsel URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://..."
                autoCapitalize="none"
                value={form.imageUrl}
                onChangeText={(v) => setForm((f) => ({ ...f, imageUrl: v }))}
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Fiyat (TRY) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={form.price > 0 ? String(form.price) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, price: parseFloat(v) || 0 }))}
              />
              <Text style={styles.label}>Stok *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={form.stock > 0 ? String(form.stock) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, stock: parseInt(v) || 0 }))}
              />
              <Text style={styles.label}>Kategori *</Text>
              <View style={styles.categoryRow}>
                {(categories ?? []).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      form.categoryId === cat.id && styles.catChipActive,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, categoryId: cat.id }))}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        form.categoryId === cat.id && styles.catChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editId !== null ? 'Güncelle' : 'Kaydet'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Table */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0071e3" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: 60 }]}>Görsel</Text>
            <Text style={[styles.th, { flex: 2 }]}>Ürün</Text>
            <Text style={[styles.th, { flex: 1 }]}>Kategori</Text>
            <Text style={[styles.th, { flex: 1 }]}>Fiyat</Text>
            <Text style={[styles.th, { width: 60 }]}>Stok</Text>
            <Text style={[styles.th, { width: 90, textAlign: 'right' }]}>İşlem</Text>
          </View>
          {(products ?? []).map((p, idx) => (
            <View key={p.id} style={[styles.row, idx % 2 === 1 && styles.rowAlt]}>
              <Image
                source={{ uri: p.imageUrl?.startsWith('http') ? p.imageUrl : FALLBACK }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={[styles.cell, { flex: 2 }]}>
                <Text style={styles.cellName}>{p.name}</Text>
                <Text style={styles.cellSub} numberOfLines={1}>{p.description}</Text>
              </View>
              <Text style={[styles.cell, styles.cellText, { flex: 1 }]}>{p.categoryName}</Text>
              <Text style={[styles.cell, styles.cellPrice, { flex: 1 }]}>
                {formatPrice(p.price)}
              </Text>
              <Text style={[styles.cell, styles.cellText, { width: 60 }]}>{p.stock}</Text>
              <View style={[styles.cell, { width: 90, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }]}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(p)}>
                  <Text>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(p)}>
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>
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
  headerActions: { flexDirection: 'row', gap: 10 },
  refreshBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d2d7',
  },
  refreshText: { fontSize: 13, fontWeight: '600', color: '#1d1d1f' },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0071e3',
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  form: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e7',
    padding: 20,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1d1d1f', marginBottom: 16 },
  formGrid: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  formCol: { flex: 1, minWidth: 240 },
  label: { fontSize: 12, fontWeight: '600', color: '#86868b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: '#d2d2d7',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1d1d1f',
    backgroundColor: '#f5f5f7',
    marginBottom: 12,
  },
  textarea: { height: 70, textAlignVertical: 'top' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d2d2d7',
    backgroundColor: '#f5f5f7',
  },
  catChipActive: { backgroundColor: '#0071e3', borderColor: '#0071e3' },
  catChipText: { fontSize: 13, color: '#86868b', fontWeight: '500' },
  catChipTextActive: { color: '#fff' },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d2d2d7',
  },
  cancelText: { fontWeight: '600', color: '#1d1d1f' },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0071e3',
    minWidth: 90,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { fontWeight: '700', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#ff3b30' },
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
  th: { fontSize: 11, fontWeight: '700', color: '#86868b', textTransform: 'uppercase', letterSpacing: 0.5 },
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
  thumb: { width: 52, height: 40, borderRadius: 6, marginRight: 8, backgroundColor: '#f0f0f2' },
  cell: { paddingRight: 8 },
  cellName: { fontSize: 14, fontWeight: '600', color: '#1d1d1f' },
  cellSub: { fontSize: 12, color: '#86868b', marginTop: 1 },
  cellText: { fontSize: 13, color: '#1d1d1f' },
  cellPrice: { fontSize: 13, fontWeight: '600', color: '#0071e3' },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
