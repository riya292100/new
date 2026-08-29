WITH source AS (
    SELECT * FROM {{ source('quickcart_raw', 'orders') }}
),

renamed AS (
    SELECT
        id AS order_id,
        order_number,
        user_id AS customer_id,
        store_id,
        status AS order_status,
        item_total,
        delivery_fee,
        platform_fee,
        tax_amount,
        discount_amount,
        wallet_discount_amount,
        tip_amount,
        total_amount,
        coupon_code,
        delivery_instructions,
        estimated_delivery_time,
        delivered_at,
        created_at AS order_created_at,
        updated_at AS order_updated_at
    FROM source
)

SELECT * FROM renamed
