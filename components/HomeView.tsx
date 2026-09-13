'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { INITIAL_INDEX_DATA, POPULAR_ROUTES } from '@/lib/mockData';
import { ArrowUpRight, TrendingUp, CheckCircle2, FileText, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import { TabType } from './Header';

interface HomeViewProps {
  onNavigate: (tab: TabType) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [range, setRange] = useState<'30d' | '90d' | '1y'>('30d');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#003f87] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#003f87]" />
            <span>National CPI Augmentation Baseline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1f2937] tracking-tight">
            102.45
            <span className="ml-3 text-base font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-flex items-center">
              ↑ 1.2% <span className="text-xs font-normal text-[#6b7280] ml-1">from yesterday</span>
            </span>
          </h2>
          <p className="text-xs text-[#6b7280]">
            Airfare Price Index (APIx) • Base Period = 100 (Jan 2025) • Statistically weighted across top 15 DGCA flight corridors
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-[#f9fafb] p-3.5 rounded border border-[#e5e7eb] text-xs space-y-1">
            <span className="text-[#6b7280] block font-medium">DGCA Backtest Correlation</span>
            <span className="text-base font-bold text-emerald-700 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> r = 0.892 (Strong)
            </span>
          </div>
          <div className="bg-[#f9fafb] p-3.5 rounded border border-[#e5e7eb] text-xs space-y-1">
            <span className="text-[#6b7280] block font-medium">Scrape Coverage</span>
            <span className="text-base font-bold text-[#003f87] flex items-center">
              5 Airlines • 3 OTAs
            </span>
          </div>
        </div>
      </div>

      {/* Main Index Trend Chart Section */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f4f6] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#1f2937] flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#003f87]" />
              Airfare Price Index (APIx) vs. Official DGCA Benchmark
            </h3>
            <p className="text-xs text-[#6b7280]">
              Overlaying daily scraped fare index against published monthly DGCA averages for policy validation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {(['30d', '90d', '1y'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  range === r
                    ? 'bg-[#003f87] text-white shadow-xs'
                    : 'bg-[#f9fafb] text-[#6b7280] hover:bg-[#e5e7eb]'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INITIAL_INDEX_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(value, name) => [String(value ?? ''), name === 'apixValue' ? 'APIx Scraped Index' : 'DGCA Official Baseline']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="apixValue" stroke="#003f87" strokeWidth={2.5} dot={{ r: 4, fill: '#003f87' }} name="APIx Scraped Index (Daily)" />
                <Line type="monotone" dataKey="dgcaBenchmark" stroke="#0284c7" strokeWidth={2} strokeDasharray="5 5" dot={false} name="DGCA Official Benchmark" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Key Stats Side Panel */}
          <div className="bg-[#f9fafb] p-4 rounded-md border border-[#e5e7eb] space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1f2937] uppercase tracking-wider mb-3">Key Monthly Statistics</h4>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                  <dt className="text-[#6b7280]">Minimum Fare Observed:</dt>
                  <dd className="font-bold text-[#1f2937]">₹3,200</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                  <dt className="text-[#6b7280]">Maximum Fare Observed:</dt>
                  <dd className="font-bold text-[#1f2937]">₹8,900</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                  <dt className="text-[#6b7280]">Monthly Average Fare:</dt>
                  <dd className="font-bold text-[#003f87]">₹4,850</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-[#e5e7eb]">
                  <dt className="text-[#6b7280]">Mean Abs % Error (MAPE):</dt>
                  <dd className="font-bold text-emerald-700">3.12%</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-[#6b7280]">Index Weight Formula:</dt>
                  <dd className="font-medium text-[#1f2937]">Fisher Ideal Index</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-3 rounded border border-[#e5e7eb] text-[11px] text-[#6b7280]">
              <span className="font-semibold text-[#1f2937] flex items-center gap-1 mb-1">
                <Info className="w-3.5 h-3.5 text-[#003f87]" /> Methodological Note
              </span>
              Route weights are derived from DGCA monthly passenger traffic distribution (e.g. DEL-BOM = 18%).
            </div>
          </div>
        </div>
      </div>

      {/* Most Searched Corridors */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1f2937]">High-Density Flight Corridors (DGCA Basket)</h3>
          <button
            onClick={() => onNavigate('routes')}
            className="text-xs text-[#003f87] font-semibold hover:underline flex items-center"
          >
            Explore All Routes <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_ROUTES.map((route) => (
            <div key={route.code} className="p-4 rounded-md border border-[#e5e7eb] bg-[#f9fafb] hover:bg-white hover:border-[#003f87] transition-all group">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm text-[#1f2937] group-hover:text-[#003f87] transition-colors">
                    {route.name}
                  </h4>
                  <span className="text-[11px] text-[#6b7280]">Code: {route.code} • Traffic: {route.volume}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${route.trend.startsWith('+') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {route.trend}
                </span>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div>
                  <span className="text-[10px] text-[#6b7280] block">Average Ticket Fare</span>
                  <span className="text-lg font-bold text-[#1f2937]">₹{route.price.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6b7280] block">DGCA Weight</span>
                  <span className="text-xs font-semibold text-[#003f87]">{(route.dgcaWeight * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('scrapers')}
          className="bg-white p-5 rounded-lg border border-[#e5e7eb] hover:border-[#003f87] transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-[#e8f4f8] text-[#003f87] flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#1f2937] group-hover:text-[#003f87] flex items-center">
            Scraping Engine & Compliance <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-xs text-[#6b7280] mt-1">
            Monitor Playwright/Scrapy runs, robots.txt adherence, and CAPTCHA rate-limits.
          </p>
        </div>

        <div
          onClick={() => onNavigate('analysis')}
          className="bg-white p-5 rounded-lg border border-[#e5e7eb] hover:border-[#003f87] transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-[#e8f4f8] text-[#003f87] flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#1f2937] group-hover:text-[#003f87] flex items-center">
            Market Heatmap & Elasticity <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-xs text-[#6b7280] mt-1">
            Analyze route x booking window pricing matrix (T+1 to T+45 lead time).
          </p>
        </div>

        <div
          onClick={() => onNavigate('api')}
          className="bg-white p-5 rounded-lg border border-[#e5e7eb] hover:border-[#003f87] transition-all cursor-pointer group"
        >
          <div className="w-8 h-8 rounded bg-[#e8f4f8] text-[#003f87] flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-[#1f2937] group-hover:text-[#003f87] flex items-center">
            REST API & OpenAPI Docs <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-xs text-[#6b7280] mt-1">
            Direct REST endpoints for NSO statisticians and RBI monetary policy consumption.
          </p>
        </div>
      </div>
    </div>
  );
}
