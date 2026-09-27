export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: "buyer" | "vendor" | "admin";
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "buyer" | "vendor" | "admin";
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "buyer" | "vendor" | "admin";
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          owner_id: string;
          store_name: string;
          slug: string;
          tagline: string | null;
          description: string | null;
          logo_url: string | null;
          status: "pending" | "active" | "rejected";
          trust_score: number;
          ai_scan_notes: string | null;
          stripe_status: "not_connected" | "pending" | "connected" | "restricted";
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
        Insert: {
          owner_id: string;
          store_name: string;
          slug: string;
          description?: string | null;
          status?: "pending" | "active" | "rejected";
          trust_score?: number;
          stripe_status?: "not_connected" | "pending" | "connected" | "restricted";
          legal_name?: string | null;
          phone?: string | null;
          country?: string | null;
          address_line?: string | null;
          city?: string | null;
          postal_code?: string | null;
        };
        Update: {
          store_name?: string;
          tagline?: string | null;
          description?: string | null;
          status?: "pending" | "active" | "rejected";
          trust_score?: number;
          stripe_status?: "not_connected" | "pending" | "connected" | "restricted";
          stripe_account_id?: string | null;
          phone?: string | null;
          country?: string | null;
          address_line?: string | null;
          city?: string | null;
          postal_code?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
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
          created_at: string;
        };
        Insert: {
          vendor_id: string;
          title: string;
          slug: string;
          description?: string | null;
          category: string;
          price_cents: number;
          image_url?: string | null;
          sizes?: string[];
          stock?: number;
          is_featured?: boolean;
          is_published?: boolean;
        };
        Update: {
          stock?: number;
          is_published?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey";
            columns: ["vendor_id"];
            isOneToOne: false;
            referencedRelation: "vendors";
            referencedColumns: ["id"];
          },
        ];
      };
      promotions: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          discount_percent: number;
          code: string;
          ends_at: string;
          is_active: boolean;
        };
        Insert: {
          title: string;
          subtitle?: string | null;
          discount_percent: number;
          code: string;
          ends_at: string;
          is_active?: boolean;
        };
        Update: {
          is_active?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          status: "processing" | "paid" | "shipped" | "delivered" | "cancelled";
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
        Insert: {
          order_number: string;
          buyer_id: string;
          status?: "processing" | "paid" | "shipped" | "delivered" | "cancelled";
          subtotal_cents: number;
          platform_fee_cents: number;
          shipping_cents: number;
          total_cents: number;
          discount_cents?: number;
          promo_code?: string | null;
        };
        Update: {
          status?: "processing" | "paid" | "shipped" | "delivered" | "cancelled";
          shipping_address?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          vendor_id: string | null;
          title: string;
          image_url: string | null;
          vendor_name: string;
          unit_price_cents: number;
          quantity: number;
          payout_cents: number;
          payout_status: "held" | "transferred";
          stripe_transfer_id: string | null;
          fulfillment_status: "processing" | "shipped" | "delivered";
          tracking_note: string | null;
        };
        Insert: {
          order_id: string;
          product_id: string | null;
          vendor_id: string | null;
          title: string;
          image_url?: string | null;
          vendor_name: string;
          unit_price_cents: number;
          quantity: number;
          payout_cents: number;
          payout_status?: "held" | "transferred";
          fulfillment_status?: "processing" | "shipped" | "delivered";
          tracking_note?: string | null;
        };
        Update: {
          payout_status?: "held" | "transferred";
          stripe_transfer_id?: string | null;
          fulfillment_status?: "processing" | "shipped" | "delivered";
          tracking_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
