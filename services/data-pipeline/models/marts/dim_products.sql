WITH products AS (
    SELECT * FROM {{ ref('stg_products') }}
)

SELECT
    product_id,
    product_name,
    product_slug,
    category_id,
    brand_id,
    unit_quantity,
    mrp,
    selling_price,
    discount_percent,
    stock_quantity,
    is_active,
    is_featured,
    CASE
        WHEN stock_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN stock_quantity <= 10 THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_health_status,
    created_at,
    updated_at
FROM products
