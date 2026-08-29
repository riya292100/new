WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
),

order_items AS (
    SELECT
        order_id,
        COUNT(order_item_id) AS total_line_items,
        SUM(quantity) AS total_units_ordered,
        SUM(total_price) AS calculated_items_revenue
    FROM {{ ref('stg_order_items') }}
    GROUP BY order_id
),

stores AS (
    SELECT * FROM {{ ref('stg_stores') }}
)

SELECT
    o.order_id,
    o.order_number,
    o.customer_id,
    o.store_id,
    s.store_name,
    s.city AS store_city,
    o.order_status,
    o.item_total,
    o.delivery_fee,
    o.tax_amount,
    o.discount_amount,
    o.wallet_discount_amount,
    o.tip_amount,
    o.total_amount,
    COALESCE(oi.total_line_items, 0) AS total_line_items,
    COALESCE(oi.total_units_ordered, 0) AS total_units_ordered,
    o.order_created_at,
    o.delivered_at,
    CASE
        WHEN o.delivered_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (o.delivered_at - o.order_created_at)) / 60.0
        ELSE NULL
    END AS fulfillment_duration_minutes,
    CASE
        WHEN o.delivered_at IS NOT NULL AND o.delivered_at <= o.estimated_delivery_time
        THEN TRUE
        WHEN o.delivered_at IS NOT NULL
        THEN FALSE
        ELSE NULL
    END AS is_sla_compliant
FROM orders AS o
LEFT JOIN order_items AS oi ON o.order_id = oi.order_id
LEFT JOIN stores AS s ON o.store_id = s.store_id
