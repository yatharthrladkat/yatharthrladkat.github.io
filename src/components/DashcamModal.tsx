import React from 'react';
import { useApp } from '../context/AppContext';
import { Video, X, Navigation } from 'lucide-react';

export const DashcamModal: React.FC = () => {
  const { selectedConvoyForDashcam, setSelectedConvoyForDashcam } = useApp();

  if (!selectedConvoyForDashcam) return null;

  return (
    <div className="fixed inset-0 bg-[#111827]/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E3E6EB] rounded-lg overflow-hidden max-w-2xl w-full shadow-xl flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="p-3.5 bg-white flex items-center justify-between border-b border-[#E3E6EB]">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#0F4C81] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#111827]">
              Vehicle Camera Feed: {selectedConvoyForDashcam.id} ({selectedConvoyForDashcam.vehicleNo})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedConvoyForDashcam(null)}
            className="text-[#9CA3AF] hover:text-[#111827]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative w-full h-72 bg-[#111827] overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-110 opacity-70"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBf5YBUfZWfrN2hGI-PnvkKBUqwNm_1wAgujSdRTl0cf7v81XTnz3ydsHYIPBpCvsAi55fAHs3cyavXS5R3N1mGiftry2SWNtGnk_hFbW2Dhm9hETarcqORDCp5QlUln9Nhm2TL8V14RZi-b25xhn-IhOhijMajbNJY_dMP7Nk34FLuQO2M9ku5e-fb9bNQdjAoSSkjGz5MMAAD1mK7Rf2z6NeBGuVN4v_fnvPHNAgjRTkoY-YjfaAI')`
            }}
          />

          {/* Clean HUD Overlay */}
          <div className="absolute top-3 left-3 z-10 font-mono text-[11px] text-white bg-black/60 px-2 py-1 rounded">
            <div>CAM-01 · Forward High-Definition Telemetry</div>
            <div>Bundelkhand-NH44 Highway Corridor · 24.7450° N, 78.8350° E</div>
          </div>

          <div className="absolute top-3 right-3 z-10 font-mono text-[11px] text-[#EF5350] bg-black/60 px-2 py-1 rounded flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF5350]" />
            LIVE 1080p
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-white bg-black/70 p-2.5 rounded font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block">VELOCITY</span>
              <span className="font-bold text-sm text-white">
                {selectedConvoyForDashcam.speedKmH} km/h
              </span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-gray-400 block">CORRIDOR</span>
              <span className="text-[#4edea3] font-bold">DISASTER CLEARANCE PASS</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">DESTINATION ETA</span>
              <span className="font-bold text-sm text-white">
                {selectedConvoyForDashcam.eta}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F9FAFB] border-t border-[#E3E6EB] flex items-center justify-between text-xs">
          <span className="text-[#6B7280]">
            Driver: {selectedConvoyForDashcam.driverName} ({selectedConvoyForDashcam.driverPhone})
          </span>
          <button
            type="button"
            onClick={() => setSelectedConvoyForDashcam(null)}
            className="px-3 py-1 rounded bg-white border border-[#E3E6EB] text-xs font-medium text-[#4B5563] hover:text-[#111827]"
          >
            Close Feed
          </button>
        </div>
      </div>
    </div>
  );
};
