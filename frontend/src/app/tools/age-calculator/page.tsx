'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState('');
  const [cutoffDate, setCutoffDate] = useState('2026-01-01');
  const [result, setResult] = useState<any>(null);

  const calculateAge = () => {
    if (!dob || !cutoffDate) return;

    const birthDate = new Date(dob);
    const targetDate = new Date(cutoffDate);

    if (birthDate > targetDate) {
      alert('Date of Birth cannot be after Cut-off Date!');
      return;
    }

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const totalTimeDiff = targetDate.getTime() - birthDate.getTime();
    const totalDays = Math.floor(totalTimeDiff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
    });
  };

  return (
    <div className="animate-fade-in py-10 container-wrap max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-accent">Tools</Link>
        <span>/</span>
        <span className="text-ink font-bold">Age Calculator</span>
      </nav>

      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-8">
          <span className="inline-block text-4xl mb-2">🧮</span>
          <h1 className="text-2xl sm:text-3xl font-black text-ink">
            Sarkari Job <span className="gradient-text">Age Calculator</span>
          </h1>
          <p className="mt-2 text-xs text-muted">
            UPSC, SSC, Railway, Police aur Bank forms ke cut-off date ke hisaab se apni exact Umar (Years, Months, Days) nikalein.
          </p>
        </div>

        {/* Form Controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-black text-stone-700 mb-1.5">
              📅 Date of Birth (Janm Tithi) *
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-3 text-sm font-semibold focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-stone-700 mb-1.5">
              🎯 Age As On Cut-off Date *
            </label>
            <input
              type="date"
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-3 text-sm font-semibold focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={calculateAge}
          className="mt-6 w-full rounded-2xl bg-accent px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-accent-dark active:scale-95 flex items-center justify-center gap-2"
          id="calculate-age-btn"
        >
          <span>⚡</span> Calculate Exact Age
        </button>

        {/* Output Display */}
        {result && (
          <div className="mt-8 rounded-2xl bg-stone-900 text-white p-6 animate-slide-up border border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 text-center">
              🎉 Your Exact Age Result
            </h3>
            
            <div className="grid grid-cols-3 gap-3 text-center border-b border-stone-800 pb-4 mb-4">
              <div>
                <span className="text-3xl sm:text-4xl font-black text-blue-400">{result.years}</span>
                <p className="text-[11px] text-stone-400 uppercase mt-1">Years</p>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">{result.months}</span>
                <p className="text-[11px] text-stone-400 uppercase mt-1">Months</p>
              </div>
              <div>
                <span className="text-3xl sm:text-4xl font-black text-amber-400">{result.days}</span>
                <p className="text-[11px] text-stone-400 uppercase mt-1">Days</p>
              </div>
            </div>

            <div className="flex justify-around text-center text-xs text-stone-300">
              <p>Total Days: <strong className="text-white">{result.totalDays.toLocaleString('en-IN')}</strong></p>
              <p>Total Weeks: <strong className="text-white">{result.totalWeeks.toLocaleString('en-IN')}</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
