'use client';

import React, { useState } from 'react';
import { runDataCleaningPipeline, SAMPLE_RAW_BATCH, CleanedFareRecord, PipelineAuditSummary } from '@/lib/cleaningEngine';
import { Sparkles, CheckCircle2, Play, Ban, RefreshCw, Layers } from 'lucide-react';

export default function DataPipelineView() {
  const [pipelineOutput, setPipelineOutput] = useState<{
    cleanedRecords: CleanedFareRecord[];
    auditSummary: PipelineAuditSummary;
  }>(() => runDataCleaningPipeline(SAMPLE_RAW_BATCH));
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterState, setFilterState] = useState<'ALL' | 'ELIGIBLE' | 'OUTLIERS' | 'DUPLICATES' | 'IMPUTED'>('ALL');

  const handleRunPipeline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setPipelineOutput(runDataCleaningPipeline(SAMPLE_RAW_BATCH));
      setIsProcessing(false);
    }, 700);
  };

  const { cleanedRecords, auditSummary } = pipelineOutput;

  const filteredList = cleanedRecords.filter((rec) => {
    if (filterState === 'ELIGIBLE') return rec.include_in_cpi_index;
    if (filterState === 'OUTLIERS') return rec.is_outlier;
    if (filterState === 'DUPLICATES') return rec.is_duplicate;
    if (filterState === 'IMPUTED') return rec.imputation_applied;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#003f87] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#003f87]" />
            <span>Automated Data Quality & Statistical Normalization</span>
          </div>
          <h2 className="text-xl font-bold text-[#1f2937]">Data Cleaning, IQR Outlier Detection & Imputation</h2>
          <p className="text-xs text-[#6b7280] mt-0.5">
            Parses raw scrape payloads, normalizes currency, eliminates duplicate sessions, detects outliers (IQR & Z-score), and filters CPI index eligibility.
          </p>
        </div>

        <button
          onClick={handleRunPipeline}
          disabled={isProcessing}
          className="bg-[#003f87] text-white hover:bg-[#002d62] text-xs font-bold px-4 py-2.5 rounded flex items-center justify-center space-x-2 transition-all shadow-xs shrink-0 disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Normalizing Data...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Cleaning Pipeline</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-xs text-center">
          <span className="text-[11px] text-[#6b7280] block font-medium">Raw Ingested</span>
          <span className="text-xl font-extrabold text-[#1f2937]">{auditSummary.total_raw_ingested}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-xs text-center">
          <span className="text-[11px] text-[#6b7280] block font-medium">Duplicates Merged</span>
          <span className="text-xl font-extrabold text-amber-600">{auditSummary.duplicates_merged}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-xs text-center">
          <span className="text-[11px] text-[#6b7280] block font-medium">Outliers Flagged</span>
          <span className="text-xl font-extrabold text-rose-600">{auditSummary.outliers_flagged}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-xs text-center">
          <span className="text-[11px] text-[#6b7280] block font-medium">Imputed Fares</span>
          <span className="text-xl font-extrabold text-blue-600">{auditSummary.imputed_records_count}</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#e5e7eb] shadow-xs text-center">
          <span className="text-[11px] text-[#6b7280] block font-medium">Sold Out (Logged)</span>
          <span className="text-xl font-extrabold text-gray-500">{auditSummary.sold_out_excluded}</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-xs text-center">
          <span className="text-[11px] text-emerald-800 block font-medium">CPI Eligible Basket</span>
          <span className="text-xl font-extrabold text-emerald-700">{auditSummary.cpi_eligible_records}</span>
        </div>
      </div>

      {/* 5-Stage Pipeline Process Diagram */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#1f2937] flex items-center">
          <Layers className="w-4 h-4 mr-2 text-[#003f87]" />
          5-Stage Normalization Pipeline Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md space-y-1">
            <span className="font-bold text-[#003f87] block">1. Parser & Mapping</span>
            <p className="text-[11px] text-[#6b7280]">
              Extracts 14 schema attributes (carrier, flight_no, dates, taxes, UDF, convenience fee, base fare).
            </p>
          </div>

          <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md space-y-1">
            <span className="font-bold text-[#003f87] block">2. Currency & Imputation</span>
            <p className="text-[11px] text-[#6b7280]">
              Cleans ₹ strings, normalizes decimals, and applies corridor median imputation for missing values.
            </p>
          </div>

          <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md space-y-1">
            <span className="font-bold text-[#003f87] block">3. De-duplication</span>
            <p className="text-[11px] text-[#6b7280]">
              Fingerprints route-carrier-flight-departure-window to prevent duplicate scrape inflation.
            </p>
          </div>

          <div className="p-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-md space-y-1">
            <span className="font-bold text-[#003f87] block">4. IQR & Z-Score Filter</span>
            <p className="text-[11px] text-[#6b7280]">
              Calculates Q1, Q3, IQR and flags extreme fares (|Z| &gt; 2.5) per route-window.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md space-y-1">
            <span className="font-bold text-emerald-900 block">5. Basket Verification</span>
            <p className="text-[11px] text-emerald-700">
              Flags sold-out / cancelled flights for load-factor analytics while keeping CPI index pure.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Cleaned Records Table */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f3f4f6] pb-3">
          <h3 className="text-base font-bold text-[#1f2937]">Cleaned & Audited Fare Records</h3>

          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'All Records' },
              { id: 'ELIGIBLE', label: 'CPI Eligible Only' },
              { id: 'OUTLIERS', label: 'Outliers (IQR / Z)' },
              { id: 'DUPLICATES', label: 'Duplicates' },
              { id: 'IMPUTED', label: 'Imputed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterState(f.id as 'ALL' | 'ELIGIBLE' | 'OUTLIERS' | 'DUPLICATES' | 'IMPUTED')}
                className={`px-3 py-1 rounded font-medium transition-all ${
                  filterState === f.id
                    ? 'bg-[#003f87] text-white shadow-xs'
                    : 'bg-[#f9fafb] text-[#6b7280] hover:bg-[#e5e7eb]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-[#e5e7eb] rounded-md">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#f9fafb] text-[#1f2937] font-bold border-b border-[#e5e7eb]">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Route</th>
                <th className="p-3">Carrier / Flight</th>
                <th className="p-3">Lead Days</th>
                <th className="p-3">Base Fare</th>
                <th className="p-3">Taxes & UDF</th>
                <th className="p-3">Total Fare</th>
                <th className="p-3">Z-Score</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Audit Status</th>
                <th className="p-3">CPI Basket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb]">
              {filteredList.map((rec) => (
                <tr key={rec.record_id} className="hover:bg-[#f9fafb] transition-colors">
                  <td className="p-3 font-mono text-[11px] text-[#003f87] font-semibold">{rec.record_id}</td>
                  <td className="p-3 font-bold">{rec.origin} → {rec.destination}</td>
                  <td className="p-3">
                    <span className="font-semibold text-[#1f2937]">{rec.carrier}</span>
                    <span className="text-[10px] text-[#6b7280] block font-mono">{rec.flight_no}</span>
                  </td>
                  <td className="p-3">T+{rec.advance_purchase_days}</td>
                  <td className="p-3">₹{rec.base_fare.toLocaleString()}</td>
                  <td className="p-3 text-[#6b7280]">
                    ₹{rec.taxes.toLocaleString()} <span className="text-[10px]">(UDF: ₹{rec.udf})</span>
                  </td>
                  <td className="p-3 font-bold text-[#1f2937]">₹{rec.total_fare.toLocaleString()}</td>
                  <td className="p-3 font-mono text-[11px]">
                    <span className={Math.abs(rec.z_score) > 2.0 ? 'text-rose-600 font-bold' : 'text-[#6b7280]'}>
                      {rec.z_score > 0 ? `+${rec.z_score}` : rec.z_score}
                    </span>
                  </td>
                  <td className="p-3">
                    {rec.seat_availability_flag === 'AVAILABLE' && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        Available
                      </span>
                    )}
                    {rec.seat_availability_flag === 'FEW_SEATS_LEFT' && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        Few Seats
                      </span>
                    )}
                    {rec.seat_availability_flag === 'SOLD_OUT' && (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center">
                        <Ban className="w-3 h-3 mr-0.5" /> Sold Out
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {rec.is_duplicate && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Duplicate Merged
                      </span>
                    )}
                    {rec.is_outlier && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded block" title={rec.outlier_reason}>
                        {rec.iqr_status === 'HIGH_OUTLIER' ? 'High Outlier (IQR)' : 'Outlier Flagged'}
                      </span>
                    )}
                    {rec.imputation_applied && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded inline-block mt-0.5">
                        Imputed ({rec.imputed_fields.join(', ')})
                      </span>
                    )}
                    {!rec.is_duplicate && !rec.is_outlier && !rec.imputation_applied && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Verified Clean
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {rec.include_in_cpi_index ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1" /> Included
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-400 text-[11px]">
                        <Ban className="w-3.5 h-3.5 mr-1" /> Excluded
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
