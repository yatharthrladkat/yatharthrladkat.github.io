import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, PhoneOff, Mic, MicOff, BellRing, X, Radio } from 'lucide-react';

export const DriverCallModal: React.FC = () => {
  const { selectedConvoyForCall, setSelectedConvoyForCall, showToast } = useApp();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!selectedConvoyForCall) {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedConvoyForCall]);

  if (!selectedConvoyForCall) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setSelectedConvoyForCall(null);
    showToast('Call Ended', `Call with ${selectedConvoyForCall.driverName} logged to dispatch record.`, 'secondary');
  };

  return (
    <div className="fixed inset-0 bg-[#111827]/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E3E6EB] rounded-lg p-6 max-w-sm w-full shadow-xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-full bg-[#EEF4FA] border border-[#BCD4EC] flex items-center justify-center text-[#0F4C81]">
          <Phone className="w-7 h-7 stroke-[1.5]" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#111827]">
            {selectedConvoyForCall.driverName}
          </h3>
          <p className="text-xs text-[#0F4C81] font-mono font-medium">
            {selectedConvoyForCall.driverPhone}
          </p>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Convoy {selectedConvoyForCall.id} · {selectedConvoyForCall.vehicleNo}
          </p>
        </div>

        <div className="font-mono text-base font-bold text-[#111827] tabular-nums">
          {formatTime(callDuration)}
        </div>

        <p className="text-[11px] text-[#6B7280]">
          State Emergency Telematics Channel (NavIC / GSM Secure Link)
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
              isMuted
                ? 'bg-[#FFF8E1] border-[#FFE082] text-[#B26A00]'
                : 'bg-[#F1F3F5] border-[#E3E6EB] text-[#4B5563] hover:text-[#111827]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="w-12 h-12 rounded-full bg-[#C62828] hover:bg-[#B71C1C] text-white flex items-center justify-center shadow-md transition-transform"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => showToast('Ping Sent', 'Dispatch alert chime transmitted to in-cab console.', 'secondary')}
            className="w-10 h-10 rounded-full bg-[#F1F3F5] border border-[#E3E6EB] text-[#4B5563] hover:text-[#111827] flex items-center justify-center transition-colors"
            title="Send Chime Ping"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
