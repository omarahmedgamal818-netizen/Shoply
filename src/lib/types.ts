export const PLATFORM_FEE_RATE = 0.05;
export const SHIPPING_FLAT_CENTS = 599;

export type VendorStatus = "pending" | "active" | "rejected";
export type StripeStatus = "not_connected" | "pending" | "connected" | "restricted";
export type OrderStatus = "processing" | "paid" | "shipped" | "delivered" | "cancelled";
export type PayoutStatus = "held" | "transferred";

export type Vendor = {
  id: string;
  owner_id: string;
  store_name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  status: VendorStatus;
  trust_score: number;
  ai_scan_notes: string | null;
  stripe_status: StripeStatus;
  stripe_account_id: string | null;
  legal_name: string | null;
  phone: string | null;
  country: string | null;
  address_line: string | null;
  city: string | null;
  postal_code: string | null;
  rating: number;
  review_count: number;
};

export type Product = {
  id: string;
  vendor_id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  price_cents: number;
  compare_at_cents: number | null;
  image_url: string | null;
  sizes: string[];
  stock: number;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_published: boolean;
};

export type VendorCard = Pick<
  Vendor,
  "id" | "store_name" | "slug" | "rating" | "review_count" | "trust_score" | "status" | "stripe_status"
>;

export type ProductWithVendor = Product & {
  vendors: VendorCard | null;
};

export type Promotion = {
  id: string;
  title: string;
  subtitle: string | null;
  discount_percent: number;
  code: string;
  ends_at: string;
  is_active: boolean;
};

export type Order = {
  id: string;
  order_number: string;
  buyer_id: string;
  status: OrderStatus;
  subtotal_cents: number;
  platform_fee_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_address: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  discount_cents: number;
  promo_code: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  title: string;
  image_url: string | null;
  vendor_name: string;
  unit_price_cents: number;
  quantity: number;
  payout_cents: number;
  payout_status: PayoutStatus;
  stripe_transfer_id: string | null;
  fulfillment_status: "processing" | "shipped" | "delivered";
  tracking_note: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "buyer" | "vendor" | "admin";
};
