import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  ChevronDown,
  ShoppingBag,
  User,
  LogOut,
  Package,
  Shield,
  Bike,
  Utensils,
  Heart,
  Store,
  Sparkles,
} from 'lucide-react';
import SearchAutocomplete from './SearchAutocomplete';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_CATEGORIES } from '../utils/demoConfig';

const Header = () => {
  const { selectedLocation, setLocationModalOpen } = useLocation();
  const { cart, setCartDrawerOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout, openAuthModal, isAdmin, isSeller, isDeliveryPartner } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="glass-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      {/* Top Notification Bar: 1-Hour Pan India Delivery */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 tracking-wide">
        <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
        <span>
          <strong>1-Hour SuperFast Express Delivery</strong> now live across Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata & 50+ Indian Cities!
        </span>
        <span className="hidden md:inline bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-300/30">
          ⚡ Pan-India Assured
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          {/* Brand Logo & Pincode / Location */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-current text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  Quick<span className="text-emerald-600">Cart</span>
                </span>
                <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mt-0.5 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 fill-current" /> 1-Hour Delivery
                </span>
              </div>
            </Link>

            {/* Pincode & City Delivery Selector */}
            <div
              onClick={() => setLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-xl bg-gray-50 hover:bg-emerald-50/60 border border-gray-200/80 hover:border-emerald-300 transition-all max-w-[200px]"
            >
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 animate-bounce" />
              <div className="overflow-hidden text-left">
                <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider leading-none">
                  Deliver in 45-60m
                </div>
                <div className="text-xs font-bold text-gray-900 truncate mt-0.5">
                  {selectedLocation?.pincode ? `${selectedLocation.pincode} - ${selectedLocation.city || 'Delhi NCR'}` : 'Select Pincode'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-auto" />
            </div>
          </div>

          {/* Center: Search Autocomplete & Quick Navigation */}
          <div className="flex-1 max-w-2xl flex items-center gap-3">
            <div className="flex-1">
              <SearchAutocomplete />
            </div>
          </div>

          {/* Right Actions: Wishlist, Dining, Seller & Profile & Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
            {/* Dining Link */}
            <Link
              to="/dining"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all"
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-600" /> Dining
            </Link>

            {/* Seller Hub Link */}
            <Link
              to="/seller"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl transition-all"
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" /> Seller Hub
            </Link>

            {/* Wishlist Link with Live Counter */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 transition-all flex items-center justify-center"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-emerald-500" />
                  ) : (
                    <User className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="hidden sm:inline">{user.fullName?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-500">
                      Signed in as <br />
                      <strong className="text-gray-900 truncate block">{user.email}</strong>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors mt-1"
                    >
                      <Package className="w-4 h-4" /> My Orders & Deliveries
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-500" /> My Wishlist ({wishlistCount})
                    </Link>

                    <Link
                      to="/seller"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Store className="w-4 h-4" /> Seller Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Admin Portal
                      </Link>
                    )}

                    {isDeliveryPartner && (
                      <Link
                        to="/delivery-partner"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Bike className="w-4 h-4" /> Driver Fleet App
                      </Link>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" /> Login
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[10px] font-semibold opacity-90">
                  {cart?.totalItems || 0} {cart?.totalItems === 1 ? 'item' : 'items'}
                </span>
                <span className="text-xs font-extrabold">₹{(cart?.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Mega Category Bar (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pt-3 mt-2 border-t border-gray-100 no-scrollbar text-xs font-bold text-gray-700 whitespace-nowrap">
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> All Categories
          </Link>
          {FALLBACK_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 hover:text-emerald-700 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
