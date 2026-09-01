import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import { AdminConfirmModal } from './AdminConfirmModal';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Cpu,
  Watch,
  Camera,
  Tv,
  Speaker,
  Keyboard,
  Mouse,
  HardDrive,
  Flame,
  Shield,
  Zap,
  Tag,
} from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'Gamepad2', label: 'Gamepad', icon: Gamepad2 },
  { key: 'Headphones', label: 'Audio', icon: Headphones },
  { key: 'Keyboard', label: 'Keyboard', icon: Keyboard },
  { key: 'Mouse', label: 'Mouse', icon: Mouse },
  { key: 'Tv', label: 'Monitor', icon: Tv },
  { key: 'ShoppingBag', label: 'Merch', icon: ShoppingBag },
  { key: 'Sparkles', label: 'Collectibles', icon: Sparkles },
  { key: 'Cpu', label: 'Hardware', icon: Cpu },
  { key: 'Laptop', label: 'Laptop', icon: Laptop },
  { key: 'Smartphone', label: 'Mobile', icon: Smartphone },
  { key: 'Speaker', label: 'Speaker', icon: Speaker },
  { key: 'HardDrive', label: 'Storage', icon: HardDrive },
  { key: 'Flame', label: 'Trending', icon: Flame },
  { key: 'Shield', label: 'Protection', icon: Shield },
  { key: 'Zap', label: 'Power', icon: Zap },
  { key: 'Layers', label: 'General', icon: Layers },
];

export const getCategoryIcon = (iconKey?: string) => {
  const found = ICON_OPTIONS.find((i) => i.key === iconKey);
  return found ? found.icon : Tag;
};

export const AdminCategories: React.FC = () => {
  const {
    categories,
    storeProducts,
    addCategory,
    updateCategory,
    deleteCategory,
    showToast,
    playUiSound,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    iconKey: 'Gamepad2',
    description: '',
    displayOrder: 1,
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingCat, setDeletingCat] = useState<CategoryItem | null>(null);

  const handleOpenAdd = () => {
    playUiSound('click');
    setEditingCategory(null);
    setFormData({
      name: '',
      iconKey: 'Gamepad2',
      description: '',
      displayOrder: categories.length + 1,
      active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    playUiSound('click');
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      iconKey: cat.iconKey || 'Gamepad2',
      description: cat.description || '',
      displayOrder: cat.displayOrder ?? 1,
      active: cat.active,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    // Uniqueness check
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCategory?.id
    );

    if (isDuplicate) {
      setFormError(`A category named "${trimmedName}" already exists.`);
      return;
    }

    setIsSubmitting(true);
    playUiSound('click');

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: trimmedName,
          iconKey: formData.iconKey,
          description: formData.description.trim(),
          displayOrder: Number(formData.displayOrder),
          active: formData.active,
        });
      } else {
        await addCategory({
          name: trimmedName,
          iconKey: formData.iconKey,
          description: formData.description.trim(),
          displayOrder: Number(formData.displayOrder),
          active: formData.active,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCat) return;
    setIsSubmitting(true);
    try {
      const success = await deleteCategory(deletingCat.id);
      if (success) {
        setDeletingCat(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-purple-400" />
            <span>Product Categories</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize catalog navigation, assign visual icons, and configure storefront groupings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Table / Card Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Order</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Products</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCategories.map((cat) => {
                const Icon = getCategoryIcon(cat.iconKey);
                const count = storeProducts.filter((p) => p.categoryId === cat.id).length;

                return (
                  <tr key={cat.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono text-slate-400 font-bold">
                      #{cat.displayOrder ?? 0}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{cat.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {cat.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 max-w-xs truncate">
                      {cat.description || <span className="text-slate-600 italic">No description</span>}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        <Package className="w-3 h-3 text-blue-400" />
                        <span>{count} products</span>
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => updateCategory(cat.id, { active: !cat.active })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                          cat.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {cat.active ? (
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCat(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No categories found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-slate-400">Specify details and pick a Lucide icon identifier.</p>
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gaming Gear, Keyboards, Audio"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              {/* Icon Key Selector with Live Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Icon Identifier
                </label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {ICON_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = formData.iconKey === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => setFormData({ ...formData, iconKey: opt.key })}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg text-[10px] font-semibold transition ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <OptIcon className="w-4 h-4 mb-1" />
                        <span className="truncate w-full text-center">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description for category tags and SEO"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Visibility
                  </label>
                  <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-700 bg-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-300">
                      {formData.active ? 'Active & Visible' : 'Draft / Hidden'}
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
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
                >
                  {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal with Product Safety Checks */}
      <AdminConfirmModal
        isOpen={Boolean(deletingCat)}
        onClose={() => setDeletingCat(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Category "${deletingCat?.name}"?`}
        message={
          deletingCat && storeProducts.filter((p) => p.categoryId === deletingCat.id).length > 0
            ? `Warning: This category currently has ${
                storeProducts.filter((p) => p.categoryId === deletingCat.id).length
              } products associated with it. Please reassign or delete these products first, or toggle this category to Inactive.`
            : 'Are you sure you want to delete this category? This action will permanently remove it from Firestore and local storage.'
        }
        confirmText="Delete Category"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
