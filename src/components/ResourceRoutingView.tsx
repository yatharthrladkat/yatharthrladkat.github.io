import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConvoyRoute } from '../types';
import {
  Truck,
  MapPin,
  Phone,
  Video,
  Plus,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Compass
} from 'lucide-react';
import { searchReliefLocations, GroundedPlace } from '../services/api';

export const ResourceRoutingView: React.FC = () => {
  const {
    convoys,
    addConvoy,
    updateConvoyStatus,
    depots,
    showToast,
    setSelectedConvoyForCall,
    setSelectedConvoyForDashcam
  } = useApp();

  const [selectedConvoyId, setSelectedConvoyId] = useState<string>(convoys[0]?.id || 'CV-MP-4019');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_route' | 'delayed'>('all');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick Dispatch Form State
  const [originHub, setOriginHub] = useState('Sagar Bundelkhand Regional Grain & Water Reserve');
  const [destTaluka, setDestTaluka] = useState('Baldeogarh (Tikamgarh)');
  const [cargoType, setCargoType] = useState<ConvoyRoute['cargoType']>('Potable Water');
  const [cargoCapacity, setCargoCapacity] = useState('20,000 Litres (Twin Tanker)');

  // Gemini Google Maps Grounding Search State
  const [mapsQuery, setMapsQuery] = useState('APMC grain depots and water hubs in Bundelkhand');
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [groundedPlaces, setGroundedPlaces] = useState<GroundedPlace[]>([
    { title: 'Gandhi Sagar Dam Headworks (Mandsaur)', uri: 'https://maps.google.com/?q=Gandhi+Sagar+Dam+Madhya+Pradesh' },
    { title: 'Sagar Bundelkhand Regional Grain Depot (APMC)', uri: 'https://maps.google.com/?q=APMC+Grain+Depot+Sagar' },
    { title: 'Baldeogarh Community Water Supply Point (Tikamgarh)', uri: 'https://maps.google.com/?q=Baldeogarh+Tikamgarh' },
    { title: 'Indira Sagar Dam Central Headworks (Khandwa)', uri: 'https://maps.google.com/?q=Indira+Sagar+Dam+Khandwa' }
  ]);
  const [mapsAnalysisText, setMapsAnalysisText] = useState('Verified Madhya Pradesh emergency staging points and hydrological headworks.');

  const selectedConvoy = convoys.find(c => c.id === selectedConvoyId) || convoys[0];

  const enRouteCount = convoys.filter(c => c.status.includes('En Route')).length;
  const delayedCount = convoys.filter(c => c.status.includes('Delayed')).length;

  const filteredConvoys = convoys.filter(c => {
    if (statusFilter === 'en_route' && !c.status.includes('En Route')) return false;
    if (statusFilter === 'delayed' && !c.status.includes('Delayed')) return false;
    return true;
  });

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destTaluka.trim()) {
      showToast('Validation Error', 'Destination taluka or staging point cannot be blank.', 'warning');
      return;
    }
    if (!cargoCapacity.trim()) {
      showToast('Validation Error', 'Cargo payload capacity must be specified.', 'warning');
      return;
    }

    // Verify origin depot stock availability
    const originDepotRecord = depots.find(d =>
      d.name.toLowerCase().includes(originHub.toLowerCase().split(' ')[0]) ||
      originHub.toLowerCase().includes(d.name.toLowerCase().split(' ')[0])
    );
    if (originDepotRecord && originDepotRecord.capacityPct <= 0) {
      showToast(
        'Depot Stock Depleted',
        `Selected origin depot (${originHub}) has zero available reserves. Re-route from an alternate logistics hub.`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await addConvoy({
        originDepot: originHub,
        targetTaluka: destTaluka,
        cargoType,
        cargoCapacity,
        speedKmH: 52
      });
      // Selection switches to newly dispatched convoy
      if (convoys[0]) {
        setSelectedConvoyId(convoys[0].id);
      }
    } catch (err: any) {
      // Error toast is already triggered in AppContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchMapsGrounding = async (queryToUse?: string) => {
    const q = queryToUse || mapsQuery;
    if (!q.trim()) return;
    setIsSearchingMaps(true);
    try {
      const res = await searchReliefLocations(q);
      setGroundedPlaces(res.places || []);
      setMapsAnalysisText(res.text || 'Grounded infrastructure search completed.');
      showToast('Infrastructure Grounded', `Found ${res.places?.length || 0} verified locations via Google Maps.`, 'primary');
    } catch {
      showToast('Maps Grounding Warning', 'Using cached Madhya Pradesh relief depots.', 'secondary');
    } finally {
      setIsSearchingMaps(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">
            Tanker Logistics & Fleet Operations
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time GPS tracking of potable water tankers, cattle fodder convoys, and emergency nutritional kits across Madhya Pradesh
          </p>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-[#E3E6EB] shadow-xs text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#0F4C81] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            All Convoys ({convoys.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('en_route')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'en_route'
                ? 'bg-[#0F4C81] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            En Route ({enRouteCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('delayed')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              statusFilter === 'delayed'
                ? 'bg-[#0F4C81] text-white font-semibold'
                : 'text-[#4B5563] hover:text-[#111827]'
            }`}
          >
            Delayed ({delayedCount})
          </button>
        </div>
      </div>

      {/* Main Grid: Fleet Status & Dispatch Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active Convoy Roster */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EB]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Active GPS Fleet Registry
              </span>
              <span className="text-xs font-medium text-[#0F4C81]">
                {filteredConvoys.length} units tracked
              </span>
            </div>

            <div className="divide-y divide-[#E3E6EB] mt-1 max-h-[480px] overflow-y-auto">
              {filteredConvoys.map(convoy => {
                const isSelected = convoy.id === selectedConvoyId;
                const isDelayed = convoy.status.includes('Delayed');

                return (
                  <div
                    key={convoy.id}
                    onClick={() => setSelectedConvoyId(convoy.id)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#EEF4FA] border-l-2 border-[#0F4C81]'
                        : 'hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#111827]">
                          {convoy.vehicleNo}
                        </span>
                        <span className="text-[10px] text-[#6B7280] font-mono">
                          {convoy.id}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          isDelayed
                            ? 'bg-[#FFF8E1] text-[#B26A00]'
                            : 'bg-[#E8F5E9] text-[#2E7D32]'
                        }`}
                      >
                        {convoy.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-[#4B5563] truncate max-w-[180px]">
                        {convoy.originDepot.split(' ')[0]} → {convoy.targetTaluka}
                      </span>
                      <span className="text-[#111827] font-medium">
                        {convoy.eta}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-[#6B7280]">
                      <span>{convoy.cargoType} ({convoy.cargoCapacity})</span>
                      <span className="font-mono">{convoy.speedKmH} km/h</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected Gemini Maps Grounding Infrastructure Widget */}
          <div className="bg-white rounded-lg border border-[#BCD4EC] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E3E6EB]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#EEF4FA] text-[#0F4C81] flex items-center justify-center">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-[#111827]">
                  Google Maps Relief Infrastructure Grounding
                </h3>
              </div>
              <span className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded border border-[#C8E6C9]">
                Live Grounding
              </span>
            </div>

            <p className="text-[11px] text-[#64748B] mt-2 mb-2.5">
              Query real physical water heads, APMC grain silos, and bore well hubs in Madhya Pradesh using Google Maps retrieval tool:
            </p>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={mapsQuery}
                onChange={e => setMapsQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchMapsGrounding()}
                placeholder="Search real depots or water heads..."
                className="flex-1 bg-[#F8FAFC] text-xs text-[#111827] px-2.5 py-1.5 rounded-md border border-[#CBD5E1] focus:bg-white focus:border-[#0F4C81]"
              />
              <button
                type="button"
                onClick={() => handleSearchMapsGrounding()}
                disabled={isSearchingMaps}
                className="px-3 py-1.5 bg-[#0F4C81] text-white text-xs font-semibold rounded-md hover:bg-[#0A3963] transition-colors disabled:opacity-60 flex items-center gap-1"
              >
                {isSearchingMaps ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </button>
            </div>

            {/* Quick search tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                'APMC grain depots in Sagar',
                'Emergency water hubs near Baldeogarh',
                'Gandhi Sagar Dam headworks',
                'Barwani Sendhwa bore well points'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setMapsQuery(tag);
                    handleSearchMapsGrounding(tag);
                  }}
                  className="text-[10px] bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] px-2 py-0.5 rounded transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Grounded Places List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-[#E2E8F0] rounded-md p-2 bg-[#F8FAFC]">
              {groundedPlaces.map((place, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 bg-white rounded border border-[#E2E8F0] text-xs hover:border-[#0F4C81] transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-[#111827] block truncate text-[11px]">
                      {place.title}
                    </span>
                    <a
                      href={place.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-[#0F4C81] hover:underline"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setOriginHub(place.title);
                        showToast('Origin Hub Updated', `Set origin to ${place.title}`, 'primary');
                      }}
                      className="px-1.5 py-0.5 bg-[#EEF4FA] text-[#0F4C81] hover:bg-[#DCE8F5] rounded text-[10px] font-semibold"
                      title="Set as Origin Hub"
                    >
                      Origin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestTaluka(place.title);
                        showToast('Target Point Updated', `Set destination to ${place.title}`, 'primary');
                      }}
                      className="px-1.5 py-0.5 bg-[#F0FDF4] text-[#166534] hover:bg-[#DCFCE7] rounded text-[10px] font-semibold"
                      title="Set as Destination Target"
                    >
                      Target
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Active Convoy Inspection & Direct Dispatch Desk */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Selected Convoy Telemetry Dossier */}
          {selectedConvoy && (
            <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#111827]">
                      {selectedConvoy.vehicleNo}
                    </h3>
                    <span className="text-[10px] font-mono text-[#0F4C81] bg-[#EEF4FA] px-1.5 py-0.5 rounded font-bold">
                      {selectedConvoy.orderNumber || selectedConvoy.id}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        selectedConvoy.status === 'Cancelled'
                          ? 'bg-[#FDECEA] text-[#C62828]'
                          : selectedConvoy.status === 'Delivered'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : selectedConvoy.status.includes('Delayed')
                          ? 'bg-[#FFF8E1] text-[#B26A00]'
                          : 'bg-[#EEF4FA] text-[#0F4C81]'
                      }`}
                    >
                      {selectedConvoy.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Driver: {selectedConvoy.driverName} ({selectedConvoy.driverPhone}) · Dispatched: {selectedConvoy.dispatchTimestamp || 'Active Run'}
                  </p>
                </div>

                {/* Communication & Order Actions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedConvoyForCall(selectedConvoy)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F1F3F5] text-xs font-medium text-[#111827] hover:bg-[#E3E6EB] transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#0F4C81] stroke-[1.5]" />
                    <span>Call Driver</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedConvoyForDashcam(selectedConvoy)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F1F3F5] text-xs font-medium text-[#111827] hover:bg-[#E3E6EB] transition-colors"
                  >
                    <Video className="w-3 h-3 text-[#0F4C81] stroke-[1.5]" />
                    <span>Dashcam</span>
                  </button>

                  {selectedConvoy.status !== 'Delivered' && selectedConvoy.status !== 'Cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateConvoyStatus(selectedConvoy.id, 'Delivered')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#E8F5E9] text-xs font-medium text-[#2E7D32] hover:bg-[#C8E6C9] transition-colors"
                        title="Confirm tank intake delivery"
                      >
                        <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                        <span>Confirm Delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateConvoyStatus(selectedConvoy.id, 'Cancelled')}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FDECEA] text-xs font-medium text-[#C62828] hover:bg-[#FFCDD2] transition-colors"
                        title="Cancel deployment and restore depot inventory"
                      >
                        <ShieldAlert className="w-3 h-3 stroke-[2]" />
                        <span>Cancel Order</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Waypoints & Route Sequence */}
              <div className="mt-3">
                <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-2">
                  Checkpoint Route Sequence
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {selectedConvoy.waypoints.map((wp, idx) => (
                    <div
                      key={wp.name}
                      className={`p-2.5 rounded border ${
                        wp.passed
                          ? 'bg-[#E8F5E9]/50 border-[#C8E6C9]'
                          : idx === 1
                          ? 'bg-[#EEF4FA] border-[#BCD4EC]'
                          : 'bg-[#F9FAFB] border-[#E3E6EB]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#6B7280] font-mono">
                          CP-0{idx + 1}
                        </span>
                        {wp.passed && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                        )}
                      </div>
                      <span className="font-semibold text-[#111827] block truncate">
                        {wp.name}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">ETA {wp.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Dispatch Desk Form */}
          <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <h3 className="text-sm font-bold text-[#111827] mb-3 pb-2 border-b border-[#E3E6EB]">
              Preemptive Tanker & Relief Cargo Dispatch Desk
            </h3>

            <form onSubmit={handleDispatch} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Origin Supply Depot
                </label>
                <select
                  value={originHub}
                  onChange={e => setOriginHub(e.target.value)}
                  className="w-full bg-[#F6F7F9] text-xs text-[#111827] p-2 rounded-md border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81]"
                >
                  <option value="Sagar Bundelkhand Regional Grain & Water Reserve">Sagar Bundelkhand Regional Grain & Water Reserve</option>
                  <option value="Bhopal State Civil Supplies Terminal">Bhopal State Civil Supplies Terminal</option>
                  <option value="Indore Malwa Agrarian Logistics Hub">Indore Malwa Agrarian Logistics Hub</option>
                  <option value="Gwalior Chambal Emergency Staging Point">Gwalior Chambal Emergency Staging Point</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Destination Taluka / Tank Point
                </label>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={destTaluka}
                    onChange={e => setDestTaluka(e.target.value)}
                    placeholder="e.g. Baldeogarh (Tikamgarh)"
                    className="w-full bg-[#F6F7F9] text-xs text-[#111827] p-2 rounded-md border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81]"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Baldeogarh (Tikamgarh)',
                      'Nowgong (Chhatarpur)',
                      'Sendhwa (Barwani)',
                      'Karahal (Sheopur)'
                    ].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDestTaluka(t)}
                        className="text-[10px] text-[#0F4C81] hover:underline bg-[#EEF4FA] px-1.5 py-0.5 rounded"
                      >
                        {t.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Resource Cargo Category
                </label>
                <select
                  value={cargoType}
                  onChange={e => setCargoType(e.target.value as any)}
                  className="w-full bg-[#F6F7F9] text-xs text-[#111827] p-2 rounded-md border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81]"
                >
                  <option value="Potable Water">Potable Water (Tankers)</option>
                  <option value="Cattle Fodder Kits">Cattle Fodder Kits (Dry Fodder)</option>
                  <option value="Nutri-Pouches">Emergency Nutritional Kits</option>
                  <option value="Drought Seed Pouches">Drought-Resilient Seed Kits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4B5563] mb-1">
                  Payload Capacity
                </label>
                <input
                  type="text"
                  value={cargoCapacity}
                  onChange={e => setCargoCapacity(e.target.value)}
                  placeholder="e.g. 18,000 Litres"
                  className="w-full bg-[#F6F7F9] text-xs text-[#111827] p-2 rounded-md border border-[#E3E6EB] focus:bg-white focus:border-[#0F4C81]"
                />
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-between items-center border-t border-[#E3E6EB]">
                <span className="text-[11px] text-[#6B7280]">
                  FASTag Disaster Exemption automatically attached to e-waybill
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0F4C81] text-white text-xs font-semibold hover:bg-[#0A3963] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Reserving Stock & Authorizing...' : 'Issue Deployment Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
