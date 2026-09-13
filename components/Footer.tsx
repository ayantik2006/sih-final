'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f9fafb] border-t border-[#e5e7eb] py-8 text-xs text-[#6b7280]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Navigation links */}
        <div className="flex flex-wrap justify-center space-x-6 text-[#003f87] font-medium">
          <a href="#about" className="hover:underline">About APIx</a>
          <a href="#datasources" className="hover:underline">Data Sources (DGCA / OTAs)</a>
          <a href="#methodology" className="hover:underline">Index Methodology (Fisher & Laspeyres)</a>
          <a href="#ethics" className="hover:underline">Ethical Scraping Policy</a>
          <a href="#disclaimer" className="hover:underline">Disclaimer</a>
          <a href="#contact" className="hover:underline">MoSPI Contact</a>
        </div>

        {/* Legal & Status Line */}
        <div className="text-center space-y-1">
          <p>© 2026 Ministry of Statistics & Programme Implementation (MoSPI) • Data Informatics & Innovation Division</p>
          <div className="flex items-center justify-center space-x-3 text-[11px] text-[#6b7280]">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>API Status: All Systems Operational</span>
            </span>
            <span>•</span>
            <span>Scheduled Daily Extraction: 02:00 AM IST</span>
            <span>•</span>
            <span>Target Platform: Smart Automation (SIH 26056)</span>
          </div>
        </div>

        <div className="border-t border-[#e5e7eb] pt-3 text-center text-[11px] text-[#9ca3af]">
          Contact Technical Team: <a href="mailto:airfare-index@mospi.gov.in" className="text-[#003f87] underline">airfare-index@mospi.gov.in</a> | Built for NSO/RBI Inflation Policy Augmentation
        </div>
      </div>
    </footer>
  );
}
