import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OperatingMode } from '../types';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Clock,
  Sliders,
  MapPin,
  CheckCircle2,
  Database,
  UploadCloud,
  Server,
  Compass
} from 'lucide-react';
import { fetchBackendHealth, BackendHealthResponse } from '../services/api';
import { GuidedDemoWalkthroughModal } from './GuidedDemoWalkthroughModal';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    officerName,
    officerRole,
    logout,
    currentModule,
    setCurrentModule,
    operatingMode,
    setOperatingMode,
    selectedGeography,
    setSelectedGeography,
    directives,
    showToast,
    setIsDataFeedModalOpen,
    dataSourceInfo
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGeoDropdownOpen, setIsGeoDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<HTMLDivElement>(null);

  const [backendHealth, setBackendHealth] = useState<BackendHealthResponse | null>(null);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    fetchBackendHealth().then(setBackendHealth).catch(() => null);
    const interval = setInterval(() => {
      fetchBackendHealth().then(setBackendHealth).catch(() => null);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (geoRef.current && !geoRef.current.contains(e.target as Node)) {
        setIsGeoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = officerName
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'YL';

  const getModuleLabel = () => {
    switch (currentModule) {
      case 'overview':
        return 'Overview Dashboard';
      case 'drought-risk-monitor':
        return 'District Explorer';
      case 'risk-forecast':
        return 'Risk & Forecast Analysis';
      case 'relief-budget-optimizer':
        return 'Resource Allocation Optimizer';
      case 'scenario-lab':
        return 'AI Scenario Lab';
      case 'claim-evidence-review':
        return 'Crop Distress Claims';
      case 'resource-routing-logistics':
        return 'Tanker Logistics';
      case 'reports-and-analytics':
        return 'Reports & Audit Dossier';
      default:
        return 'Overview';
    }
  };

  const handleModeChange = (mode: OperatingMode) => {
    setOperatingMode(mode);
    const modeName = mode === 'live' ? 'Live Telemetry' : mode === 'historical' ? 'Historical Baseline' : 'Demo Simulation';
    showToast(`Operating Mode: ${modeName}`, `Switched application state to ${modeName}.`, 'secondary');
  };

  const regions = [
    { id: 'all', label: 'All Madhya Pradesh (55 Districts)' },
    { id: 'bundelkhand', label: 'Bundelkhand Division (Tikamgarh, Chhatarpur, Panna, Niwari)' },
    { id: 'chambal', label: 'Chambal & Gwalior (Sheopur, Shivpuri, Morena)' },
    { id: 'nimar', label: 'Nimar Valley (Barwani, Khargone, Khandwa)' },
    { id: 'malwa', label: 'Malwa Plateau (Dewas, Dhar, Mandsaur)' }
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-14 bg-white z-40 border-b border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="w-full h-full px-3 lg:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Module Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-md text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F3F5] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
            <span className="text-[#111827] font-semibold truncate max-w-[200px] sm:max-w-md text-sm sm:text-base tracking-tight">
              {getModuleLabel()}
            </span>
          </nav>
        </div>

        {/* Center: Geography / District Filter & Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Geography Selector */}
          <div className="relative" ref={geoRef}>
            <button
              type="button"
              onClick={() => setIsGeoDropdownOpen(!isGeoDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#F9FAF8] hover:bg-[#EEF4FA] border border-[#E3E6EB] rounded-md text-[#111827] transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0F4C81]" />
              <span className="hidden md:inline truncate max-w-[150px]">
                {regions.find(r => r.id === selectedGeography)?.label.split('(')[0] || 'Geography'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {isGeoDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-[#E3E6EB] py-1 z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#9CA3AF] border-b border-[#E3E6EB]">
                  Filter Analysis Geography
                </div>
                {regions.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedGeography(r.id);
                      setIsGeoDropdownOpen(false);
                      showToast('Geography Updated', `Focused view on ${r.label}`, 'secondary');
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#EEF4FA] ${
                      selectedGeography === r.id ? 'font-bold text-[#0F4C81] bg-[#EEF4FA]' : 'text-[#4B5563]'
                    }`}
                  >
                    <span>{r.label}</span>
                    {selectedGeography === r.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F4C81]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Operating Mode Switcher */}
          <div className="hidden sm:flex bg-[#EEF2F6] p-0.5 rounded-md border border-[#E3E6EB] text-xs">
            <button
              type="button"
              onClick={() => handleModeChange('live')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] flex items-center gap-1.5 transition-colors ${
                operatingMode === 'live'
                  ? 'bg-white text-[#0F4C81] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${operatingMode === 'live' ? 'bg-[#10B981] animate-pulse' : 'bg-[#9CA3AF]'}`} />
              <span>Live Data</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('historical')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] flex items-center gap-1.5 transition-colors ${
                operatingMode === 'historical'
                  ? 'bg-white text-[#0F4C81] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Clock className="w-3 h-3 text-[#6B7280]" />
              <span>Historical</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('simulation')}
              className={`px-2.5 py-1 rounded font-semibold text-[11px] flex items-center gap-1.5 transition-colors ${
                operatingMode === 'simulation'
                  ? 'bg-white text-[#0F4C81] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Sliders className="w-3 h-3 text-[#6B7280]" />
              <span>Simulation</span>
            </button>
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-md text-[#4B5563] hover:text-[#111827] hover:bg-[#F6F7F9] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.5]" />
              {directives.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C62828]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#E3E6EB] py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-[#E3E6EB] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827]">
                    Active Scarcity Directives ({directives.length})
                  </span>
                  <span className="text-[10px] text-[#0F4C81] bg-[#EEF4FA] px-1.5 py-0.5 rounded font-mono">
                    Priority Alerts
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#E3E6EB]">
                  {directives.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#9CA3AF]">
                      No active scarcity alerts.
                    </div>
                  ) : (
                    directives.map(dir => (
                      <div key={dir.id} className="p-3 text-xs hover:bg-[#F9FAFB]">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              dir.severity === 'critical'
                                ? 'bg-[#FEE2E2] text-[#991B1B]'
                                : 'bg-[#FEF3C7] text-[#92400E]'
                            }`}
                          >
                            {dir.metricLabel}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {dir.timestamp}
                          </span>
                        </div>
                        <h4 className="font-semibold text-[#111827] text-xs">
                          {dir.title}
                        </h4>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          {dir.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-[#F6F7F9] transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-[#0F4C81] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {initials}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#111827] truncate max-w-[120px] leading-tight">
                  {officerName}
                </span>
                <span className="text-[10px] text-[#6B7280] truncate max-w-[120px] leading-tight">
                  {officerRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E3E6EB] py-1 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E3E6EB]">
                  <p className="font-semibold text-[#111827]">{officerName}</p>
                  <p className="text-[11px] text-[#6B7280]">{officerRole}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-[#0F4C81]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>Mode: {operatingMode.toUpperCase()}</span>
                  </div>
                </div>

                {/* 2-Minute Guided Tour (Judge Drill) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsWalkthroughOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#EEF4FA] text-[#0F4C81] font-semibold flex items-center justify-between transition-colors border-b border-[#F1F3F5]"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-[#0F4C81]" />
                    <span>2-Min Guided Tour</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#0F4C81] text-white rounded">
                    Pitch Drill
                  </span>
                </button>

                {/* FastAPI & Database Engine Status */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setCurrentModule('scenario-lab');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB] text-[#111827] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>FastAPI & PostgreSQL Hub</span>
                  </span>
                  <span className={`w-2 h-2 rounded-full ${backendHealth?.status === 'healthy' ? 'bg-[#16A34A] animate-pulse' : 'bg-[#D97706]'}`} />
                </button>

                {/* Feed Real Data Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsDataFeedModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB] text-[#111827] flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#0F4C81]" />
                    <span>Feed Real Data (Open-Meteo)</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setCurrentModule('reports-and-analytics');
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-[#F9FAFB] text-[#4B5563] flex items-center gap-2 transition-colors border-t border-[#F1F3F5]"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#6B7280]" />
                  <span>Export Audit Dossier</span>
                </button>

                <div className="border-t border-[#E3E6EB] mt-1">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-[#C62828] hover:bg-[#FEF2F2] flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guided 4-Step Hackathon Walkthrough Modal */}
      <GuidedDemoWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </header>
  );
};
