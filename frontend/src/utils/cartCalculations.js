/**
 * QuickCart Cart & Pricing Calculations
 */

export const FREE_DELIVERY_THRESHOLD = 199;
export const BASE_DELIVERY_FEE = 25;
export const PLATFORM_FEE = 5;
export const TAX_RATE = 0.05; // 5% GST

/**
 * Calculates item subtotal from list of cart items
 */
export function calculateItemTotal(items = []) {
  return items.reduce((sum, item) => {
    const price = item.product?.sellingPrice || item.price || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);
}

/**
 * Calculates delivery fee based on threshold
 */
export function calculateDeliveryFee(itemTotal) {
  if (itemTotal <= 0) return 0;
  return itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : BASE_DELIVERY_FEE;
}

/**
 * Calculates coupon discount amount
 */
export function calculateDiscount(itemTotal, coupon = null) {
  if (!coupon || !coupon.isValid || itemTotal <= 0) return 0;

  if (coupon.minOrderValue && itemTotal < coupon.minOrderValue) {
    return 0;
  }

  if (coupon.discountType === 'PERCENTAGE' || coupon.type === 'PERCENTAGE') {
    const rawDiscount = (itemTotal * (coupon.discountValue || coupon.value || 0)) / 100;
    const maxDiscount = coupon.maxDiscountAmount || coupon.maxDiscount || Infinity;
    return Math.min(rawDiscount, maxDiscount);
  }

  if (coupon.discountType === 'FLAT' || coupon.type === 'FLAT') {
    return Math.min(coupon.discountValue || coupon.value || 0, itemTotal);
  }

  return 0;
}

/**
 * Calculates total bill breakdown
 */
export function calculateBillBreakdown(items = [], coupon = null) {
  const itemTotal = calculateItemTotal(items);
  const deliveryFee = calculateDeliveryFee(itemTotal);
  const discount = calculateDiscount(itemTotal, coupon);
  const discountedSubtotal = Math.max(0, itemTotal - discount);
  const tax = itemTotal > 0 ? Math.round(discountedSubtotal * TAX_RATE * 100) / 100 : 0;
  const platformFee = itemTotal > 0 ? PLATFORM_FEE : 0;
  const finalTotal =
    itemTotal > 0 ? Math.max(0, discountedSubtotal + deliveryFee + tax + platformFee) : 0;

  return {
    itemTotal,
    deliveryFee,
    discount,
    discountedSubtotal,
    tax,
    platformFee,
    finalTotal,
    isFreeDelivery: deliveryFee === 0 && itemTotal > 0,
    amountToFreeDelivery: Math.max(0, FREE_DELIVERY_THRESHOLD - itemTotal),
  };
}
