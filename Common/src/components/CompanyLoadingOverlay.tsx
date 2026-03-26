import React, { useState, useEffect } from 'react';
import { CompanySpinner } from './CompanySpinner';

interface CompanyLoadingOverlayProps {
  isLoading: boolean;
  delayMs?: number;
  message?: string;
  isInsideContainer?: boolean;
}

export const CompanyLoadingOverlay: React.FC<CompanyLoadingOverlayProps> = ({
  isLoading,
  delayMs = 500,
  message,
  isInsideContainer = true,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [isFadingIn, setIsFadingIn] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShouldShow(false);
      setIsFadingIn(false);
      return;
    }

    const timer = setTimeout(() => {
      setShouldShow(true);
      // レンダリング直後にopacityを変化させてフェードインさせる
      requestAnimationFrame(() => setIsFadingIn(true));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isLoading, delayMs]);

  if (!shouldShow) return null;

  return (
    <div
      className={`
        flex flex-col items-center justify-center z-50 
        bg-black/50
        transition-opacity duration-300 ease-out
        ${isFadingIn ? 'opacity-100' : 'opacity-0'}
        ${isInsideContainer ? 'absolute inset-0 rounded-lg' : 'fixed inset-0'}
      `}
    >
      <div className="bg-white/95 p-6 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center gap-4 border border-white">
        <CompanySpinner size="lg" className="text-teal-600" />
        {message && (
          <p className="font-bold text-teal-800 animate-pulse text-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
