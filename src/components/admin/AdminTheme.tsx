import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeSettings } from '../../types';
import {
  Palette,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Star,
  ExternalLink,
  Eye,
  Sliders,
  Layers,
  Square,
  Circle,
  Sun,
  Moon,
} from 'lucide-react';

const PRESET_THEMES: { name: string; theme: Partial<ThemeSettings> }[] = [
  {
    name: 'Cyberpunk Neon (Default)',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#06b6d4',
      backgroundColor: '#020617',
      textColor: '#f8fafc',
      buttonStyle: 'glow',
      borderRadius: 'lg',
      cardStyle: 'bordered',
      mode: 'dark',
    },
  },
  {
    name: 'Stealth Obsidian',
    theme: {
      primaryColor: '#64748b',
      secondaryColor: '#334155',
      accentColor: '#38bdf8',
      backgroundColor: '#090d16',
      textColor: '#ffffff',
      buttonStyle: 'sharp',
      borderRadius: 'sm',
      cardStyle: 'elevated',
      mode: 'dark',
    },
  },
  {
    name: 'Solar Flare Orange',
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#ec4899',
      accentColor: '#eab308',
      backgroundColor: '#0c0a09',
      textColor: '#fafaf9',
      buttonStyle: 'pill',
      borderRadius: 'full',
      cardStyle: 'bordered',
      mode: 'dark',
    },
  },
  {
    name: 'Emerald Matrix',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#06b6d4',
      accentColor: '#84cc16',
      backgroundColor: '#022c22',
      textColor: '#f0fdf4',
      buttonStyle: 'rounded',
      borderRadius: 'md',
      cardStyle: 'glass',
      mode: 'dark',
    },
  },
];

export const AdminTheme: React.FC = () => {
  const { themeSettings, updateThemeSettings, showToast, playUiSound } = useApp();

  const [form, setForm] = useState<ThemeSettings>({ ...themeSettings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    playUiSound('click');
    try {
      await updateThemeSettings(form);
      playUiSound('success');
      showToast('Theme Updated', 'Visual styles and palette synced to Firestore and storefront.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = (preset: Partial<ThemeSettings>) => {
    playUiSound('click');
    setForm((prev) => ({ ...prev, ...preset }));
  };

  const handleReset = () => {
    playUiSound('click');
    setForm({ ...themeSettings });
  };

  // Helper for border radius classes
  const getRadiusClass = (radius: string) => {
    switch (radius) {
      case 'none':
        return 'rounded-none';
      case 'sm':
        return 'rounded-sm';
      case 'md':
        return 'rounded-md';
      case 'full':
        return 'rounded-full';
      case 'lg':
      default:
        return 'rounded-2xl';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <span>Theme & Visual Customizer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Store theme variables in Firestore with dynamic real-time storefront style injection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-600/30 flex items-center gap-2 transition"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Theme</span>
          </button>
        </div>
      </div>

      {/* Preset Packs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Curated Cyber Themes</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset.theme)}
              className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-left transition group space-y-2"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.theme.primaryColor }}
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.theme.secondaryColor }}
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: preset.theme.accentColor }}
                />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-pink-400 transition truncate">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form & Live Interactive Preview */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Color Palette Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Palette & Color Tokens</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Accent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Highlight Accent
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={form.accentColor}
                    onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Background Base
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.backgroundColor}
                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={form.backgroundColor}
                    onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Component Geometries */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Component Geometries & Styles</span>
            </h2>

            {/* Button Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Button Style</label>
              <div className="grid grid-cols-4 gap-2">
                {(['glow', 'rounded', 'pill', 'sharp'] as const).map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setForm({ ...form, buttonStyle: style })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl capitalize transition ${
                      form.buttonStyle === style
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Border Radius Curve
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
                  <button
                    type="button"
                    key={radius}
                    onClick={() => setForm({ ...form, borderRadius: radius })}
                    className={`py-2 px-2 text-xs font-bold rounded-xl uppercase transition text-center ${
                      form.borderRadius === radius
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {radius}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Card Style</label>
              <div className="grid grid-cols-4 gap-2">
                {(['bordered', 'elevated', 'glass', 'flat'] as const).map((style) => (
                  <button
                    type="button"
                    key={style}
                    onClick={() => setForm({ ...form, cardStyle: style })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl capitalize transition ${
                      form.cardStyle === style
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance Mode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Appearance Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setForm({ ...form, mode: m })}
                    className={`py-2 px-3 text-xs font-bold rounded-xl capitalize transition ${
                      form.mode === m
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Live Interactive Component Sandbox</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Dynamic Preview</span>
            </div>

            {/* Preview Box Styled in Selected Theme */}
            <div
              className={`p-6 border border-slate-700/60 shadow-2xl space-y-5 transition-all duration-300 ${getRadiusClass(
                form.borderRadius
              )}`}
              style={{
                backgroundColor: form.backgroundColor,
                color: form.textColor,
              }}
            >
              {/* Product Card Example */}
              <div
                className={`p-4 bg-slate-900/80 border border-slate-800 transition ${getRadiusClass(
                  form.borderRadius
                )} ${
                  form.cardStyle === 'elevated'
                    ? 'shadow-2xl'
                    : form.cardStyle === 'glass'
                    ? 'backdrop-blur-md bg-white/5'
                    : ''
                }`}
              >
                <div className="aspect-video w-full rounded-lg bg-slate-950 overflow-hidden mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
                    alt="Preview Gear"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase"
                    style={{
                      backgroundColor: `${form.primaryColor}25`,
                      color: form.primaryColor,
                    }}
                  >
                    Flagship Gear
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-white mb-1">Cyber Pulse Wireless Pro</h4>
                <div className="text-base font-black text-white mb-3">$149.99</div>

                {/* Styled Button */}
                <button
                  type="button"
                  className={`w-full py-2.5 px-4 text-xs font-black text-white transition flex items-center justify-center gap-2 ${
                    form.buttonStyle === 'pill'
                      ? 'rounded-full'
                      : form.buttonStyle === 'sharp'
                      ? 'rounded-none'
                      : 'rounded-xl'
                  }`}
                  style={{
                    backgroundColor: form.primaryColor,
                    boxShadow:
                      form.buttonStyle === 'glow'
                        ? `0 10px 25px -5px ${form.primaryColor}60`
                        : undefined,
                  }}
                >
                  <span>Buy Now on Partner Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Accent Badges */}
              <div className="flex items-center justify-between text-xs pt-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${form.secondaryColor}25`,
                    color: form.secondaryColor,
                  }}
                >
                  Secondary Accent
                </span>

                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${form.accentColor}25`,
                    color: form.accentColor,
                  }}
                >
                  Highlight Tag
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
