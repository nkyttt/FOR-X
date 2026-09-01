import React from 'react';
import { StoreProduct, CategoryItem } from '../../types';
import { X, ExternalLink, Star, ShieldCheck, Tag, Sparkles } from 'lucide-react';

interface AdminProductPreviewModalProps {
  product: StoreProduct | null;
  categories: CategoryItem[];
  onClose: () => void;
}

export const AdminProductPreviewModal: React.FC<AdminProductPreviewModalProps> = ({
  product,
  categories,
  onClose,
}) => {
  if (!product) return null;

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase rounded-lg">
              Live Storefront Preview
            </span>
            {product.featured && (
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Card Body */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-blue-400" />
                {category ? category.name : 'Uncategorized'}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Status: <strong className={product.active ? 'text-emerald-400' : 'text-slate-500'}>{product.active ? 'Active (Visible)' : 'Draft (Hidden)'}</strong></span>
              <span>Order: #{product.displayOrder ?? 0}</span>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-300 ml-1.5">{product.rating.toFixed(1)} / 5.0</span>
              </div>

              <h2 className="text-xl font-black text-white tracking-tight leading-snug mb-3">
                {product.title}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 mb-4">
                {product.description}
              </p>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-white">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400">USD</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <a
                href={product.affiliateLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
              >
                <span>Buy Now on Partner Store</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Official Affiliate Link</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
