import React from 'react';
import { useApp } from '../context/AppContext';
import { OperationalModule } from '../types';
import {
  LayoutDashboard,
  Waves,
  MapPin,
  TrendingDown,
  Calculator,
  GitCompare,
  ClipboardCheck,
  Truck,
  FileBarChart,
  X,
  Compass,
  Database
} from 'lucide-react';

interface SidebarProps {
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenOnMobile,
  onCloseMobile,
  isCollapsed = false
}) => {
  const { currentModule, setCurrentModule, setIsHealthModalOpen, setIsDataFeedModalOpen, lastVedasSync, dataSourceInfo } = useApp();

  const primaryNavItems: {
    path: OperationalModule;
    label: string;
    sublabel: string;
    icon: React.ElementType;
  }[] = [
    {
      path: 'overview',
      label: 'Overview Dashboard',
      sublabel: 'State Anomaly & Reservoirs',
      icon: LayoutDashboard
    },
    {
      path: 'enso-teleconnection',
      label: 'El Niño & ENSO Radar',
      sublabel: 'Pacific SST & Monsoon Link',
      icon: Waves
    },
    {
      path: 'drought-risk-monitor',
      label: 'District Explorer',
      sublabel: 'Leaflet GIS & Telemetry',
      icon: MapPin
    },
    {
      path: 'risk-forecast',
      label: 'Risk & Forecast Analysis',
      sublabel: 'Analogs, Trends & Scenarios',
      icon: TrendingDown
    },
    {
      path: 'relief-budget-optimizer',
      label: 'Resource Optimizer',
      sublabel: 'Deterministic Solver',
      icon: Calculator
    },
    {
      path: 'scenario-lab',
      label: 'AI Scenario Lab',
      sublabel: 'Side-by-Side Trade-Offs',
      icon: GitCompare
    },
    {
      path: 'claim-evidence-review',
      label: 'Crop Distress Claims',
      sublabel: 'Spectral Loss Verification',
      icon: ClipboardCheck
    },
    {
      path: 'resource-routing-logistics',
      label: 'Tanker Fleet Logistics',
      sublabel: 'GPS Dispatch & Dashcam',
      icon: Truck
    }
  ];

  const supportingItems: {
    path: OperationalModule;
    label: string;
    sublabel?: string;
    icon: React.ElementType;
  }[] = [
    {
      path: 'reports-and-analytics',
      label: 'Evidence & Audit Export',
      sublabel: 'Dossiers & CSV Records',
      icon: FileBarChart
    }
  ];

  const handleNavClick = (path: OperationalModule) => {
    setCurrentModule(path);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 bg-[#111827]/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-[#111827] text-[#F3F4F6] z-50 flex flex-col justify-between border-r border-[#1F2937] shadow-lg transition-all duration-200 ease-in-out ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Project Identity & Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#1F2937] bg-[#0F172A]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded bg-[#0F4C81] border border-[#1A5B94] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                    El Niño
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] truncate leading-tight">
                    Drought Intelligence & Optimizer
                  </span>
                </div>
              )}
            </div>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1 text-[#9CA3AF] hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            )}
          </div>

          {/* Navigation Section Header */}
          {!isCollapsed && (
            <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                Platform Modules
              </span>
            </div>
          )}

          {/* Primary Navigation */}
          <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentModule === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all text-left relative ${
                    isActive
                      ? 'bg-[#0F4C81] text-white font-semibold shadow-xs'
                      : 'text-[#D1D5DB] hover:text-white hover:bg-[#1F2937]'
                  }`}
                >
                  {/* Active highlight indicator */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#60A5FA] rounded-r"
                      aria-hidden="true"
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 stroke-[1.5] ${
                      isActive ? 'text-white' : 'text-[#9CA3AF]'
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="truncate block font-medium">{item.label}</span>
                      <span className="text-[10px] text-[#9CA3AF] block truncate">
                        {item.sublabel}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Supporting Section */}
            {!isCollapsed && (
              <div className="px-2 pt-3 pb-1 border-t border-[#1F2937] mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Documentation & Records
                </span>
              </div>
            )}

            {supportingItems.map(item => {
              const Icon = item.icon;
              const isActive = currentModule === item.path;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item.path)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-all text-left relative ${
                    isActive
                      ? 'bg-[#0F4C81] text-white font-semibold'
                      : 'text-[#D1D5DB] hover:text-white hover:bg-[#1F2937]'
                  }`}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#60A5FA] rounded-r"
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#9CA3AF]'
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <span className="truncate block font-medium">{item.label}</span>
                      {item.sublabel && (
                        <span className="text-[10px] text-[#9CA3AF] block truncate">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Real Data Feed Studio Button */}
        <div className="p-3 border-t border-[#1F2937] bg-[#0F172A] space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsDataFeedModalOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 p-2 rounded-md bg-[#0F4C81] hover:bg-[#1A5B94] transition-colors text-left text-white shadow-xs"
            title="Open Data Ingestion Studio"
          >
            <Database className="w-4 h-4 text-[#93C5FD] shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white truncate">
                    Feed Real Data
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                </div>
                <span className="text-[10px] text-[#93C5FD] truncate font-normal">
                  {dataSourceInfo.label.split(' ')[0]} Feed Active
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsHealthModalOpen(true)}
            className="w-full flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#1F2937] transition-colors text-left text-[#D1D5DB]"
          >
            <Database className="w-4 h-4 text-[#60A5FA] shrink-0" />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[11px] font-semibold text-white truncate">
                    ISRO VEDAS Telemetry
                  </span>
                </div>
                <span className="text-[10px] text-[#9CA3AF] truncate">
                  {lastVedasSync}
                </span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
