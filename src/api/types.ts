// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  expiresAt: string;
  userId: number;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponseDto {
  message: string;
  resetCode: string;
}

export interface ResetPasswordDto {
  email: string;
  resetCode: string;
  newPassword: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export interface UserDto {
  id: number;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  isActive: boolean;
  createdDate: string;
}

export interface UserUpdateDto {
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  isActive: boolean;
}

// ─── Categories ──────────────────────────────────────────────────────────────
export interface CategoryDto {
  id: number;
  name: string;
}

// ─── Products ────────────────────────────────────────────────────────────────
export interface ProductDto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
}

export interface ProductCreateDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
}

export interface ProductFilterDto {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
}

// ─── Orders ──────────────────────────────────────────────────────────────────
export interface CartItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  items: CartItemDto[];
  shippingAddress: string;
  cardHolderName: string;
  cardNumber: string;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDto {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Cancelled';
  shippingAddress: string;
  createdDate: string;
  items: OrderItemDto[];
}
