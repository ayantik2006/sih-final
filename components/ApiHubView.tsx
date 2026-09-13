'use client';

import React, { useState } from 'react';
import { Code2, Play, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

type ApiPath = '/api/index' | '/api/fares' | '/api/trends' | '/api/export';

export default function ApiHubView() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiPath>('/api/index');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTestApi = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(selectedEndpoint);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch {
      setApiResponse(JSON.stringify({ error: 'Failed to execute endpoint' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (apiResponse) {
      navigator.clipboard.writeText(apiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#003f87] uppercase tracking-wider">
          <Code2 className="w-4 h-4 text-[#003f87]" />
          <span>OpenAPI / REST Integration Hub</span>
        </div>
        <h2 className="text-xl font-bold text-[#1f2937]">MoSPI & RBI Inflation Data REST API</h2>
        <p className="text-xs text-[#6b7280]">
          High-frequency API endpoints designed for consumption by RBI Monetary Policy Department and NSO Consumer Price Index sub-group teams.
        </p>
      </div>

      {/* Endpoint List & Live Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1f2937] border-b border-[#f3f4f6] pb-2">Available Endpoints</h3>
          <div className="space-y-2">
            {[
              { path: '/api/index', method: 'GET', desc: 'Fetch latest daily & monthly APIx index values' },
              { path: '/api/fares', method: 'GET', desc: 'Query raw fares by route, airline, & window' },
              { path: '/api/trends', method: 'GET', desc: 'Retrieve 30-day historical trend data & DGCA backtest' },
              { path: '/api/export', method: 'POST', desc: 'Trigger bulk data export in JSON/CSV format' },
            ].map((ep) => (
              <div
                key={ep.path}
                onClick={() => {
                  setSelectedEndpoint(ep.path as ApiPath);
                  setApiResponse(null);
                }}
                className={`p-3 rounded-md border cursor-pointer transition-all ${
                  selectedEndpoint === ep.path
                    ? 'bg-[#e8f4f8] border-[#003f87]'
                    : 'bg-[#f9fafb] border-[#e5e7eb] hover:bg-white'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ep.method === 'GET' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#003f87]">{ep.path}</span>
                </div>
                <p className="text-[11px] text-[#6b7280]">{ep.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Runner & Response Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-[#e5e7eb] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#f3f4f6] pb-3">
              <div>
                <span className="text-xs text-[#6b7280] block">Selected Endpoint</span>
                <span className="font-mono text-sm font-bold text-[#003f87]">{selectedEndpoint}</span>
              </div>
              <button
                onClick={handleTestApi}
                disabled={isLoading}
                className="bg-[#003f87] text-white hover:bg-[#002d62] text-xs font-bold px-4 py-2 rounded flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isLoading ? 'Executing...' : 'Execute Live Request'}</span>
              </button>
            </div>

            {/* Response Console */}
            <div className="bg-[#1f2937] rounded-md p-4 font-mono text-xs text-emerald-400 space-y-2 relative min-h-[260px] overflow-auto">
              <div className="flex justify-between items-center text-[11px] text-gray-400 border-b border-gray-700 pb-2">
                <span className="flex items-center">
                  <Terminal className="w-3.5 h-3.5 mr-1" /> HTTP 200 OK • Content-Type: application/json
                </span>
                {apiResponse && (
                  <button onClick={handleCopyCode} className="hover:text-white flex items-center space-x-1">
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                {apiResponse || `// Click "Execute Live Request" to hit ${selectedEndpoint} live`}
              </pre>
            </div>
          </div>

          <div className="bg-[#f9fafb] p-3 rounded border border-[#e5e7eb] text-xs text-[#6b7280] flex justify-between items-center">
            <span>Authentication: <strong>Bearer API Key</strong> required for write operations. Public summary read-only.</span>
            <a href="#openapi-json" className="text-[#003f87] font-semibold hover:underline flex items-center">
              OpenAPI 3.0 Spec <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
