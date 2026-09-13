'use client';

import React, { useState } from 'react';
import { MOCK_RAW_FARES } from '@/lib/mockData';
import { Search, Download, Copy, Check, X, Filter } from 'lucide-react';

export default function DataExplorerView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [copied, setCopied] = useState(false);

  const filteredFares = MOCK_RAW_FARES.filter((record) => {
    const matchesSearch =
      record.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRoute = selectedRoute === 'ALL' || record.route === selectedRoute;
    const matchesAirline = selectedAirline === 'ALL' || record.airline === selectedAirline;

    return matchesSearch && matchesRoute && matchesAirline;
  });

  const handleDownloadCSV = () => {
    let csv = "Date,Route,Airline,Window,BaseFare,Tax,TotalFare,Source\n";
    filteredFares.forEach((r) => {
      csv += `${r.date},${r.route},${r.airline},${r.bookingWindow},${r.baseFare},${r.tax},${r.totalFare},${r.source}\n`;
    });
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apix_raw_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredFares, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `apix_raw_data_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#1f2937]">Raw Data Explorer</h2>
          <p className="text-xs text-[#6b7280]">
            Audit individual scraped quotes, base fares, taxes, and source tracking metadata
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search route, airline, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs border border-[#d0d0d0] rounded bg-white focus:outline-none focus:border-[#003f87]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-[#6b7280] hover:text-[#1f2937]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#6b7280]" />
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="px-3 py-2 text-xs border border-[#d0d0d0] rounded bg-white focus:outline-none focus:border-[#003f87]"
            >
              <option value="ALL">All Routes</option>
              <option value="DEL-BOM">DEL-BOM</option>
              <option value="DEL-BLR">DEL-BLR</option>
              <option value="BOM-BLR">BOM-BLR</option>
              <option value="DEL-CCU">DEL-CCU</option>
              <option value="BLR-HYD">BLR-HYD</option>
            </select>

            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="px-3 py-2 text-xs border border-[#d0d0d0] rounded bg-white focus:outline-none focus:border-[#003f87]"
            >
              <option value="ALL">All Airlines</option>
              <option value="IndiGo">IndiGo</option>
              <option value="Air India">Air India</option>
              <option value="SpiceJet">SpiceJet</option>
              <option value="Akasa Air">Akasa Air</option>
            </select>

            {(selectedRoute !== 'ALL' || selectedAirline !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedRoute('ALL');
                  setSelectedAirline('ALL');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table & Actions */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[#6b7280]">
            Showing <strong>1–{filteredFares.length}</strong> of <strong>{filteredFares.length}</strong> records
          </span>

          <div className="flex space-x-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 text-xs font-semibold text-[#003f87] border border-[#003f87] rounded hover:bg-[#e8f4f8] flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 text-xs font-semibold text-[#003f87] border border-[#003f87] rounded hover:bg-[#e8f4f8] flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-medium text-[#6b7280] border border-[#d0d0d0] rounded hover:bg-[#f9fafb] flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#e5e7eb] rounded-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f9fafb] text-[#1f2937] font-bold border-b border-[#e5e7eb]">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Scrape Date</th>
                <th className="p-3">Route</th>
                <th className="p-3">Airline</th>
                <th className="p-3">Lead Window</th>
                <th className="p-3">Base Fare (₹)</th>
                <th className="p-3">Taxes/UDF (₹)</th>
                <th className="p-3">Total Fare (₹)</th>
                <th className="p-3">Scrape Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredFares.map((f) => (
                <tr key={f.id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="p-3 font-mono text-[11px] text-[#003f87]">{f.id}</td>
                  <td className="p-3 text-[#6b7280]">{f.date}</td>
                  <td className="p-3 font-bold text-[#1f2937]">{f.route}</td>
                  <td className="p-3 font-medium">{f.airline}</td>
                  <td className="p-3">
                    <span className="bg-[#e8f4f8] text-[#003f87] text-[10px] font-bold px-2 py-0.5 rounded">
                      {f.bookingWindow}
                    </span>
                  </td>
                  <td className="p-3">₹{f.baseFare.toLocaleString()}</td>
                  <td className="p-3 text-[#6b7280]">₹{f.tax.toLocaleString()}</td>
                  <td className="p-3 font-bold text-[#1f2937]">₹{f.totalFare.toLocaleString()}</td>
                  <td className="p-3 text-[#6b7280] text-[11px]">{f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
