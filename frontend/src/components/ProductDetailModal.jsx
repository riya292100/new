import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  X,
  Star,
  Plus,
  Minus,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Tag,
  MapPin,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { catalogApi, reviewApi, pincodeApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateSchema, reviewSchema } from '../utils/validation';
import logger from '../utils/logger';
import RelatedProductsRow from './product/RelatedProductsRow';
import ProductReviewList from './product/ProductReviewList';

const ProductDetailModal = ({ product = {}, onClose = () => {} }) => {
  const { addToCart, updateQuantity, getItemQuantity, getItemCartId } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();

  const [activeImage, setActiveImage] = useState(product?.imageUrl || '');
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Pincode speed checker
  const [checkPin, setCheckPin] = useState('110001');
  const [pinSpeed, setPinSpeed] = useState({
    city: 'New Delhi',
    isOneHourAvailable: true,
    estimatedEta: '45-60 mins',
  });

  const inWishlist = isInWishlist(product?.id);
  const quantity = product ? getItemQuantity(product.id) : 0;
  const cartItemId = product ? getItemCartId(product.id) : null;

  const mrp = Number(product?.mrp || product?.sellingPrice || product?.price || 0);
  const price = Number(product?.sellingPrice || product?.price || mrp);
  const discount =
    product?.discountPercentage || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  // Gallery array
  const gallery = [
    product?.imageUrl,
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  ].filter(Boolean);

  useEffect(() => {
    if (product?.imageUrl) {
      setActiveImage(product.imageUrl);
    }
    if (product?.id) {
      reviewApi
        .getProductReviews(product.id)
        .then((res) => {
          if (res?.data) setReviews(res.data);
        })
        .catch((err) => {
          logger.warn('ProductDetailModal', 'Failed to fetch reviews', err);
        });

      catalogApi
        .getRelatedProducts(product.id, 4)
        .then((res) => {
          if (res?.data) setRelatedProducts(res.data);
        })
        .catch((err) => {
          logger.warn('ProductDetailModal', 'Failed to fetch related products', err);
        });
    }
  }, [product]);

  const handleVerifyPincode = async (e) => {
    e.preventDefault();
    if (!checkPin || checkPin.length !== 6) return;
    try {
      const res = await pincodeApi.check(checkPin);
      if (res?.data) {
        setPinSpeed(res.data);
      }
    } catch {
      // Fallback
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('LOGIN');
      return;
    }

    const valResult = validateSchema(reviewSchema, {
      rating: newRating,
      comment: newComment,
    });

    if (!valResult.isValid) {
      addToast(Object.values(valResult.errors)[0], 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await reviewApi.createReview({
        productId: product.id,
        rating: newRating,
        comment: newComment,
      });
      if (res?.data) {
        setReviews([res.data, ...reviews]);
        setNewComment('');
        setNewRating(5);
        addToast('Review submitted successfully!', 'success');
      }
    } catch (err) {
      logger.error('ProductDetailModal', 'Failed to submit review', err);
      addToast('Failed to post review. You may have already reviewed this product.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product || !product.id) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery & Zoom */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 relative flex items-center justify-center">
              <img
                src={activeImage || product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />

              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                  {discount}% OFF
                </span>
              )}

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                  inWishlist
                    ? 'bg-red-50 text-red-600'
                    : 'bg-white/90 backdrop-blur text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImage === img ? 'border-emerald-600 scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Seller & Warranty Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase">Seller</span>
                <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {product.sellerName || 'SuperComNet India'} (4.85 ★)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase">Warranty</span>
                <span className="font-semibold text-gray-900">{product.warranty || '1 Year Brand Warranty'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bold uppercase">Returns</span>
                <span className="font-semibold text-gray-900">7 Days Easy Replacement</span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Bank Offers, Pincode & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                  {product.brand || 'QuickCart Direct'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Zap className="w-3 h-3 fill-current" /> 1-Hour SuperFast
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 leading-snug">
                {product.name}
              </h1>

              {product.unitQuantity && (
                <p className="text-xs text-gray-500 mt-1">{product.unitQuantity}</p>
              )}

              {/* Star Rating Badge */}
              <div className="flex items-center gap-2 mt-2">
                <div className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-black px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-current text-white" /> {product.rating || '4.8'}
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  ({product.ratingCount || reviews.length || 48} verified ratings)
                </span>
              </div>

              {/* Price & EMI */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                  {mrp > price && (
                    <span className="text-base text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                  )}
                  {discount > 0 && (
                    <span className="text-emerald-700 font-black text-sm bg-emerald-50 px-2 py-0.5 rounded">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>

                {/* EMI Calculator */}
                <div className="mt-3 bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>No Cost EMI from <strong>₹{Math.round(price / 6).toLocaleString('en-IN')}/month</strong></span>
                  </div>
                  <span className="font-bold text-indigo-600 underline cursor-pointer">View Plans</span>
                </div>
              </div>

              {/* Bank & Coupon Offers */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> Available Bank Offers
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="p-2 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex items-center gap-2">
                    <span className="font-bold text-emerald-700">Bank Offer:</span> Flat ₹100 instant discount with code <strong className="text-emerald-800">QUICK100</strong>
                  </div>
                  <div className="p-2 bg-amber-50/60 border border-amber-200/60 rounded-xl flex items-center gap-2">
                    <span className="font-bold text-amber-700">Express Delivery:</span> Free 1-Hour SuperFast Delivery on orders above ₹499
                  </div>
                </div>
              </div>

              {/* Pincode Speed Checker */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Check 1-Hour Delivery To Your Pincode
                </div>
                <form onSubmit={handleVerifyPincode} className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="Enter 6-digit PIN"
                    value={checkPin}
                    onChange={(e) => setCheckPin(e.target.value.replace(/\D/g, ''))}
                    className="w-36 px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    Check Speed
                  </button>
                  {pinSpeed && (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {pinSpeed.city}: <strong>{pinSpeed.estimatedEta}</strong>
                    </span>
                  )}
                </form>
              </div>

              {/* Highlights & Specifications */}
              {(product.highlights || product.description) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2">
                    Product Highlights & Details
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {product.description || product.highlights}
                  </p>
                  {product.specifications && (
                    <div className="mt-2 bg-gray-50 p-2.5 rounded-xl text-[11px] text-gray-600 border border-gray-200">
                      {product.specifications}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Add to Cart & Buy Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              {quantity > 0 ? (
                <div className="flex items-center bg-emerald-600 text-white rounded-2xl shadow-lg p-1.5 flex-1 justify-between max-w-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (cartItemId) updateQuantity(cartItemId, quantity - 1);
                    }}
                    className="w-9 h-9 rounded-xl hover:bg-emerald-700 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-black">{quantity} units in Cart</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (cartItemId) updateQuantity(cartItemId, quantity + 1);
                    }}
                    className="w-9 h-9 rounded-xl hover:bg-emerald-700 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product, 1)}
                  className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-current text-amber-300" /> Add to Cart (1-Hour Delivery)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-black text-gray-900 mb-4">Customer Reviews & Ratings</h3>
          <ProductReviewList reviews={reviews} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <RelatedProductsRow products={relatedProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

ProductDetailModal.propTypes = {
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
    imageUrl: PropTypes.string,
    description: PropTypes.string,
    specifications: PropTypes.string,
    highlights: PropTypes.string,
    sellerName: PropTypes.string,
    warranty: PropTypes.string,
    isOneHourDelivery: PropTypes.bool,
  }),
  onClose: PropTypes.func,
};

export default ProductDetailModal;
