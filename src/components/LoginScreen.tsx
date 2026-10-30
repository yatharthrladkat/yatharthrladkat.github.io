import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, Satellite } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email || 'officer.yatharth@relief-intel.in', 'Yatharth Ladkat');
      setIsLoading(false);
    }, 300);
  };

  const handleDemoBypass = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('officer.yatharth@relief-intel.in', 'Yatharth Ladkat');
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen w-full bg-[#F6F7F9] flex flex-col justify-between font-sans text-[#111827]">
      {/* Top Banner */}
      <header className="w-full bg-white border-b border-[#E3E6EB] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#0F4C81] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Compass className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#111827] uppercase tracking-wide">
              El Niño — Drought Intelligence Platform
            </h1>
            <p className="text-[11px] text-[#6B7280]">
              Geospatial Climate Risk Assessment & Scarcity Optimizer
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6B7280]">
          <Satellite className="w-4 h-4 text-[#0F4C81] stroke-[1.5]" />
          <span>ISRO SAC VEDAS & IMD Pune Open Feeds</span>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#E3E6EB] rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-6 sm:p-8">
          {/* Header */}
          <div className="pb-5 border-b border-[#E3E6EB] mb-5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F4C81]">
              Decision Support Access
            </span>
            <h2 className="text-lg font-bold text-[#111827] mt-1">
              El Niño Intelligence Portal
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Access for Relief Planners, Hydrologists, and Agrarian Logistics Analysts
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-[#4B5563] mb-1">
                Official / Analyst Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@relief-intel.in"
                  className="w-full bg-[#F6F7F9] text-xs text-[#111827] pl-9 pr-3 py-2 rounded-md border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-password" className="block text-xs font-medium text-[#4B5563]">
                  Security Credential
                </label>
                <span className="text-[11px] text-[#6B7280]">
                  Analyst SSO
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 stroke-[1.5]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#F6F7F9] text-xs text-[#111827] pl-9 pr-9 py-2 rounded-md border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81] focus:ring-1 focus:ring-[#0F4C81] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Connecting to Intelligence Platform...</span>
                ) : (
                  <>
                    <span>Enter Decision Support Platform</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Bypass */}
          <div className="mt-4 pt-4 border-t border-[#E3E6EB]">
            <button
              type="button"
              onClick={handleDemoBypass}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-md bg-[#EEF4FA] hover:bg-[#E0ECF8] text-[#0F4C81] text-xs font-semibold transition-colors text-center border border-[#BCD4EC]"
            >
              1-Click Demo Evaluation Mode (Officer Yatharth Ladkat)
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              <strong>Transparency Note:</strong> This platform is an analytical decision support prototype built on open scientific data from ISRO SAC VEDAS, IMD, and CWC. It provides explainable optimization models for resource allocation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#E3E6EB] px-6 py-3 text-center text-xs text-[#6B7280]">
        <p>
          © 2026 Madhya Pradesh Drought Intelligence & Relief Preemption Platform · Open Climate Risk Analytics
        </p>
      </footer>
    </div>
  );
};
