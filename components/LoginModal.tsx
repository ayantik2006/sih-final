'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Key, Lock, UserCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: 'analyst' | 'public') => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('analyst@mospi.gov.in');
  const [password, setPassword] = useState('••••••••');
  const [apiKey, setApiKey] = useState('');
  const [activeTab, setActiveTab] = useState<'credentials' | 'apikey'>('credentials');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess('analyst');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-xl w-full max-w-md overflow-hidden space-y-4">
        {/* Header */}
        <div className="bg-[#003f87] text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Official Portal Access</h3>
              <p className="text-[11px] opacity-80">Ministry of Statistics & Programme Implementation</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 flex space-x-4 border-b border-[#e5e7eb] text-xs">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2 font-semibold transition-all border-b-2 ${
              activeTab === 'credentials'
                ? 'border-[#003f87] text-[#003f87]'
                : 'border-transparent text-[#6b7280]'
            }`}
          >
            Govt / RBI Credentials
          </button>
          <button
            onClick={() => setActiveTab('apikey')}
            className={`pb-2 font-semibold transition-all border-b-2 ${
              activeTab === 'apikey'
                ? 'border-[#003f87] text-[#003f87]'
                : 'border-transparent text-[#6b7280]'
            }`}
          >
            API Key Auth
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 text-xs">
          {activeTab === 'credentials' ? (
            <>
              <div>
                <label className="font-bold text-[#1f2937] block mb-1">Official Govt Email (.gov.in / .rbi.org.in):</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 absolute left-3 top-2.5 text-[#6b7280]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#d0d0d0] rounded focus:outline-none focus:border-[#003f87]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1f2937] block mb-1">Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-[#6b7280]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-[#d0d0d0] rounded focus:outline-none focus:border-[#003f87]"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="font-bold text-[#1f2937] block mb-1">Restricted API Secret Key:</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-2.5 text-[#6b7280]" />
                <input
                  type="text"
                  placeholder="apix_live_sec_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#d0d0d0] rounded font-mono text-xs focus:outline-none focus:border-[#003f87]"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#003f87] text-white hover:bg-[#002d62] py-2.5 rounded font-bold transition-all shadow-xs"
            >
              Authorize Analyst Session
            </button>
          </div>

          <p className="text-[10px] text-[#6b7280] text-center">
            Restricted to MoSPI statisticians, RBI monetary policy analysts, and SIH 2026 evaluators.
          </p>
        </form>
      </div>
    </div>
  );
}
