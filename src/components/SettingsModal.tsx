import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, X, Database, Shield, Radio, CheckCircle2 } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isHealthModalOpen,
    setIsHealthModalOpen,
    officerName,
    officerRole,
    logout,
    showToast
  } = useApp();

  const [awsFreq, setAwsFreq] = useState('300s');
  const [cartosatSync, setCartosatSync] = useState(true);
  const [fastagExemption, setFastagExemption] = useState(true);

  if (!isHealthModalOpen) return null;

  const handleSaveSettings = () => {
    setIsHealthModalOpen(false);
    showToast('Settings Saved', 'Telemetry polling and FASTag disaster exemptions updated.', 'primary');
  };

  return (
    <div className="fixed inset-0 bg-[#111827]/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E3E6EB] rounded-lg p-6 max-w-lg w-full shadow-xl flex flex-col gap-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0F4C81] stroke-[1.5]" />
            <h3 className="text-sm font-bold text-[#111827]">
              System Diagnostics & Feed Parameters
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsHealthModalOpen(false)}
            className="text-[#9CA3AF] hover:text-[#111827]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* User Session Info */}
          <div className="p-3 rounded-md bg-[#F9FAFB] border border-[#E3E6EB] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#6B7280]">Logged in Officer</span>
              <p className="font-semibold text-xs text-[#111827]">{officerName}</p>
              <p className="text-[11px] text-[#0F4C81]">{officerRole}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsHealthModalOpen(false);
                logout();
              }}
              className="px-2.5 py-1 rounded bg-[#FDECEA] text-[#C62828] text-xs font-semibold hover:bg-[#F5C6CB] transition-colors"
            >
              Sign out
            </button>
          </div>

          {/* Diagnostic Feeds */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block">
              Live Feed Uptime
            </span>

            <div className="flex justify-between items-center p-2 rounded border border-[#E3E6EB] bg-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                <span className="font-medium text-[#111827]">INSAT-3DR Geostationary Uplink</span>
              </div>
              <span className="font-mono text-[11px] text-[#2E7D32]">99.8% · 42ms</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded border border-[#E3E6EB] bg-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
                <span className="font-medium text-[#111827]">Automated Weather Stations (AWS)</span>
              </div>
              <span className="font-mono text-[11px] text-[#2E7D32]">1,480/1,500 active</span>
            </div>
          </div>

          {/* Configuration Settings */}
          <div className="space-y-2 pt-2 border-t border-[#E3E6EB]">
            <div className="flex items-center justify-between">
              <label className="text-[#4B5563]">AWS Polling Interval</label>
              <select
                value={awsFreq}
                onChange={e => setAwsFreq(e.target.value)}
                className="bg-[#F6F7F9] text-xs text-[#111827] px-2 py-1 rounded border border-[#E3E6EB]"
              >
                <option value="60s">Every 1 minute</option>
                <option value="300s">Every 5 minutes (Standard)</option>
                <option value="900s">Every 15 minutes</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[#4B5563]">Sentinel-2 Multispectral Sync</label>
              <input
                type="checkbox"
                checked={cartosatSync}
                onChange={e => setCartosatSync(e.target.checked)}
                className="accent-[#0F4C81] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[#4B5563]">Disaster FASTag Exemption API</label>
              <input
                type="checkbox"
                checked={fastagExemption}
                onChange={e => setFastagExemption(e.target.checked)}
                className="accent-[#0F4C81] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E6EB]">
          <button
            type="button"
            onClick={() => setIsHealthModalOpen(false)}
            className="px-3 py-1.5 rounded-md border border-[#E3E6EB] text-xs text-[#4B5563] hover:text-[#111827]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-4 py-1.5 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963]"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
