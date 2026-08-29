WITH source AS (
    SELECT * FROM {{ source('quickcart_raw', 'order_items') }}
),

renamed AS (
    SELECT
        id AS order_item_id,
        order_id,
        product_id,
        product_name,
        unit_quantity,
        quantity,
        unit_price,
        total_price
    FROM source
)

SELECT * FROM renamed
