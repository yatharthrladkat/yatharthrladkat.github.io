import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { DroughtRiskView } from './components/DroughtRiskView';
import { BudgetOptimizerView } from './components/BudgetOptimizerView';
import { ClaimReviewView } from './components/ClaimReviewView';
import { ResourceRoutingView } from './components/ResourceRoutingView';
import { ReportsView } from './components/ReportsView';
import { RiskForecastView } from './components/RiskForecastView';
import { ScenarioLabView } from './components/ScenarioLabView';
import { EnsoTeleconnectionView } from './components/EnsoTeleconnectionView';
import { DriverCallModal } from './components/DriverCallModal';
import { DashcamModal } from './components/DashcamModal';
import { SettingsModal } from './components/SettingsModal';
import { DataIngestionModal } from './components/DataIngestionModal';
import { CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Module Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg border border-[#F5C6CB] p-6 shadow-xs text-center max-w-lg mx-auto my-12">
          <AlertCircle className="w-8 h-8 text-[#C62828] mx-auto mb-3 stroke-[1.5]" />
          <h3 className="text-sm font-bold text-[#111827]">Telemetry View Temporarily Unavailable</h3>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">
            A temporary view render error occurred. Please click below to refresh the module state.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Module</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { isAuthenticated, currentModule, toast, clearToast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is not authenticated, display the Government Officer Login screen first
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans text-[#111827] antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenOnMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Fixed Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Viewport Content */}
        <main className="w-full pt-16 px-4 sm:px-6 lg:px-8 py-5 flex-1 max-w-[1600px] mx-auto">
          <ErrorBoundary>
            {currentModule === 'overview' && <DashboardView />}
            {currentModule === 'enso-teleconnection' && <EnsoTeleconnectionView />}
            {currentModule === 'drought-risk-monitor' && <DroughtRiskView />}
            {currentModule === 'risk-forecast' && <RiskForecastView />}
            {currentModule === 'relief-budget-optimizer' && <BudgetOptimizerView />}
            {currentModule === 'scenario-lab' && <ScenarioLabView />}
            {currentModule === 'claim-evidence-review' && <ClaimReviewView />}
            {currentModule === 'resource-routing-logistics' && <ResourceRoutingView />}
            {currentModule === 'reports-and-analytics' && <ReportsView />}
            {currentModule === 'settings' && <ReportsView />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Interactive Toast Notification (Clean Enterprise Styling) */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`p-3 rounded-lg shadow-lg border flex items-start gap-2.5 bg-white ${
              toast.tone === 'error'
                ? 'border-[#F5C6CB] text-[#C62828]'
                : toast.tone === 'warning'
                ? 'border-[#FFE082] text-[#B26A00]'
                : 'border-[#BCD4EC] text-[#0F4C81]'
            }`}
          >
            {toast.tone === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5 stroke-[1.5]" />
            ) : toast.tone === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-[#B26A00] shrink-0 mt-0.5 stroke-[1.5]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0 mt-0.5 stroke-[1.5]" />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#111827]">{toast.title}</h4>
              <p className="text-[11px] text-[#4B5563] mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={clearToast}
              className="text-[#9CA3AF] hover:text-[#111827] p-0.5"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <DriverCallModal />
      <DashcamModal />
      <SettingsModal />
      <DataIngestionModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
