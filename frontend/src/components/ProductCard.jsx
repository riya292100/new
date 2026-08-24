import React from 'react';
import PropTypes from 'prop-types';
import { Star, Plus, Minus, Zap, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product = {}, onSelectProduct = null }) => {
  const { addToCart, updateQuantity, getItemQuantity, getItemCartId } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const quantity = getItemQuantity(product?.id);
  const cartItemId = getItemCartId(product?.id);
  const inWishlist = isInWishlist(product?.id);

  const mrp = Number(product?.mrp || product?.sellingPrice || product?.price || 0);
  const price = Number(product?.sellingPrice || product?.price || mrp);
  const discount =
    product?.discountPercentage || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-500/40 p-3.5 flex flex-col justify-between relative shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={() => onSelectProduct && onSelectProduct(product)}
    >
      {/* Top Badges & Wishlist Action */}
      <div className="flex items-start justify-between z-10">
        <div className="flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product?.isOneHourDelivery !== false && (
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 fill-current" /> 1-Hour
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            inWishlist
              ? 'bg-red-50 text-red-600 scale-110'
              : 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image */}
      <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center my-2.5 relative">
        <img
          src={
            product?.imageUrl ||
            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80'
          }
          alt={product?.name || 'Product'}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
            {product?.brand || 'QuickCart Direct'}
          </div>
          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight min-h-[34px] group-hover:text-emerald-600 transition-colors">
            {product?.name || 'Item'}
          </h4>
          <div className="text-xs text-gray-500 mt-0.5 mb-2">
            {product?.unitQuantity || 'Standard Pack'}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-black px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-current text-emerald-600" />
              {product?.rating || '4.8'}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              ({product?.ratingCount || product?.reviewCount || 45})
            </span>
          </div>
        </div>

        {/* Price & Quantity Action */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-gray-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {mrp > price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Stepper or Add Button */}
          <div onClick={(e) => e.stopPropagation()}>
            {quantity > 0 ? (
              <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    if (cartItemId) updateQuantity(cartItemId, quantity - 1);
                  }}
                  className="px-2.5 py-1.5 hover:bg-emerald-700 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (cartItemId) updateQuantity(cartItemId, quantity + 1);
                  }}
                  className="px-2.5 py-1.5 hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => addToCart(product, 1)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-extrabold text-xs rounded-xl border border-emerald-300 hover:border-transparent transition-all shadow-sm active:scale-95 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> ADD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    name: PropTypes.string,
    brand: PropTypes.string,
    unitQuantity: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    sellingPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    mrp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    discountPercentage: PropTypes.number,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    ratingCount: PropTypes.number,
    reviewCount: PropTypes.number,
    imageUrl: PropTypes.string,
    isOneHourDelivery: PropTypes.bool,
    inStock: PropTypes.bool,
    stockQuantity: PropTypes.number,
  }),
  onSelectProduct: PropTypes.func,
};

export default ProductCard;
