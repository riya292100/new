use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FlashDeal {
    pub deal_id: String,
    pub product_id: i64,
    pub title: String,
    pub discount_percentage: f64,
    pub flash_price: f64,
    pub initial_stock: u32,
    pub remaining_stock: u32,
    pub max_per_user: u32,
    pub starts_at: String,
    pub expires_at: String,
    pub is_active: bool,
}

#[derive(Debug, Deserialize)]
pub struct ClaimDealRequest {
    pub user_id: i64,
    pub deal_id: String,
    pub quantity: u32,
}

#[derive(Debug, Serialize)]
pub struct ClaimDealResponse {
    pub success: bool,
    pub claim_token: Option<String>,
    pub deal_id: String,
    pub quantity: u32,
    pub message: String,
    pub remaining_stock: u32,
    pub claim_timestamp: String,
}

#[derive(Debug, Deserialize)]
pub struct SignReceiptRequest {
    pub order_id: i64,
    pub customer_id: i64,
    pub total_amount: f64,
    pub items_count: usize,
    pub store_id: i64,
    pub secret_seed: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SignReceiptResponse {
    pub order_id: i64,
    pub signature_hex: String,
    pub algorithm: String,
    pub verification_token: String,
    pub generated_at: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub service: String,
    pub version: String,
    pub active_deals_count: usize,
    pub uptime_seconds: u64,
}
