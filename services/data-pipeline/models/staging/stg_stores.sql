WITH source AS (
    SELECT * FROM {{ source('quickcart_raw', 'dark_stores') }}
),

renamed AS (
    SELECT
        id AS store_id,
        name AS store_name,
        code AS store_code,
        address,
        city,
        pincode,
        latitude,
        longitude,
        service_radius_km,
        max_concurrent_orders,
        current_active_orders,
        is_active,
        created_at,
        updated_at
    FROM source
)

SELECT * FROM renamed
