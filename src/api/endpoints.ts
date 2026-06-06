import apiClient from './client';
import type {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  UserDto,
  UserUpdateDto,
  ProductDto,
  ProductCreateDto,
  ProductFilterDto,
  CategoryDto,
  CreateOrderDto,
  OrderDto,
} from './types';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login = (data: LoginDto): Promise<AuthResponseDto> =>
  apiClient.post('/auth/login', data).then((r) => r.data);

export const register = (data: RegisterDto): Promise<AuthResponseDto> =>
  apiClient.post('/auth/register', data).then((r) => r.data);

// ─── Users (Admin) ───────────────────────────────────────────────────────────
export const getUsers = (): Promise<UserDto[]> =>
  apiClient.get('/users').then((r) => r.data);

export const getUserById = (id: number): Promise<UserDto> =>
  apiClient.get(`/users/${id}`).then((r) => r.data);

export const updateUser = (id: number, data: UserUpdateDto): Promise<UserDto> =>
  apiClient.put(`/users/${id}`, data).then((r) => r.data);

export const deleteUser = (id: number): Promise<void> =>
  apiClient.delete(`/users/${id}`).then((r) => r.data);

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = (params?: ProductFilterDto): Promise<ProductDto[]> =>
  apiClient.get('/products', { params }).then((r) => r.data);

export const getProductById = (id: number): Promise<ProductDto> =>
  apiClient.get(`/products/${id}`).then((r) => r.data);

export const createProduct = (data: ProductCreateDto): Promise<ProductDto> =>
  apiClient.post('/products', data).then((r) => r.data);

export const updateProduct = (id: number, data: ProductCreateDto): Promise<ProductDto> =>
  apiClient.put(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: number): Promise<void> =>
  apiClient.delete(`/products/${id}`).then((r) => r.data);

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = (): Promise<CategoryDto[]> =>
  apiClient.get('/categories').then((r) => r.data);

// ─── Orders ──────────────────────────────────────────────────────────────────
export const createOrder = (data: CreateOrderDto): Promise<OrderDto> =>
  apiClient.post('/orders', data).then((r) => r.data);

export const getMyOrders = (): Promise<OrderDto[]> =>
  apiClient.get('/orders/my').then((r) => r.data);

export const getAllOrders = (): Promise<OrderDto[]> =>
  apiClient.get('/orders').then((r) => r.data);
