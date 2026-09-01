import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StoreProduct } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import { AdminProductPreviewModal } from './AdminProductPreviewModal';
import { storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Star,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  X,
  Filter,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const {
    storeProducts,
    categories,
    addStoreProduct,
    updateStoreProduct,
    deleteStoreProduct,
    toggleProductActive,
    toggleProductFeatured,
    addMediaItem,
    showToast,
    playUiSound,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'price-asc' | 'price-desc' | 'rating' | 'name'>('order');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [previewProduct, setPreviewProduct] = useState<StoreProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<StoreProduct | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 99.99,
    rating: 4.8,
    categoryId: '',
    imageUrl: '',
    affiliateLink: '',
    active: true,
    featured: false,
    displayOrder: 1,
  });

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    playUiSound('click');
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      price: 49.99,
      rating: 4.8,
      categoryId: categories.length > 0 ? categories[0].id : '',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      affiliateLink: 'https://amazon.com/dp/B0EXAMPLE?tag=cyberx-20',
      active: true,
      featured: false,
      displayOrder: storeProducts.length + 1,
    });
    setFormError(null);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: StoreProduct) => {
    playUiSound('click');
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      rating: prod.rating,
      categoryId: prod.categoryId,
      imageUrl: prod.imageUrl,
      affiliateLink: prod.affiliateLink,
      active: prod.active,
      featured: prod.featured || false,
      displayOrder: prod.displayOrder ?? 1,
    });
    setFormError(null);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  // Image Upload Handler with validation (<5MB, JPG/PNG/WebP)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image file size must be under 5MB.');
      return;
    }

    setFormError(null);
    setUploadProgress(10);

    try {
      if (storage) {
        const fileExt = file.name.split('.').pop();
        const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (err) => {
            console.warn('Storage upload fallback to base64 preview:', err);
            // Fallback to local FileReader if cloud upload encounters security policy
            const reader = new FileReader();
            reader.onload = () => {
              const url = reader.result as string;
              setFormData((prev) => ({ ...prev, imageUrl: url }));
              setUploadProgress(100);
              addMediaItem({
                name: file.name,
                url,
                type: 'image',
                sizeBytes: file.size,
              });
            };
            reader.readAsDataURL(file);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData((prev) => ({ ...prev, imageUrl: downloadUrl }));
            setUploadProgress(100);
            addMediaItem({
              name: file.name,
              url: downloadUrl,
              type: 'image',
              sizeBytes: file.size,
            });
            showToast('Image Uploaded', 'Product image stored in Firebase Cloud Storage.');
          }
        );
      } else {
        // Local FileReader
        const reader = new FileReader();
        reader.onload = () => {
          const url = reader.result as string;
          setFormData((prev) => ({ ...prev, imageUrl: url }));
          setUploadProgress(100);
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setFormError('Image processing error: ' + err.message);
      setUploadProgress(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      setFormError('Product title is required.');
      return;
    }

    if (formData.price < 0) {
      setFormError('Price must be greater than or equal to $0.');
      return;
    }

    if (formData.rating < 0 || formData.rating > 5) {
      setFormError('Rating must be between 0.0 and 5.0.');
      return;
    }

    if (!formData.categoryId) {
      setFormError('Please select a valid category.');
      return;
    }

    if (!formData.affiliateLink.trim()) {
      setFormError('Affiliate Buy Now link is required.');
      return;
    }

    setIsSubmitting(true);
    playUiSound('click');

    try {
      if (editingProduct) {
        await updateStoreProduct(editingProduct.id, {
          title: trimmedTitle,
          description: formData.description.trim(),
          price: Number(formData.price),
          rating: Number(formData.rating),
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl.trim(),
          affiliateLink: formData.affiliateLink.trim(),
          active: formData.active,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
        });
      } else {
        await addStoreProduct({
          title: trimmedTitle,
          description: formData.description.trim(),
          price: Number(formData.price),
          rating: Number(formData.rating),
          categoryId: formData.categoryId,
          imageUrl: formData.imageUrl.trim(),
          affiliateLink: formData.affiliateLink.trim(),
          active: formData.active,
          featured: formData.featured,
          displayOrder: Number(formData.displayOrder),
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setIsSubmitting(true);
    try {
      await deleteStoreProduct(deletingProduct.id);
      setDeletingProduct(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = storeProducts
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active) ||
        (statusFilter === 'inactive' && !p.active) ||
        (statusFilter === 'featured' && p.featured);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span>Store Products Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage inventory items, affiliate Buy Now destinations, live pricing, and storefront feature tags.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title or keyword..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="active" className="bg-slate-900">Active Only</option>
              <option value="inactive" className="bg-slate-900">Draft / Inactive</option>
              <option value="featured" className="bg-slate-900">Featured Spotlight</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer"
            >
              <option value="order" className="bg-slate-900">Order: Default</option>
              <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
              <option value="rating" className="bg-slate-900">Rating: Highest</option>
              <option value="name" className="bg-slate-900">Title: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6">Spotlight</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((prod) => {
                const category = categories.find((c) => c.id === prod.categoryId);

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80'}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="max-w-xs">
                          <div className="font-bold text-white text-sm line-clamp-1">{prod.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                            <span>ID: {prod.id}</span>
                            <span>•</span>
                            <span>Order #{prod.displayOrder ?? 0}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {category ? category.name : 'Uncategorized'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-mono text-white font-bold text-sm">
                      ${prod.price.toFixed(2)}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{prod.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleProductFeatured(prod.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                          prod.featured
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                        title="Toggle Homepage Spotlight"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{prod.featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleProductActive(prod.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                          prod.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {prod.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                          title="Preview Storefront Card"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No products found matching the active criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Store Product'}
                </h3>
                <p className="text-xs text-slate-400">Configure title, pricing, category, and affiliate Buy Now URL.</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cyber Pulse Pro Wireless RGB Headset"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Price (USD $) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Rating (0.0 - 5.0) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Affiliate / Buy Now Link *
                </label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    value={formData.affiliateLink}
                    onChange={(e) => setFormData({ ...formData, affiliateLink: e.target.value })}
                    placeholder="https://amazon.com/dp/B0... or partner referral URL"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                  />
                </div>
              </div>

              {/* Product Image Selection & Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Product Image (Upload or URL) *
                </label>
                <div className="grid sm:grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                    />

                    <label className="flex items-center justify-center gap-2 p-3 bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 rounded-xl text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition">
                      <Upload className="w-4 h-4 text-blue-400" />
                      <span>Upload File (JPG, PNG, WebP &lt; 5MB)</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadProgress !== null && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Uploading image...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Container */}
                  <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-600 text-xs">
                        <ImageIcon className="w-6 h-6" />
                        <span>Image Preview</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, features, driver details, tactile feel..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Visibility
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      {formData.active ? 'Active (Live)' : 'Draft (Hidden)'}
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Spotlight
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      {formData.featured ? 'Featured on Home' : 'Standard'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Preview Modal */}
      <AdminProductPreviewModal
        product={previewProduct}
        categories={categories}
        onClose={() => setPreviewProduct(null)}
      />

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Product "${deletingProduct?.title}"?`}
        message="This action will permanently delete this product, remove it from the catalog, and purge all references in Firestore. This cannot be undone."
        confirmText="Delete Product"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
