use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use parking_lot::RwLock;
use uuid::Uuid;
use chrono::Utc;
use crate::models::{ClaimDealRequest, ClaimDealResponse, FlashDeal};

#[derive(Clone)]
pub struct DealState {
    pub deal_id: String,
    pub product_id: i64,
    pub title: String,
    pub discount_percentage: f64,
    pub flash_price: f64,
    pub initial_stock: u32,
    pub remaining_stock: Arc<AtomicU32>,
    pub max_per_user: u32,
    pub starts_at: String,
    pub expires_at: String,
    pub is_active: bool,
    pub user_claims: Arc<RwLock<HashMap<i64, u32>>>,
}

#[derive(Clone)]
pub struct FlashSaleManager {
    deals: Arc<RwLock<HashMap<String, DealState>>>,
    start_time: std::time::Instant,
}

impl FlashSaleManager {
    pub fn new() -> Self {
        let manager = Self {
            deals: Arc::new(RwLock::new(HashMap::new())),
            start_time: std::time::Instant::now(),
        };
        manager.seed_default_deals();
        manager
    }

    pub fn uptime_seconds(&self) -> u64 {
        self.start_time.elapsed().as_secs()
    }

    pub fn active_deals_count(&self) -> usize {
        self.deals.read().len()
    }

    pub fn get_all_deals(&self) -> Vec<FlashDeal> {
        let deals = self.deals.read();
        deals.values().map(|d| FlashDeal {
            deal_id: d.deal_id.clone(),
            product_id: d.product_id,
            title: d.title.clone(),
            discount_percentage: d.discount_percentage,
            flash_price: d.flash_price,
            initial_stock: d.initial_stock,
            remaining_stock: d.remaining_stock.load(Ordering::Relaxed),
            max_per_user: d.max_per_user,
            starts_at: d.starts_at.clone(),
            expires_at: d.expires_at.clone(),
            is_active: d.is_active,
        }).collect()
    }

    pub fn claim_deal(&self, req: &ClaimDealRequest) -> ClaimDealResponse {
        let deals = self.deals.read();
        let deal = match deals.get(&req.deal_id) {
            Some(d) => d,
            None => {
                return ClaimDealResponse {
                    success: false,
                    claim_token: None,
                    deal_id: req.deal_id.clone(),
                    quantity: req.quantity,
                    message: format!("Flash deal '{}' not found", req.deal_id),
                    remaining_stock: 0,
                    claim_timestamp: Utc::now().to_rfc3339(),
                };
            }
        };

        if req.quantity == 0 {
            return ClaimDealResponse {
                success: false,
                claim_token: None,
                deal_id: req.deal_id.clone(),
                quantity: 0,
                message: "Claim quantity must be greater than 0".into(),
                remaining_stock: deal.remaining_stock.load(Ordering::Relaxed),
                claim_timestamp: Utc::now().to_rfc3339(),
            };
        }

        // Check user quota
        {
            let claims = deal.user_claims.read();
            let already_claimed = claims.get(&req.user_id).copied().unwrap_or(0);
            if already_claimed + req.quantity > deal.max_per_user {
                return ClaimDealResponse {
                    success: false,
                    claim_token: None,
                    deal_id: req.deal_id.clone(),
                    quantity: req.quantity,
                    message: format!(
                        "Exceeded user quota of {} units for this deal (already claimed: {})",
                        deal.max_per_user, already_claimed
                    ),
                    remaining_stock: deal.remaining_stock.load(Ordering::Relaxed),
                    claim_timestamp: Utc::now().to_rfc3339(),
                };
            }
        }

        // Atomic Compare-And-Swap (CAS) inventory deduction loop
        loop {
            let current = deal.remaining_stock.load(Ordering::Acquire);
            if current < req.quantity {
                return ClaimDealResponse {
                    success: false,
                    claim_token: None,
                    deal_id: req.deal_id.clone(),
                    quantity: req.quantity,
                    message: format!("Insufficient flash sale stock. Remaining: {}", current),
                    remaining_stock: current,
                    claim_timestamp: Utc::now().to_rfc3339(),
                };
            }

            let new_stock = current - req.quantity;
            if deal.remaining_stock.compare_exchange_weak(
                current,
                new_stock,
                Ordering::Release,
                Ordering::Relaxed,
            ).is_ok() {
                // Record user claim
                let mut claims = deal.user_claims.write();
                let current_user_claims = claims.entry(req.user_id).or_insert(0);
                *current_user_claims += req.quantity;

                let token = format!("CLAIM-{}-{}", req.deal_id, Uuid::new_v4().to_string().chars().take(8).collect::<String>());

                return ClaimDealResponse {
                    success: true,
                    claim_token: Some(token),
                    deal_id: req.deal_id.clone(),
                    quantity: req.quantity,
                    message: format!("Successfully claimed {} units of flash deal!", req.quantity),
                    remaining_stock: new_stock,
                    claim_timestamp: Utc::now().to_rfc3339(),
                };
            }
        }
    }

    fn seed_default_deals(&self) {
        let mut deals = self.deals.write();

        let sample_deals = vec![
            (
                "DEAL-AVOCADO-80".to_string(),
                101,
                "Fresh Hass Organic Avocados (Pack of 2)".to_string(),
                80.0,
                39.0,
                50,
                2,
            ),
            (
                "DEAL-ALMOND-MILK-70".to_string(),
                102,
                "Artisan Barista Almond Milk (1L)".to_string(),
                70.0,
                65.0,
                75,
                3,
            ),
            (
                "DEAL-DARK-ROAST-60".to_string(),
                103,
                "Single Origin Arabica Dark Roast (500g)".to_string(),
                60.0,
                140.0,
                30,
                1,
            ),
        ];

        for (deal_id, product_id, title, discount, price, stock, max_per_user) in sample_deals {
            deals.insert(
                deal_id.clone(),
                DealState {
                    deal_id,
                    product_id,
                    title,
                    discount_percentage: discount,
                    flash_price: price,
                    initial_stock: stock,
                    remaining_stock: Arc::new(AtomicU32::new(stock)),
                    max_per_user,
                    starts_at: Utc::now().to_rfc3339(),
                    expires_at: (Utc::now() + chrono::Duration::hours(24)).to_rfc3339(),
                    is_active: true,
                    user_claims: Arc::new(RwLock::new(HashMap::new())),
                },
            );
        }
    }
}
