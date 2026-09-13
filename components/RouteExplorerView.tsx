'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AIRLINE_COMPARISON, ELASTICITY_DATA } from '@/lib/mockData';
import { Download, Filter, Share2, Calendar, PlaneTakeoff, PlaneLanding } from 'lucide-react';

export default function RouteExplorerView() {
  const [fromCity, setFromCity] = useState('DEL');
  const [toCity, setToCity] = useState('BOM');
  const [windowFilter, setWindowFilter] = useState<'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45'>('T+7');

  // Generate dynamic chart data based on selected window
  const chartData = [
    { date: 'Sep 01', price: windowFilter === 'T+1' ? 8900 : windowFilter === 'T+7' ? 5800 : 4450 },
    { date: 'Sep 05', price: windowFilter === 'T+1' ? 8600 : windowFilter === 'T+7' ? 5600 : 4300 },
    { date: 'Sep 08', price: windowFilter === 'T+1' ? 9100 : windowFilter === 'T+7' ? 5900 : 4500 },
    { date: 'Sep 11', price: windowFilter === 'T+1' ? 8800 : windowFilter === 'T+7' ? 5700 : 4400 },
    { date: 'Sep 14', price: windowFilter === 'T+1' ? 9200 : windowFilter === 'T+7' ? 6100 : 4650 },
  ];

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Date,Route,Window,Price\n2026-09-14,DEL-BOM,T+7,4450\n2026-09-13,DEL-BOM,T+7,4400";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `route_${fromCity}_${toCity}_${windowFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Route Filter Controls */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-[#003f87] font-bold text-sm">
          <Filter className="w-4 h-4" />
          <span>Route & Booking Window Explorer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-[#1f2937] block mb-1">Origin City (From):</label>
            <div className="relative">
              <PlaneTakeoff className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#d0d0d0] rounded bg-[#ffffff] focus:outline-none focus:border-[#003f87] focus:ring-1 focus:ring-[#003f87]"
              >
                <option value="DEL">Delhi (DEL)</option>
                <option value="BOM">Mumbai (BOM)</option>
                <option value="BLR">Bengaluru (BLR)</option>
                <option value="CCU">Kolkata (CCU)</option>
                <option value="MAA">Chennai (MAA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1f2937] block mb-1">Destination City (To):</label>
            <div className="relative">
              <PlaneLanding className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#d0d0d0] rounded bg-[#ffffff] focus:outline-none focus:border-[#003f87] focus:ring-1 focus:ring-[#003f87]"
              >
                <option value="BOM">Mumbai (BOM)</option>
                <option value="DEL">Delhi (DEL)</option>
                <option value="BLR">Bengaluru (BLR)</option>
                <option value="HYD">Hyderabad (HYD)</option>
                <option value="GOI">Goa (GOI)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#1f2937] block mb-1">Departure Month:</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
              <input
                type="date"
                defaultValue="2026-09-14"
                className="w-full pl-9 pr-3 py-2 text-xs border border-[#d0d0d0] rounded bg-[#ffffff] focus:outline-none focus:border-[#003f87]"
              />
            </div>
          </div>
        </div>

        {/* Advance Purchase Buttons */}
        <div className="pt-2 border-t border-[#f3f4f6]">
          <span className="text-xs font-bold text-[#1f2937] block mb-2">Advance Purchase Window (Lead Time):</span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'T+1', label: 'T+1 (1 Day / Urgent)' },
              { id: 'T+7', label: 'T+7 (1 Week Advance)' },
              { id: 'T+15', label: 'T+15 (2 Weeks Advance)' },
              { id: 'T+30', label: 'T+30 (1 Month Advance)' },
              { id: 'T+45', label: 'T+45 (45 Days Advance)' },
            ].map((win) => (
              <button
                key={win.id}
                onClick={() => setWindowFilter(win.id as 'T+1' | 'T+7' | 'T+15' | 'T+30' | 'T+45')}
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all ${
                  windowFilter === win.id
                    ? 'bg-[#003f87] text-white border-[#003f87]'
                    : 'bg-white text-[#1f2937] border-[#d0d0d0] hover:bg-[#f9fafb]'
                }`}
              >
                {win.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Route Trend & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-[#f3f4f6] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1f2937]">
                {fromCity} → {toCity} | {windowFilter} Lead Time Trend
              </h3>
              <p className="text-xs text-[#6b7280]">Observed price range: ₹3,200 to ₹8,900</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#6b7280]">Average Fare</span>
              <span className="text-base font-bold text-[#003f87] block">
                ₹{chartData[chartData.length - 1].price.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#6b7280" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(val) => [`₹${val ?? ''}`, 'Average Fare']}
                />
                <Line type="monotone" dataKey="price" stroke="#003f87" strokeWidth={2.5} dot={{ r: 4, fill: '#003f87' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-[#f3f4f6]">
            <div className="flex space-x-2">
              <button onClick={handleDownloadCSV} className="text-xs font-semibold text-[#003f87] border border-[#003f87] px-3 py-1.5 rounded hover:bg-[#e8f4f8] flex items-center">
                <Download className="w-3.5 h-3.5 mr-1" /> Download CSV
              </button>
              <button className="text-xs font-medium text-[#6b7280] border border-[#d0d0d0] px-3 py-1.5 rounded hover:bg-[#f9fafb] flex items-center">
                <Share2 className="w-3.5 h-3.5 mr-1" /> Share Route Link
              </button>
            </div>
            <span className="text-[11px] text-[#6b7280]">Volatility Index: <strong>14.2%</strong></span>
          </div>
        </div>

        {/* Airline Breakdown Panel */}
        <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#1f2937] border-b border-[#f3f4f6] pb-2">
            Airline Price Comparison ({fromCity}–{toCity})
          </h3>

          <div className="space-y-3">
            {AIRLINE_COMPARISON.map((air) => (
              <div key={air.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#1f2937]">{air.name}</span>
                  <span className="font-bold text-[#003f87]">₹{air.avgPrice.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(air.avgPrice / 5500) * 100}%`,
                      backgroundColor: air.color,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#6b7280]">
                  <span>Market Share: {air.marketShare}</span>
                  <span>On-Time: {air.reliability}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#f3f4f6] space-y-2">
            <h4 className="text-xs font-bold text-[#1f2937]">Lead Time Price Progression</h4>
            <div className="space-y-1 text-xs">
              {ELASTICITY_DATA.map((e) => (
                <div key={e.window} className="flex justify-between py-1 border-b border-[#f9fafb]">
                  <span className="text-[#6b7280]">{e.label}:</span>
                  <span className="font-bold text-[#1f2937]">₹{e.avgFare.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
