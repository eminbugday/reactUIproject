import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AdminLayout from '../screens/admin/AdminLayout';

import type { AuthStackParamList, UserStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const UserStack = createNativeStackNavigator<UserStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function UserNavigator() {
  const { itemCount } = useCart();
  return (
    <UserStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '700', color: '#1d1d1f' },
        headerTintColor: '#0071e3',
      }}
    >
      <UserStack.Screen
        name="Products"
        component={ProductsScreen}
        options={{ headerShown: false }}
      />
      <UserStack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: `Sepetim${itemCount > 0 ? ` (${itemCount})` : ''}` }}
      />
      <UserStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Ödeme' }}
      />
    </UserStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0071e3" />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  if (user.role === 'Admin') {
    return <AdminLayout />;
  }

  return (
    <NavigationContainer>
      <UserNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
});
