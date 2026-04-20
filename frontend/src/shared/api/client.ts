import type {
  AuthResponse,
  Campaign,
  FeedbackRequest,
  FarmerProfile,
  FarmerPublicProfile,
  Order,
  Product,
  User,
} from '../types';

/** Dev default: relative URL so Vite `server.proxy` can reach the Nest API without CORS issues. */
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      'Сервер API недоступен. Запустите PostgreSQL и backend (`npm run start:dev` в папке backend).',
    );
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const fallbackText =
      payload === null ? (await response.text().catch(() => '')).trim() : '';

    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message ?? (fallbackText || 'Request failed');

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: payload }),

  registerBuyer: (payload: {
    email: string;
    password: string;
    buyerType: 'b2c' | 'b2b';
    displayName: string;
    companyName?: string;
    taxId?: string;
    phone?: string;
    avatarUrl?: string;
  }) =>
    request<AuthResponse>('/auth/register/buyer', {
      method: 'POST',
      body: payload,
    }),

  registerFarmer: (payload: {
    email: string;
    password: string;
    displayName: string;
    companyName: string;
    farmTaxId: string;
    pickupAddress?: string;
    phone?: string;
    avatarUrl?: string;
  }) =>
    request<AuthResponse>('/auth/register/farmer', {
      method: 'POST',
      body: payload,
    }),

  me: (token: string) => request<User>('/auth/me', { token }),

  getCampaigns: () => request<Campaign[]>('/campaigns'),
  getCampaign: (id: string) => request<Campaign>(`/campaigns/${id}`),
  getFarmerPublicProfile: (farmerId: string) =>
    request<FarmerPublicProfile>(`/farmers/${farmerId}/profile`),
  getProducts: () => request<Product[]>('/products'),

  getBuyerOrders: (token: string) => request<Order[]>('/me/orders', { token }),
  getMeProfile: (token: string) => request<User>('/me/profile', { token }),
  updateMyFarmerPublicProfile: (
    token: string,
    payload: {
      displayName?: string;
      avatarUrl?: string;
      companyName?: string;
      pickupAddress?: string;
      about?: string;
      region?: string;
      certification?: string;
      supplyTerms?: string;
    },
  ) =>
    request<FarmerProfile>('/me/farmer-profile', {
      method: 'PATCH',
      token,
      body: payload,
    }),
  updateMyBuyerPublicProfile: (
    token: string,
    payload: {
      displayName?: string;
      avatarUrl?: string;
      companyName?: string;
      taxId?: string;
    },
  ) =>
    request('/me/buyer-profile', {
      method: 'PATCH',
      token,
      body: payload,
    }),
  createFarmerReview: (
    token: string,
    farmerId: string,
    payload: { authorName: string; rating: number; comment: string },
  ) =>
    request(`/farmers/${farmerId}/reviews`, {
      method: 'POST',
      token,
      body: payload,
    }),
  updateFarmerReview: (
    token: string,
    farmerId: string,
    reviewId: string,
    payload: { authorName?: string; rating?: number; comment?: string },
  ) =>
    request(`/farmers/${farmerId}/reviews/${reviewId}`, {
      method: 'PATCH',
      token,
      body: payload,
    }),

  createOrder: (
    token: string,
    payload: {
      campaignId: string;
      volume: number;
      deliveryMode: 'pickup' | 'full_delivery' | 'partial_delivery';
      deliveryAddress?: string;
      deliveryComment?: string;
      firstDeliveryDate?: string;
      quoteDeliveryFrequency?: 'once' | 'weekly' | 'daily';
      quoteRequestedTotalVolume?: number;
      quoteBatchVolume?: number;
    },
  ) => request<Order>('/orders', { method: 'POST', token, body: payload }),

  createFeedbackRequest: (payload: { name: string; phone: string }) =>
    request<FeedbackRequest>('/feedback-requests', {
      method: 'POST',
      body: payload,
    }),

  mockPay: (token: string, orderId: string) =>
    request<Order>(`/payments/mock/${orderId}/pay`, {
      method: 'POST',
      token,
    }),

  getFarmerCampaigns: (token: string) =>
    request<Campaign[]>('/farmer/campaigns', { token }),

  createCampaign: (
    token: string,
    payload: {
      productName: string;
      productUnit: string;
      productDescription?: string;
      title: string;
      season: string;
      description?: string;
      imageUrls?: string[];
      totalVolume: number;
      minOrderVolume: number;
      unitPrice: number;
      prepaymentPercent: number;
      preorderDeadline: string;
      availableFrom?: string;
    },
  ) =>
    request<Campaign>('/farmer/campaigns', {
      method: 'POST',
      token,
      body: payload,
    }),

  updateCampaign: (
    token: string,
    campaignId: string,
    payload: {
      productName?: string;
      productUnit?: string;
      productDescription?: string;
      title?: string;
      season?: string;
      description?: string;
      imageUrls?: string[];
      totalVolume?: number;
      minOrderVolume?: number;
      unitPrice?: number;
      prepaymentPercent?: number;
      preorderDeadline?: string;
      availableFrom?: string;
    },
  ) =>
    request<Campaign>(`/farmer/campaigns/${campaignId}`, {
      method: 'PATCH',
      token,
      body: payload,
    }),

  publishCampaign: (token: string, campaignId: string) =>
    request<Campaign>(`/farmer/campaigns/${campaignId}/publish`, {
      method: 'POST',
      token,
    }),

  getFarmerOrders: (token: string) =>
    request<Order[]>('/farmer/orders', { token }),

  getAdminUsers: (token: string) => request<User[]>('/admin/users', { token }),
  getAdminOrders: (token: string) =>
    request<Order[]>('/admin/orders', { token }),
  getAdminCampaigns: (token: string) =>
    request<Campaign[]>('/admin/campaigns', { token }),
  getAdminFeedbackRequests: (token: string) =>
    request<FeedbackRequest[]>('/admin/feedback-requests', { token }),

  updateOrderStatus: (token: string, orderId: string, status: string) =>
    request<Order>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    }),

  updateCampaignStatus: (token: string, campaignId: string, status: string) =>
    request<Campaign>(`/admin/campaigns/${campaignId}/status`, {
      method: 'PATCH',
      token,
      body: { status },
    }),

  createProduct: (
    token: string,
    payload: { name: string; unit: string; description?: string },
  ) =>
    request<Product>('/admin/products', {
      method: 'POST',
      token,
      body: payload,
    }),
};

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value);

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('ru-RU') : 'Не указано';
