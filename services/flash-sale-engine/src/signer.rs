use hmac::{Hmac, Mac};
use sha2::Sha256;
use chrono::Utc;
use crate::models::{SignReceiptRequest, SignReceiptResponse};

type HmacSha256 = Hmac<Sha256>;

const DEFAULT_SECRET: &str = "quickcart_rust_receipt_signing_key_2026_secure";

#[derive(Default)]
pub struct ReceiptSigner;

impl ReceiptSigner {
    pub fn sign_order_receipt(req: &SignReceiptRequest) -> Result<SignReceiptResponse, String> {
        let secret = req.secret_seed.as_deref().unwrap_or(DEFAULT_SECRET);

        let payload = format!(
            "ORDER_ID={}:CUSTOMER_ID={}:TOTAL={:.2}:ITEMS={}:STORE_ID={}",
            req.order_id, req.customer_id, req.total_amount, req.items_count, req.store_id
        );

        let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
            .map_err(|e| format!("Invalid HMAC key: {e}"))?;

        mac.update(payload.as_bytes());
        let result = mac.finalize();
        let signature_hex = hex::encode(result.into_bytes());

        let short_sig = if signature_hex.len() >= 12 {
            &signature_hex[..12]
        } else {
            &signature_hex[..]
        };

        let verification_token = format!("QC-VERIFIED-{}-{}", req.order_id, short_sig);

        Ok(SignReceiptResponse {
            order_id: req.order_id,
            signature_hex,
            algorithm: "HMAC-SHA256".to_string(),
            verification_token,
            generated_at: Utc::now().to_rfc3339(),
        })
    }

    pub fn verify_signature(
        order_id: i64,
        customer_id: i64,
        total_amount: f64,
        items_count: usize,
        store_id: i64,
        signature_hex: &str,
        secret: Option<&str>,
    ) -> bool {
        let req = SignReceiptRequest {
            order_id,
            customer_id,
            total_amount,
            items_count,
            store_id,
            secret_seed: secret.map(|s| s.to_string()),
        };

        match Self::sign_order_receipt(&req) {
            Ok(resp) => resp.signature_hex == signature_hex,
            Err(_) => false,
        }
    }
}
