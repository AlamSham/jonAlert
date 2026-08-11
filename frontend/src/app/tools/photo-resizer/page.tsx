'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function PhotoResizerPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetKb, setTargetKb] = useState<number>(50);
  const [resizedSrc, setResizedSrc] = useState<string | null>(null);
  const [resizedKb, setResizedKb] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setResizedSrc(null);
    };
    reader.readAsDataURL(file);
  };

  const resizeImage = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Maintain aspect ratio while scaling if image is large
      const maxDim = 800;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);

      // Binary search for quality to hit target KB limit
      let minQuality = 0.05;
      let maxQuality = 0.95;
      let bestDataUrl = canvas.toDataURL('image/jpeg', 0.8);

      for (let i = 0; i < 10; i++) {
        const midQuality = (minQuality + maxQuality) / 2;
        const dataUrl = canvas.toDataURL('image/jpeg', midQuality);
        const kbSize = Math.round((dataUrl.length * 3) / 4 / 1024);

        if (kbSize <= targetKb) {
          bestDataUrl = dataUrl;
          minQuality = midQuality;
        } else {
          maxQuality = midQuality;
        }
      }

      const finalKb = Math.round((bestDataUrl.length * 3) / 4 / 1024);
      setResizedSrc(bestDataUrl);
      setResizedKb(finalKb);
    };
  };

  return (
    <div className="animate-fade-in py-10 container-wrap max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-accent">Tools</Link>
        <span>/</span>
        <span className="text-ink font-bold">Photo Resizer</span>
      </nav>

      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-8">
          <span className="inline-block text-4xl mb-2">🖼️</span>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            Sarkari Photo & <span className="gradient-text">Signature Resizer</span>
          </h1>
          <p className="mt-2 text-xs text-muted">
            Candidate Passport Photo aur Signature ko 20KB, 50KB, 100KB me instant compress & resize karein. 100% Free & Private (No server upload).
          </p>
        </div>

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-300 hover:border-accent transition rounded-2xl p-8 text-center cursor-pointer bg-stone-50/50 hover:bg-stone-50"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <span className="text-4xl block mb-2">📤</span>
          <p className="text-sm font-bold text-ink">
            Click here to Upload Passport Photo or Signature
          </p>
          <p className="text-xs text-muted mt-1">Supports JPG, JPEG, PNG format</p>
        </div>

        {/* Target Preset Selection */}
        {imageSrc && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-black text-stone-700 mb-2">
                🎯 Select Target File Size Limit:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100].map((kb) => (
                  <button
                    key={kb}
                    onClick={() => setTargetKb(kb)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition border ${
                      targetKb === kb
                        ? 'bg-accent text-white border-accent shadow-md'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {kb} KB Limit
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={resizeImage}
              className="w-full rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 active:scale-95 flex items-center justify-center gap-2"
              id="resize-photo-btn"
            >
              <span>⚡</span> Resize & Compress Image Now
            </button>
          </div>
        )}

        {/* Output Download Section */}
        {resizedSrc && (
          <div className="mt-8 rounded-2xl bg-stone-900 text-white p-6 animate-slide-up border border-stone-800 text-center">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
              ✅ Resized Successfully ({resizedKb} KB)
            </p>
            <div className="inline-block p-2 bg-white rounded-xl mb-4 shadow-inner">
              <img src={resizedSrc} alt="Resized output" className="max-h-48 object-contain rounded-lg" />
            </div>
            <div>
              <a
                href={resizedSrc}
                download={`sarkaripulse-resized-${targetKb}kb.jpg`}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-xs font-black text-stone-900 shadow-md transition hover:bg-amber-300 active:scale-95"
              >
                <span>💾</span> Download Resized Photo ({resizedKb} KB)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
