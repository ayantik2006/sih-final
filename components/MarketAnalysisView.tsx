'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { HEATMAP_DATA, ELASTICITY_DATA } from '@/lib/mockData';
import { Grid, Sparkles, Info } from 'lucide-react';

export default function MarketAnalysisView() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'elasticity' | 'volatility'>('heatmap');

  const getHeatmapColor = (price: number) => {
    if (price > 7000) return 'bg-[#003f87] text-white'; // Expensive
    if (price > 4500) return 'bg-[#0284c7] text-white'; // Moderate High
    if (price > 3000) return 'bg-[#7dd3fc] text-[#003f87] font-semibold'; // Moderate
    return 'bg-[#e0f2fe] text-[#0369a1] font-medium'; // Affordable
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tab Header */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f4f6] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1f2937]">Market Analysis & Price Dynamics</h2>
            <p className="text-xs text-[#6b7280]">
              Advance-purchase window elasticity, cross-corridor heatmaps, and seasonal volatility
            </p>
          </div>

          <div className="flex space-x-2 border-b sm:border-b-0 border-[#e5e7eb]">
            {[
              { id: 'heatmap', label: 'Route Heatmap' },
              { id: 'elasticity', label: 'Price Elasticity' },
              { id: 'volatility', label: 'Volatility Index' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'heatmap' | 'elasticity' | 'volatility')}
                className={`px-4 py-2 text-xs font-semibold rounded-t sm:rounded transition-all ${
                  activeTab === t.id
                    ? 'bg-[#003f87] text-white shadow-xs'
                    : 'bg-[#f9fafb] text-[#6b7280] hover:bg-[#e5e7eb]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* HEATMAP SECTION */}
        {activeTab === 'heatmap' && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1f2937] flex items-center">
                <Grid className="w-4 h-4 mr-1.5 text-[#003f87]" />
                Fare Matrix: Route vs. Booking Window (₹ Average)
              </h3>
              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[#6b7280]">Legend:</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-[#003f87] rounded mr-1"></span> Expensive (₹7k+)</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-[#0284c7] rounded mr-1"></span> Moderate (₹4.5k–₹7k)</span>
                <span className="flex items-center"><span className="w-3 h-3 bg-[#e0f2fe] rounded border border-[#7dd3fc] mr-1"></span> Affordable (&lt;₹3k)</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#e5e7eb] rounded-lg">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#f9fafb] text-[#1f2937] font-bold border-b border-[#e5e7eb]">
                  <tr>
                    <th className="p-3 border-r border-[#e5e7eb]">Corridor Route</th>
                    <th className="p-3 text-center">T+1 (1 Day)</th>
                    <th className="p-3 text-center">T+7 (7 Days)</th>
                    <th className="p-3 text-center">T+15 (15 Days)</th>
                    <th className="p-3 text-center">T+30 (30 Days)</th>
                    <th className="p-3 text-center">T+45 (45 Days)</th>
                  </tr>
                </thead>
                <tbody>
                  {HEATMAP_DATA.map((row) => (
                    <tr key={row.route} className="border-b border-[#e5e7eb]">
                      <td className="p-3 font-bold text-[#1f2937] border-r border-[#e5e7eb] bg-[#f9fafb]">
                        {row.route}
                      </td>
                      <td className="p-1 text-center">
                        <div className={`p-2.5 rounded text-xs transition-transform hover:scale-105 ${getHeatmapColor(row.t1)}`}>
                          ₹{row.t1.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`p-2.5 rounded text-xs transition-transform hover:scale-105 ${getHeatmapColor(row.t7)}`}>
                          ₹{row.t7.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`p-2.5 rounded text-xs transition-transform hover:scale-105 ${getHeatmapColor(row.t15)}`}>
                          ₹{row.t15.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`p-2.5 rounded text-xs transition-transform hover:scale-105 ${getHeatmapColor(row.t30)}`}>
                          ₹{row.t30.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className={`p-2.5 rounded text-xs transition-transform hover:scale-105 ${getHeatmapColor(row.t45)}`}>
                          ₹{row.t45.toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-[#f9fafb] p-4 rounded-md border border-[#e5e7eb] flex items-start space-x-3 text-xs text-[#6b7280]">
              <Info className="w-4 h-4 text-[#003f87] shrink-0 mt-0.5" />
              <p>
                <strong>Statistical Insight for Inflation Analysts:</strong> Fares experience severe non-linear escalation within $T+7$ window due to airline revenue management algorithms. Tracking $T+15$ and $T+30$ provides a more stable baseline for core CPI inflation calculation.
              </p>
            </div>
          </div>
        )}

        {/* ELASTICITY SECTION */}
        {activeTab === 'elasticity' && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-[#1f2937]">Booking Window Lead-Time Elasticity Curve</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ELASTICITY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="window" stroke="#6b7280" fontSize={12} tickLine={false} />
                  <YAxis domain={[2000, 9000]} stroke="#6b7280" fontSize={12} tickLine={false} />
                  <Tooltip formatter={(val) => [`₹${val ?? ''}`, 'Average Price']} />
                  <Area type="monotone" dataKey="avgFare" stroke="#003f87" fill="#e8f4f8" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-md flex items-center space-x-3 text-xs text-emerald-900">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Sweet Spot Recommendation:</span>
                Booking between 15 to 25 days in advance yields the optimal fare saving of ₹2,000–₹4,300 compared to last-minute ($T+1$) prices.
              </div>
            </div>
          </div>
        )}

        {/* VOLATILITY SECTION */}
        {activeTab === 'volatility' && (
          <div className="space-y-4 pt-2 text-xs">
            <h3 className="text-sm font-bold text-[#1f2937]">Route Volatility & Anomaly Index</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[#e5e7eb] rounded bg-[#f9fafb]">
                <h4 className="font-bold text-[#1f2937] mb-2">Highest Volatility Corridors (30-Day SD)</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between border-b pb-1"><span>DEL → BOM:</span><strong className="text-amber-600">22.4% Volatility</strong></li>
                  <li className="flex justify-between border-b pb-1"><span>MAA → DEL:</span><strong className="text-amber-600">19.8% Volatility</strong></li>
                  <li className="flex justify-between"><span>DEL → BLR:</span><strong className="text-amber-600">18.1% Volatility</strong></li>
                </ul>
              </div>

              <div className="p-4 border border-[#e5e7eb] rounded bg-[#f9fafb]">
                <h4 className="font-bold text-[#1f2937] mb-2">Lowest Volatility Corridors (Stable)</h4>
                <ul className="space-y-2">
                  <li className="flex justify-between border-b pb-1"><span>BLR → HYD:</span><strong className="text-emerald-700">8.2% Volatility</strong></li>
                  <li className="flex justify-between border-b pb-1"><span>BOM → BLR:</span><strong className="text-emerald-700">11.5% Volatility</strong></li>
                  <li className="flex justify-between"><span>DEL → CCU:</span><strong className="text-emerald-700">13.0% Volatility</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
