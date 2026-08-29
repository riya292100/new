mod allocator;
mod models;
mod signer;
#[cfg(test)]
mod tests;

use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use allocator::FlashSaleManager;
use models::{ClaimDealRequest, HealthResponse, SignReceiptRequest};
use signer::ReceiptSigner;

fn get_health_response(data: &FlashSaleManager) -> HealthResponse {
    HealthResponse {
        status: "UP".to_string(),
        service: "flash-sale-engine".to_string(),
        version: "1.0.0".to_string(),
        active_deals_count: data.active_deals_count(),
        uptime_seconds: data.uptime_seconds(),
    }
}

#[get("/healthz")]
async fn health_check(data: web::Data<FlashSaleManager>) -> impl Responder {
    HttpResponse::Ok().json(get_health_response(&data))
}

#[get("/health")]
async fn health_alias(data: web::Data<FlashSaleManager>) -> impl Responder {
    HttpResponse::Ok().json(get_health_response(&data))
}

#[get("/ready")]
async fn ready_check(data: web::Data<FlashSaleManager>) -> impl Responder {
    HttpResponse::Ok().json(get_health_response(&data))
}

#[get("/readyz")]
async fn readyz_check(data: web::Data<FlashSaleManager>) -> impl Responder {
    HttpResponse::Ok().json(get_health_response(&data))
}

#[get("/api/v1/flash-sale/deals")]
async fn list_deals(data: web::Data<FlashSaleManager>) -> impl Responder {
    let deals = data.get_all_deals();
    HttpResponse::Ok().json(deals)
}

#[post("/api/v1/flash-sale/claim")]
async fn claim_deal(
    data: web::Data<FlashSaleManager>,
    req: web::Json<ClaimDealRequest>,
) -> impl Responder {
    let res = data.claim_deal(&req.into_inner());
    if res.success {
        HttpResponse::Ok().json(res)
    } else {
        HttpResponse::BadRequest().json(res)
    }
}

#[post("/api/v1/receipts/sign")]
async fn sign_receipt(req: web::Json<SignReceiptRequest>) -> impl Responder {
    match ReceiptSigner::sign_order_receipt(&req.into_inner()) {
        Ok(resp) => HttpResponse::Ok().json(resp),
        Err(err) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": err
        })),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = std::env::var("PORT").unwrap_or_else(|_| "8086".to_string());
    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let addr = format!("{host}:{port}");

    println!("🦀 Starting QuickCart Flash Sale & Cryptographic Engine on http://{addr}");

    let manager = web::Data::new(FlashSaleManager::new());

    HttpServer::new(move || {
        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .app_data(manager.clone())
            .service(health_check)
            .service(health_alias)
            .service(ready_check)
            .service(readyz_check)
            .service(list_deals)
            .service(claim_deal)
            .service(sign_receipt)
    })
    .bind(&addr)?
    .run()
    .await
}
