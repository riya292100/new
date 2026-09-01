use std::sync::Arc;
use std::thread;

use crate::allocator::FlashSaleManager;
use crate::models::{ClaimDealRequest, SignReceiptRequest};
use crate::signer::ReceiptSigner;

#[test]
fn test_deals_seeded_properly() {
    let manager = FlashSaleManager::new();
    let deals = manager.get_all_deals();
    assert_eq!(deals.len(), 3);
    assert!(deals.iter().any(|d| d.deal_id == "DEAL-AVOCADO-80"));
}

#[test]
fn test_successful_deal_claim() {
    let manager = FlashSaleManager::new();
    let req = ClaimDealRequest {
        user_id: 42,
        deal_id: "DEAL-AVOCADO-80".to_string(),
        quantity: 1,
    };

    let resp = manager.claim_deal(&req);
    assert!(resp.success);
    assert!(resp.claim_token.is_some());
    assert_eq!(resp.remaining_stock, 49);
}

#[test]
fn test_quota_exceeded_rejection() {
    let manager = FlashSaleManager::new();
    // Max per user is 2 for DEAL-AVOCADO-80
    let req1 = ClaimDealRequest {
        user_id: 100,
        deal_id: "DEAL-AVOCADO-80".to_string(),
        quantity: 2,
    };
    let resp1 = manager.claim_deal(&req1);
    assert!(resp1.success);

    // Attempting to claim a 3rd should fail
    let req2 = ClaimDealRequest {
        user_id: 100,
        deal_id: "DEAL-AVOCADO-80".to_string(),
        quantity: 1,
    };
    let resp2 = manager.claim_deal(&req2);
    assert!(!resp2.success);
    assert!(resp2.message.contains("Exceeded user quota"));
}

#[test]
fn test_non_existent_deal_claim() {
    let manager = FlashSaleManager::new();
    let req = ClaimDealRequest {
        user_id: 1,
        deal_id: "DEAL-NONEXISTENT".to_string(),
        quantity: 1,
    };
    let resp = manager.claim_deal(&req);
    assert!(!resp.success);
}

#[test]
fn test_zero_quantity_claim_rejection() {
    let manager = FlashSaleManager::new();
    let req = ClaimDealRequest {
        user_id: 1,
        deal_id: "DEAL-AVOCADO-80".to_string(),
        quantity: 0,
    };
    let resp = manager.claim_deal(&req);
    assert!(!resp.success);
    assert_eq!(resp.quantity, 0);
}

#[test]
fn test_concurrent_claims_prevent_overselling() {
    let manager = Arc::new(FlashSaleManager::new());
    // DEAL-DARK-ROAST-60 has initial_stock = 30, max_per_user = 1
    // Spawn 60 concurrent threads with distinct user_ids
    let mut handles = vec![];
    for user_id in 1..=60 {
        let mgr = Arc::clone(&manager);
        let handle = thread::spawn(move || {
            let req = ClaimDealRequest {
                user_id,
                deal_id: "DEAL-DARK-ROAST-60".to_string(),
                quantity: 1,
            };
            mgr.claim_deal(&req)
        });
        handles.push(handle);
    }

    let mut successful_claims = 0;
    let mut failed_claims = 0;

    for handle in handles {
        let resp = match handle.join() {
            Ok(r) => r,
            Err(e) => panic!("Thread panicked: {:?}", e),
        };
        if resp.success {
            successful_claims += 1;
        } else {
            failed_claims += 1;
        }
    }

    assert_eq!(
        successful_claims, 30,
        "Exact stock of 30 should be claimed, got {}",
        successful_claims
    );
    assert_eq!(
        failed_claims, 30,
        "Excess 30 claims must be rejected, got {}",
        failed_claims
    );

    let deals = manager.get_all_deals();
    let dark_roast = deals
        .iter()
        .find(|d| d.deal_id == "DEAL-DARK-ROAST-60")
        .unwrap();
    assert_eq!(dark_roast.remaining_stock, 0, "Remaining stock must be exactly 0");
}

#[test]
fn test_cryptographic_receipt_signing() {
    let req = SignReceiptRequest {
        order_id: 9901,
        customer_id: 1234,
        total_amount: 450.75,
        items_count: 3,
        store_id: 1,
        secret_seed: None,
    };

    let sign_result = ReceiptSigner::sign_order_receipt(&req);
    assert!(sign_result.is_ok());

    let resp = sign_result.unwrap();
    assert_eq!(resp.order_id, 9901);
    assert_eq!(resp.algorithm, "HMAC-SHA256");
    assert!(resp.verification_token.starts_with("QC-VERIFIED-9901"));
    assert!(!resp.signature_hex.is_empty());

    // Verify valid signature
    let is_valid = ReceiptSigner::verify_signature(
        9901,
        1234,
        450.75,
        3,
        1,
        &resp.signature_hex,
        None,
    );
    assert!(is_valid);

    // Verify tampered amount fails verification
    let is_tampered_valid = ReceiptSigner::verify_signature(
        9901,
        1234,
        9999.99,
        3,
        1,
        &resp.signature_hex,
        None,
    );
    assert!(!is_tampered_valid);
}
