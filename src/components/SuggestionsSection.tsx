import React, { useState, useRef, useEffect } from 'react';
import { ProductItem, SuggestionRecommendations } from '../utils/recommendations';
import { resolveAssetUrl } from '../utils/assetPath';
import { Sparkles, ShieldCheck, Zap, X } from 'lucide-react';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
}

/**
 * Full-screen modal overlay presenting the exact same product animation in true full-screen scale.
 * Not constrained by parent card/section containers.
 */
export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [isPopped, setIsPopped] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!product) return;

    // Initial pop entrance animation
    setIsPopped(true);
    timerRef.current = setTimeout(() => {
      setIsPopped(false);
    }, 1800);

    // Prevent background body scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Close on Escape key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleProductClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPopped(true);
    timerRef.current = setTimeout(() => {
      setIsPopped(false);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={onClose}
    >
      <div
        className="relative max-w-sm sm:max-w-md w-full bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-slate-300 hover:text-white transition shadow-sm"
          aria-label="बंद करा (Close)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Tag */}
        <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-500/30 mb-2">
          पोषण उत्पादन (Nutrition Product)
        </span>

        {/* Product Animation in Full-Screen Scale */}
        <div
          onClick={handleProductClick}
          className="relative flex items-center justify-center h-64 sm:h-72 w-full my-3 cursor-pointer select-none group outline-none"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleProductClick();
            }
          }}
        >
          <img
            src={resolveAssetUrl(product.imagePath)}
            alt={product.name}
            className={`max-h-full max-w-full object-contain select-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isPopped
                ? '-translate-y-4 scale-110 drop-shadow-[0_24px_35px_rgba(0,0,0,0.55)]'
                : 'drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)] group-hover:-translate-y-2 group-hover:scale-105'
            }`}
            style={{
              imageRendering: '-webkit-optimize-contrast',
              willChange: 'transform, filter',
              transformOrigin: 'center bottom',
              backfaceVisibility: 'hidden',
            }}
          />
        </div>

        {/* Grounding Shadow */}
        <div
          className={`h-3 bg-radial from-slate-900/60 via-slate-950/40 to-transparent rounded-[100%] blur-[2px] transition-all duration-300 ${
            isPopped ? 'w-44 opacity-40 scale-90 translate-y-1' : 'w-36 opacity-75 group-hover:w-40'
          }`}
        />

        {/* Typography */}
        <div className="mt-4 space-y-1 px-2">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {product.name}
          </h3>
          {product.marathiName && (
            <p className="text-sm sm:text-base font-semibold text-emerald-400">
              {product.marathiName}
            </p>
          )}
        </div>

        {/* Bottom Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-sm rounded-2xl border border-white/10 transition"
        >
          बंद करा (Close)
        </button>
      </div>
    </div>
  );
};

interface ProductDisplayItemProps {
  product: ProductItem;
  onOpenModal: (product: ProductItem) => void;
}

export const ProductDisplayItem: React.FC<ProductDisplayItemProps> = ({ product, onOpenModal }) => {
  const [isPopped, setIsPopped] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsPopped(true);
    timerRef.current = setTimeout(() => {
      setIsPopped(false);
    }, 1500);

    // Open the same animation in a true full-screen overlay/modal
    onOpenModal(product);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="flex flex-col items-center justify-end text-center p-2 cursor-pointer select-none group outline-none"
    >
      {/* Product Image Cutout Container (No background card/panel) */}
      <div className="relative flex items-center justify-center h-32 sm:h-36 w-full">
        <img
          src={resolveAssetUrl(product.imagePath)}
          alt={product.name}
          className={`max-h-full max-w-full object-contain select-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isPopped
              ? '-translate-y-3.5 scale-110 drop-shadow-[0_16px_22px_rgba(0,0,0,0.24)]'
              : 'drop-shadow-[0_6px_10px_rgba(0,0,0,0.12)] group-hover:-translate-y-1 group-hover:scale-105'
          }`}
          style={{
            imageRendering: '-webkit-optimize-contrast',
            willChange: 'transform, filter',
            transformOrigin: 'center bottom',
            backfaceVisibility: 'hidden',
          }}
          loading="eager"
        />
      </div>

      {/* Subtle Grounding Shadow */}
      <div
        className={`h-2 bg-radial from-slate-900/25 via-slate-900/8 to-transparent rounded-[100%] blur-[1.5px] mt-1.5 transition-all duration-300 ${
          isPopped
            ? 'w-24 opacity-40 scale-90 translate-y-1'
            : 'w-20 opacity-75 group-hover:w-22 group-hover:opacity-60'
        }`}
      />

      {/* Product Typography */}
      <div className="mt-2 space-y-0.5 px-1 max-w-[150px]">
        <p className="text-xs sm:text-sm font-extrabold text-slate-800 leading-snug tracking-tight">
          {product.name}
        </p>
        {product.marathiName && (
          <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700 leading-tight">
            {product.marathiName}
          </p>
        )}
      </div>
    </div>
  );
};

interface SuggestionsSectionProps {
  recommendations: SuggestionRecommendations;
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({ recommendations }) => {
  const { conditionalProducts, compulsoryProducts, energyFitnessProducts } = recommendations;
  const [modalProduct, setModalProduct] = useState<ProductItem | null>(null);

  return (
    <div className="space-y-6 pt-2">
      {/* Main Section Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-white/10 text-yellow-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
            सल्ले व पोषण मार्गदर्शन (Suggestions & Recommended Nutrition)
          </h2>
        </div>
        <p className="text-xs text-emerald-100 font-medium">
          आपल्या शरीर तपासणीनुसार योग्य पोषण व फिटनेस उत्पादने
        </p>
      </div>

      {/* 1. Condition-based Recommendations (Only displayed if conditions triggered) */}
      {conditionalProducts.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                १. तपासणीनुसार विशेष शिफारसी (Condition-based Recommendations)
              </h3>
              <p className="text-xs text-slate-500">
                तुमच्या शरीरातील चरबी, वजन व मेटॅबॉलिझमनुसार शिफारस
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-y-6 gap-x-3 sm:gap-6 justify-items-center">
            {conditionalProducts.map((prod) => (
              <ProductDisplayItem
                key={prod.id}
                product={prod}
                onOpenModal={(p) => setModalProduct(p)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Compulsory Nutrition (Always shown) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {conditionalProducts.length > 0 ? '२.' : '१.'} आवश्यक पोषण (Compulsory Nutrition)
            </h3>
            <p className="text-xs text-slate-500">
              दररोजच्या पोषणासाठी प्रत्येकासाठी आवश्यक मूलभूत उत्पादने
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-y-6 gap-x-3 sm:gap-6 justify-items-center">
          {compulsoryProducts.map((prod) => (
            <ProductDisplayItem
              key={prod.id}
              product={prod}
              onOpenModal={(p) => setModalProduct(p)}
            />
          ))}
        </div>
      </div>

      {/* 3. Energy & Fitness Category (Always shown) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {conditionalProducts.length > 0 ? '३.' : '२.'} ऊर्जा व तंदुरुस्ती (Energy & Fitness)
            </h3>
            <p className="text-xs text-slate-500">
              दिवसभर ताजी ऊर्जा व उत्तम ॲक्टिव्ह जीवनशैलीसाठी
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-y-6 gap-x-3 sm:gap-6 justify-items-center">
          {energyFitnessProducts.map((prod) => (
            <ProductDisplayItem
              key={prod.id}
              product={prod}
              onOpenModal={(p) => setModalProduct(p)}
            />
          ))}
        </div>
      </div>

      {/* Full-Screen Product Animation Modal Overlay */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
};
