import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { ProductItem } from '../types';
import {
  ShoppingBag,
  Star,
  Sparkles,
  Check,
  Package,
  ShieldCheck,
  Truck,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const ShopView: React.FC = () => {
  const { products, navigate, playUiSound, showToast } = useApp();
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Hardware', 'Audio', 'Peripherals', 'Apparel', 'Collectibles'];

  const filteredProducts = products.filter(
    (p) => selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const handleAddToCart = (product: ProductItem) => {
    playUiSound('click');
    addToCart(product, 1);
    showToast('Added to Cart', `${product.name} is in your cart`, 'success');
  };

  const handleBuyNow = (product: ProductItem) => {
    playUiSound('click');
    addToCart(product, 1);
    navigate('checkout');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-12 text-white border border-slate-800 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-black tracking-widest uppercase mb-3 border border-blue-400/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>CYBERX OFFICIAL GEAR</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            PRO GAMING <span className="text-blue-400">STORE</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 font-normal leading-relaxed">
            Esports grade magnetic hall-effect keyboards, 8000Hz mice, lossless spatial headsets, and limited apparel.
          </p>
        </div>
      </div>

      {/* Store Features Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 p-2">
          <Truck className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Worldwide Express</h4>
            <p className="text-[11px] text-slate-500">Fast tracking & secure dispatch</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">2-Year Official Warranty</h4>
            <p className="text-[11px] text-slate-500">100% authentic hardware</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-2 border-t sm:border-t-0 sm:border-l border-slate-100">
          <Sparkles className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">CyberCredits Rewards</h4>
            <p className="text-[11px] text-slate-500">Earn 5% cashback on every purchase</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playUiSound('click');
                setSelectedCategory(cat);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          {filteredProducts.length} Items
        </span>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-3xl p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
          >
            {/* Product Image */}
            <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-slate-100 p-2 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-500"
              />

              {/* Tag Badges */}
              {product.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                  {product.badge}
                </span>
              )}

              {product.stock <= 5 && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold">
                  Only {product.stock} left
                </span>
              )}
            </div>

            {/* Content */}
            <div className="mt-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition line-clamp-1 mt-0.5">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-2">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Price & Cart Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900">${product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                    title="Add to cart"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleBuyNow(product)}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
