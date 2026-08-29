WITH source AS (
    SELECT * FROM {{ source('quickcart_raw', 'products') }}
),

renamed AS (
    SELECT
        id AS product_id,
        category_id,
        brand_id,
        name AS product_name,
        slug AS product_slug,
        unit_quantity,
        mrp,
        selling_price,
        discount_percent,
        stock_quantity,
        is_active,
        is_featured,
        created_at,
        updated_at
    FROM source
)

SELECT * FROM renamed
