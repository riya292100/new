WITH orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
),

order_items AS (
    SELECT * FROM {{ ref('stg_order_items') }}
)

SELECT
    DATE_TRUNC('hour', o.order_created_at) AS order_hour,
    o.store_id,
    oi.product_id,
    oi.product_name,
    COUNT(DISTINCT o.order_id) AS distinct_orders_count,
    SUM(oi.quantity) AS total_quantity_sold,
    SUM(oi.total_price) AS gross_merchandise_value,
    AVG(oi.unit_price) AS average_selling_price
FROM orders AS o
INNER JOIN order_items AS oi ON o.order_id = oi.order_id
WHERE o.order_status != 'CANCELLED'
GROUP BY
    DATE_TRUNC('hour', o.order_created_at),
    o.store_id,
    oi.product_id,
    oi.product_name
