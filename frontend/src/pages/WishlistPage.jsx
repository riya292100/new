import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Zap, Star, ShieldCheck, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
          <Heart className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Your Wishlist is Empty</h1>
        <p className="text-gray-600 max-w-md mx-auto mb-8 text-base">
          Explore thousands of top-brand products with instant 1-Hour SuperFast delivery and save
          your favorites here.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          Explore Marketplace <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-red-600 font-semibold text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-current" /> My Saved Items
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
            My Wishlist ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearWishlist}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {wishlist.map((item) => {
          const mrp = Number(item.mrp || item.sellingPrice || item.price || 0);
          const price = Number(item.sellingPrice || item.price || mrp);
          const discount =
            item.discountPercentage || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

          return (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-200 hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
            >
              {/* Top Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                {discount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
                    {discount}% OFF
                  </span>
                )}
                {item.isOneHourDelivery !== false && (
                  <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> 1-Hour
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromWishlist(item.id)}
                title="Remove from Wishlist"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur text-gray-400 hover:text-red-600 hover:bg-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Image */}
              <Link
                to={`/products/${item.slug || item.id}`}
                className="aspect-square bg-gray-50 overflow-hidden relative block"
              >
                <img
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-emerald-700">
                      {item.brand || 'QuickCart'}
                    </span>
                    {item.rating && (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                        <Star className="w-3 h-3 fill-current" /> {item.rating}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/products/${item.slug || item.id}`}
                    className="font-bold text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors text-sm leading-snug"
                  >
                    {item.name}
                  </Link>

                  {item.unitQuantity && (
                    <p className="text-xs text-gray-500 mt-1">{item.unitQuantity}</p>
                  )}
                </div>

                {/* Price & Action */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-lg font-extrabold text-gray-900">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                    {mrp > price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{mrp.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => moveToCart(item)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-95"
                  >
                    <ShoppingCart className="w-4 h-4" /> Move to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
