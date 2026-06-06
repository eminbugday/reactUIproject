import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import UsersAdminScreen from './UsersAdminScreen';
import ProductsAdminScreen from './ProductsAdminScreen';
import OrdersAdminScreen from './OrdersAdminScreen';
import type { AdminTabType } from '../../navigation/types';

const TABS: { id: AdminTabType; label: string; icon: string }[] = [
  { id: 'users', label: 'Kullanıcılar', icon: '👥' },
  { id: 'products', label: 'Ürünler', icon: '🚗' },
  { id: 'orders', label: 'Siparişler', icon: '📦' },
];

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<AdminTabType>('users');
  const { user, signOut } = useAuth();
  const { width } = Dimensions.get('window');
  const isWide = width >= 768;

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersAdminScreen />;
      case 'products':
        return <ProductsAdminScreen />;
      case 'orders':
        return <OrdersAdminScreen />;
    }
  };

  if (isWide) {
    return (
      <SafeAreaView style={styles.root}>
        {/* Sidebar layout for wide screens */}
        <View style={styles.layout}>
          <View style={styles.sidebar}>
            {/* Logo */}
            <View style={styles.sidebarLogo}>
              <Text style={styles.logoIcon}>🚗</Text>
              <Text style={styles.logoText}>AutoShop</Text>
              <Text style={styles.logoBadge}>Admin</Text>
            </View>

            {/* Tabs */}
            <View style={styles.sidebarTabs}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.sidebarTab, activeTab === tab.id && styles.sidebarTabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={styles.sidebarTabIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.sidebarTabLabel,
                      activeTab === tab.id && styles.sidebarTabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* User + logout */}
            <View style={styles.sidebarFooter}>
              <View style={styles.sidebarUser}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>{user?.fullName}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.logoutText}>↩ Çıkış</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {renderContent()}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Mobile: horizontal top tabs
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.mobileHeader}>
        <Text style={styles.mobileTitle}>🚗 AutoShop Admin</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mobileTabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.mobileTab, activeTab === tab.id && styles.mobileTabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.mobileTabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.mobileTabLabel,
                activeTab === tab.id && styles.mobileTabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },

  // Wide layout
  layout: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 240,
    backgroundColor: '#1d1d1f',
    paddingTop: 0,
  },
  sidebarLogo: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'flex-start',
  },
  logoIcon: { fontSize: 28, marginBottom: 4 },
  logoText: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  logoBadge: {
    backgroundColor: '#0071e3',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sidebarTabs: { flex: 1, paddingTop: 16 },
  sidebarTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 12,
    borderRadius: 0,
    marginHorizontal: 0,
  },
  sidebarTabActive: {
    backgroundColor: 'rgba(0,113,227,0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#0071e3',
  },
  sidebarTabIcon: { fontSize: 18 },
  sidebarTabLabel: { fontSize: 14, fontWeight: '500', color: '#86868b' },
  sidebarTabLabelActive: { color: '#fff', fontWeight: '600' },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  sidebarUser: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0071e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  userInfo: { flex: 1 },
  userName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  userEmail: { color: '#86868b', fontSize: 11, marginTop: 1 },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  logoutText: { color: '#86868b', fontSize: 13, fontWeight: '500' },
  content: { flex: 1 },

  // Mobile layout
  mobileHeader: {
    backgroundColor: '#1d1d1f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  mobileTabs: {
    flexDirection: 'row',
    backgroundColor: '#1d1d1f',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  mobileTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  mobileTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0071e3',
  },
  mobileTabIcon: { fontSize: 18 },
  mobileTabLabel: { fontSize: 11, color: '#86868b', marginTop: 2 },
  mobileTabLabelActive: { color: '#0071e3' },
});
