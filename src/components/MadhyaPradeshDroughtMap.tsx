import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MADHYA_PRADESH_DISTRICTS_GEO,
  TALUKA_HOTSPOTS,
  AWS_WEATHER_STATIONS,
  DROUGHT_METRICS_CONFIG,
  DroughtMapMetric,
  getDistrictColor,
  formatMetricValue,
  DistrictGeoFeature
} from '../data/madhyaPradeshGeoData';
import { useApp } from '../context/AppContext';
import {
  Layers,
  MapPin,
  Satellite,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  Radio,
  Truck,
  Droplets,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';

export interface MadhyaPradeshDroughtMapProps {
  selectedDistrictId: string;
  onSelectDistrict: (id: string) => void;
  className?: string;
}

export type MaharashtraDroughtMapProps = MadhyaPradeshDroughtMapProps;

type BasemapType = 'carto_light' | 'esri_satellite' | 'carto_voyager' | 'osm';

export const MadhyaPradeshDroughtMap: React.FC<MadhyaPradeshDroughtMapProps> = ({
  selectedDistrictId,
  onSelectDistrict,
  className = ''
}) => {
  const { convoys, isVedasSyncing, syncVedasData, lastVedasSync, vedasPortalUrl, showToast } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const talukasLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const awsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const convoysLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeMetric, setActiveMetric] = useState<DroughtMapMetric>('vedasComposite');
  const [activeBasemap, setActiveBasemap] = useState<BasemapType>('carto_light');
  const [showTalukas, setShowTalukas] = useState<boolean>(true);
  const [showAWS, setShowAWS] = useState<boolean>(true);
  const [showConvoys, setShowConvoys] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictGeoFeature | null>(null);

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Invalidate map size on fullscreen toggle so tiles recalculate immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  const activeMetricConfig = DROUGHT_METRICS_CONFIG[activeMetric];

  // Tile layer URLs
  const BASEMAPS: Record<BasemapType, { url: string; attribution: string; maxZoom: number }> = {
    carto_light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19
    },
    esri_satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
      maxZoom: 18
    },
    carto_voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors',
      maxZoom: 19
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center over Madhya Pradesh drought zone (Bhopal/Sagar/Bundelkhand)
      const map = L.map(mapContainerRef.current, {
        center: [23.40, 77.80],
        zoom: 7,
        minZoom: 6,
        maxZoom: 15,
        maxBounds: [[21.05, 74.04], [26.87, 82.80]],
        zoomControl: false
      });

      // Position Zoom control at top-left
      L.control.zoom({ position: 'topleft' }).addTo(map);

      // Create base tile layer
      const basemapConfig = BASEMAPS.carto_light;
      const tiles = L.tileLayer(basemapConfig.url, {
        attribution: basemapConfig.attribution,
        maxZoom: basemapConfig.maxZoom
      }).addTo(map);
      tileLayerRef.current = tiles;

      // Create layer groups
      const polyGroup = L.layerGroup().addTo(map);
      const talukaGroup = L.layerGroup().addTo(map);
      const awsGroup = L.layerGroup().addTo(map);
      const convoyGroup = L.layerGroup().addTo(map);

      polygonLayerGroupRef.current = polyGroup;
      talukasLayerGroupRef.current = talukaGroup;
      awsLayerGroupRef.current = awsGroup;
      convoysLayerGroupRef.current = convoyGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Basemap Switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const cfg = BASEMAPS[activeBasemap];

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newTiles = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTiles;
  }, [activeBasemap]);

  // Render District Polygons with Real-time Drought Colors & Interactivity
  useEffect(() => {
    if (!polygonLayerGroupRef.current || !mapInstanceRef.current) return;

    const group = polygonLayerGroupRef.current;
    group.clearLayers();

    MADHYA_PRADESH_DISTRICTS_GEO.forEach((district: DistrictGeoFeature) => {
      const isSelected = district.id === selectedDistrictId;
      const fillColor = getDistrictColor(district, activeMetric);
      const formattedVal = formatMetricValue(district, activeMetric);

      // Polygon boundary
      const polygon = L.polygon(district.polygon, {
        color: isSelected ? '#0F4C81' : '#FFFFFF',
        weight: isSelected ? 3.5 : 1.5,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.88 : 0.68,
        dashArray: isSelected ? '' : '2',
        smoothFactor: 1
      });

      // Tooltip HTML on hover
      const tooltipHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 170px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #111827; font-size: 13px;">${district.name}</strong>
            <span style="font-size: 10px; color: #6B7280; font-weight: 500;">${district.marathiName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; color: #4B5563;">${activeMetricConfig.shortLabel}:</span>
            <span style="font-size: 12px; font-weight: 700; color: ${fillColor};">${formattedVal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #6B7280; margin-bottom: 2px;">
            <span>VCI Anomaly:</span>
            <span style="font-weight: 600; color: #111827;">${district.vci.toFixed(1)}%</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #6B7280; margin-bottom: 2px;">
            <span>SPI-3M:</span>
            <span style="font-weight: 600; color: #111827;">${district.spi3M.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #6B7280; margin-bottom: 2px;">
            <span>Crop Risk:</span>
            <span style="font-weight: 600; color: #C62828;">${district.cropLossRiskPct}%</span>
          </div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #E5E7EB; text-align: center; font-size: 10px; color: #0F4C81; font-weight: 600;">
            ${isSelected ? '● Currently Active Profile' : 'Click to select & inspect telemetry'}
          </div>
        </div>
      `;

      polygon.bindTooltip(tooltipHtml, {
        sticky: true,
        className: 'custom-map-tooltip',
        direction: 'top',
        offset: [0, -10]
      });

      // Hover and Click events
      polygon.on('mouseover', () => {
        setHoveredDistrict(district);
        polygon.setStyle({
          fillOpacity: 0.95,
          weight: 3.5,
          color: isSelected ? '#0F4C81' : '#1E293B'
        });
      });

      polygon.on('mouseout', () => {
        setHoveredDistrict(null);
        polygon.setStyle({
          fillOpacity: isSelected ? 0.88 : 0.68,
          weight: isSelected ? 3.5 : 1.5,
          color: isSelected ? '#0F4C81' : '#FFFFFF'
        });
      });

      polygon.on('click', () => {
        onSelectDistrict(district.id);
        showToast(
          `${district.name} District Selected`,
          `Synchronized crop failure telemetry & VEDAS satellite records (${district.vedasCategory} drought).`,
          'primary'
        );
      });

      polygon.addTo(group);

      // District Center Badge Label
      const labelIcon = L.divIcon({
        className: 'custom-district-marker',
        html: `
          <div style="
            text-align: center;
            pointer-events: none;
            text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.6);
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.1;
          ">
            <div>${district.name}</div>
            <div style="
              display: inline-block;
              font-size: 9.5px;
              font-weight: 600;
              background: rgba(17,24,39,0.75);
              padding: 1px 4px;
              border-radius: 3px;
              margin-top: 2px;
              border: 1px solid rgba(255,255,255,0.4);
            ">
              ${formattedVal}
            </div>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      L.marker(district.center, { icon: labelIcon, interactive: false }).addTo(group);
    });
  }, [activeMetric, selectedDistrictId, onSelectDistrict, showToast, activeMetricConfig]);

  // Render Taluka Hotspots Layer
  useEffect(() => {
    if (!talukasLayerGroupRef.current) return;
    const group = talukasLayerGroupRef.current;
    group.clearLayers();

    if (!showTalukas) return;

    TALUKA_HOTSPOTS.forEach(taluka => {
      const isCritical = taluka.severity === 'Critical';

      const icon = L.divIcon({
        className: 'custom-taluka-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; cursor: pointer;">
            <div class="${isCritical ? 'pulse-critical' : ''}" style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background-color: ${isCritical ? '#DC2626' : '#EA580C'};
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 5px rgba(0,0,0,0.4);
              margin: 4px;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker(taluka.coordinates, { icon });

      const popupContent = `
        <div style="padding: 10px; font-family: Inter, sans-serif; font-size: 12px; color: #111827; min-width: 200px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px;">
            <strong style="font-size: 13px; color: #111827;">${taluka.name} Taluka</strong>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${
              isCritical ? '#FEE2E2' : '#FEF3C7'
            }; color: ${isCritical ? '#991B1B' : '#92400E'}; font-weight: 700;">
              ${taluka.severity}
            </span>
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 6px;">
            District: <strong>${taluka.districtName}</strong>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 6px;">
            <div style="background: #F9FAFB; padding: 4px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <span style="color: #6B7280; display: block; font-size: 10px;">VCI Anomaly</span>
              <strong style="color: #DC2626;">${taluka.vci}%</strong>
            </div>
            <div style="background: #F9FAFB; padding: 4px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <span style="color: #6B7280; display: block; font-size: 10px;">GW Deficit</span>
              <strong style="color: #111827;">-${taluka.groundwaterDeficitM}m</strong>
            </div>
          </div>
          <div style="font-size: 11px; margin-bottom: 4px;">
            <span style="color: #6B7280;">Stressed Crop:</span>
            <div style="font-weight: 600; color: #111827;">${taluka.keyCrop}</div>
            <div style="font-size: 10px; color: #DC2626;">${taluka.cropStage} (${taluka.lossRiskPct}% loss risk)</div>
          </div>
          <div style="margin-top: 6px; padding: 4px 6px; background: #EEF4FA; border-radius: 4px; font-size: 10px; color: #0F4C81; font-weight: 600;">
            🚚 ${taluka.tankersAssigned} Active Potable Tankers Deployed
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(group);
    });
  }, [showTalukas]);

  // Render Automatic Weather Stations (AWS) Layer
  useEffect(() => {
    if (!awsLayerGroupRef.current) return;
    const group = awsLayerGroupRef.current;
    group.clearLayers();

    if (!showAWS) return;

    AWS_WEATHER_STATIONS.forEach(station => {
      const icon = L.divIcon({
        className: 'custom-aws-marker',
        html: `
          <div style="
            background: #0F4C81;
            color: #FFFFFF;
            width: 22px;
            height: 22px;
            border-radius: 4px;
            border: 1.5px solid #FFFFFF;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
          " title="${station.name}">
            ☁️
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker(station.coordinates, { icon });

      const popupContent = `
        <div style="padding: 10px; font-family: Inter, sans-serif; font-size: 12px; min-width: 190px;">
          <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-size: 13px; color: #111827;">${station.name}</strong>
            <div style="font-size: 10px; color: #0F4C81; font-weight: 600;">${station.stationType}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div style="background: #F9FAFB; padding: 4px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <span style="color: #6B7280; font-size: 10px; display: block;">Temperature</span>
              <strong style="color: #B26A00;">${station.temperatureC}°C</strong>
            </div>
            <div style="background: #F9FAFB; padding: 4px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <span style="color: #6B7280; font-size: 10px; display: block;">24h Rainfall</span>
              <strong style="color: ${station.rainfall24hMm === 0 ? '#C62828' : '#2E7D32'};">${station.rainfall24hMm} mm</strong>
            </div>
            <div style="background: #F9FAFB; padding: 4px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <span style="color: #6B7280; font-size: 10px; display: block;">Humidity</span>
              <strong style="color: #111827;">${station.relativeHumidityPct}%</strong>
            </div>
            <div style="background: #F9FAFB; padding: 4px; border-radius: 4px; border: 1px solid #E5E7EB;">
              <span style="color: #6B7280; font-size: 10px; display: block;">Wind Speed</span>
              <strong style="color: #111827;">${station.windSpeedKmh} km/h</strong>
            </div>
          </div>
          <div style="margin-top: 6px; font-size: 10px; color: #9CA3AF; text-align: right;">
            Updated: ${station.lastReading}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(group);
    });
  }, [showAWS]);

  // Render Convoys & Tanker Fleet GPS Layer
  useEffect(() => {
    if (!convoysLayerGroupRef.current) return;
    const group = convoysLayerGroupRef.current;
    group.clearLayers();

    if (!showConvoys) return;

    convoys.forEach(c => {
      // Find matching district coordinates for the convoy across Madhya Pradesh
      let lat = 24.7450;
      let lng = 78.8350;

      if (c.targetTaluka.includes('Jatara') || c.targetTaluka.includes('Tikamgarh')) {
        lat = 25.0167;
        lng = 79.0500;
      } else if (c.targetTaluka.includes('Nowgong') || c.targetTaluka.includes('Chhatarpur')) {
        lat = 25.0667;
        lng = 79.4500;
      } else if (c.targetTaluka.includes('Sendhwa') || c.targetTaluka.includes('Barwani')) {
        lat = 21.6833;
        lng = 75.0833;
      } else if (c.targetTaluka.includes('Karahal') || c.targetTaluka.includes('Sheopur')) {
        lat = 25.5000;
        lng = 77.0500;
      } else if (c.targetTaluka.includes('Kolaras') || c.targetTaluka.includes('Shivpuri')) {
        lat = 25.2333;
        lng = 77.6000;
      } else if (c.targetTaluka.includes('Kasrawad') || c.targetTaluka.includes('Khargone')) {
        lat = 22.1333;
        lng = 75.6000;
      }

      // Slightly perturb based on progress
      const latOffset = (c.progressPct - 50) * 0.003;
      const lngOffset = (c.progressPct - 50) * 0.003;

      const isWater = c.cargoType === 'Potable Water';

      const icon = L.divIcon({
        className: 'custom-convoy-marker',
        html: `
          <div style="
            background: ${isWater ? '#0284C7' : '#D97706'};
            color: #FFFFFF;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            cursor: pointer;
          " title="${c.vehicleNo} - ${c.cargoType}">
            ${isWater ? '💧' : '🌾'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat + latOffset, lng + lngOffset], { icon });

      const popupContent = `
        <div style="padding: 10px; font-family: Inter, sans-serif; font-size: 12px; min-width: 210px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: #111827;">${c.vehicleNo}</strong>
            <span style="font-size: 10px; background: #EEF4FA; color: #0F4C81; padding: 2px 5px; border-radius: 3px; font-weight: 600;">
              ${c.status}
            </span>
          </div>
          <div style="font-size: 11px; color: #4B5563; margin-bottom: 4px;">
            Cargo: <strong>${c.cargoType}</strong> (${c.cargoCapacity})
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 2px;">
            Route: ${c.originDepot} → <strong>${c.targetTaluka}</strong>
          </div>
          <div style="font-size: 11px; color: #6B7280; margin-bottom: 6px;">
            ETA: <strong style="color: #111827;">${c.eta}</strong> (${c.remainingKm} km left)
          </div>
          <div style="font-size: 10.5px; color: #4B5563; padding-top: 4px; border-top: 1px dashed #E5E7EB;">
            Driver: ${c.driverName} (${c.driverPhone})
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(group);
    });
  }, [convoys, showConvoys]);

  // Quick Zoom Helper
  const zoomToDistrict = (districtId: string) => {
    onSelectDistrict(districtId);
    const d = MADHYA_PRADESH_DISTRICTS_GEO.find(item => item.id === districtId);
    if (d && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(d.center, 8.5, { duration: 1.2 });
    }
  };

  const fitStateBounds = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([23.40, 77.80], 7, { duration: 1 });
  };
  const fitMaharashtraBounds = fitStateBounds;

  return (
    <>
      {/* Backdrop for Fullscreen Map */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      <div
        className={`bg-white rounded-lg border border-[#E3E6EB] shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden flex flex-col transition-all ${
          isFullscreen ? 'fixed inset-2 md:inset-4 z-50 rounded-xl shadow-2xl border-[#BCD4EC]' : ''
        } ${className}`}
      >
        {/* Top Map Control Bar: Clean & uncluttered in normal view, full options in fullscreen */}
        <div className="p-3 border-b border-[#E3E6EB] bg-[#FAFBFC]">
          {!isFullscreen ? (
            /* Clean & Uncluttered Normal View */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#0F4C81] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#111827] truncate">
                      Madhya Pradesh Drought Observatory
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[9.5px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-1.5 py-0.2 rounded-full border border-[#C8E6C9] shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate">
                    ISRO SAC VEDAS · IMD Telemetry · {activeMetricConfig.shortLabel}: <strong className="text-[#0F4C81]">{activeMetricConfig.label}</strong>
                  </p>
                </div>
              </div>

              {/* Streamlined Controls */}
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                {/* Compact Drought Index Dropdown */}
                <div className="relative">
                  <select
                    value={activeMetric}
                    onChange={e => setActiveMetric(e.target.value as DroughtMapMetric)}
                    className="appearance-none bg-white border border-[#E3E6EB] text-[#111827] text-xs font-medium rounded-md pl-2.5 pr-7 py-1 shadow-xs hover:border-[#BCD4EC] focus:outline-none focus:ring-1 focus:ring-[#0F4C81] cursor-pointer"
                    title="Select Drought Severity Index"
                  >
                    {(Object.keys(DROUGHT_METRICS_CONFIG) as DroughtMapMetric[]).map(key => (
                      <option key={key} value={key}>
                        Index: {DROUGHT_METRICS_CONFIG[key].shortLabel} - {DROUGHT_METRICS_CONFIG[key].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#6B7280] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Basemap Dropdown */}
                <div className="relative hidden md:block">
                  <select
                    value={activeBasemap}
                    onChange={e => setActiveBasemap(e.target.value as BasemapType)}
                    className="appearance-none bg-white border border-[#E3E6EB] text-[#4B5563] text-xs rounded-md pl-2 pr-6 py-1 hover:border-[#BCD4EC] focus:outline-none focus:ring-1 focus:ring-[#0F4C81] cursor-pointer"
                    title="Select Base Tilemap"
                  >
                    <option value="carto_light">Map: Light</option>
                    <option value="esri_satellite">Map: Satellite</option>
                    <option value="osm">Map: OSM</option>
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 text-[#6B7280] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Full State Bounds Reset */}
                <button
                  type="button"
                  onClick={fitMaharashtraBounds}
                  className="p-1 text-[#4B5563] hover:text-[#111827] border border-[#E3E6EB] rounded bg-white hover:bg-[#F9FAFB] transition-colors shadow-xs"
                  title="Fit full Madhya Pradesh state bounds"
                >
                  <Compass className="w-3.5 h-3.5 text-[#0F4C81]" />
                </button>

                {/* Prominent Fullscreen Trigger */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0F4C81] bg-[#EEF4FA] border border-[#BCD4EC] rounded-md hover:bg-[#E0EDF8] transition-colors shadow-xs"
                  title="Expand to fullscreen - see all indices and layers"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
              </div>
            </div>
          ) : (
            /* Fullscreen Mode: Spaciously show ALL options explicitly */
            <div className="flex flex-col gap-3">
              {/* Top Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2.5 border-b border-[#E3E6EB]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#0F4C81] text-white flex items-center justify-center shadow-xs">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-[#111827] tracking-tight">
                        Madhya Pradesh Drought Geospatial Observatory
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                        Live GIS Telemetry
                      </span>
                      <span className="text-[10px] font-semibold bg-[#EEF4FA] text-[#0F4C81] px-2 py-0.5 rounded-full border border-[#BCD4EC]">
                        Fullscreen Mode (Esc to exit)
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Calibrated against ISRO SAC VEDAS Krishi-DSS, IMD Doppler & Copernicus Sentinel-2
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={fitMaharashtraBounds}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#4B5563] bg-white border border-[#E3E6EB] rounded hover:bg-[#F9FAFB] transition-colors"
                    title="Reset view to whole state"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#0F4C81]" />
                    <span>Full State</span>
                  </button>

                  <button
                    type="button"
                    disabled={isVedasSyncing}
                    onClick={() => syncVedasData()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0F4C81] bg-[#EEF4FA] border border-[#BCD4EC] rounded hover:bg-[#E0EDF8] transition-colors disabled:opacity-50"
                    title="Refresh satellite telemetry from SAC VEDAS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVedasSyncing ? 'animate-spin' : ''}`} />
                    <span>{isVedasSyncing ? 'Syncing VEDAS...' : 'Sync VEDAS'}</span>
                  </button>

                  <a
                    href={vedasPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#6B7280] bg-white border border-[#E3E6EB] rounded hover:text-[#111827] hover:bg-[#F9FAFB] transition-colors"
                    title="Open ISRO SAC VEDAS Krishi-DSS portal"
                  >
                    <span>SAC Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#C62828] hover:bg-[#B71C1C] rounded shadow-xs transition-colors"
                    title="Exit fullscreen mode (or press Esc)"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Exit Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Second Row: All Options Laid Out Spaciously */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-0.5">
                {/* All 6 Drought Indices Laid Out */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#4B5563] whitespace-nowrap uppercase tracking-wider mr-1">
                    Drought Indices:
                  </span>
                  {(Object.keys(DROUGHT_METRICS_CONFIG) as DroughtMapMetric[]).map(key => {
                    const cfg = DROUGHT_METRICS_CONFIG[key];
                    const isActive = activeMetric === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveMetric(key)}
                        className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-[#0F4C81] text-white shadow-xs font-semibold'
                            : 'bg-white text-[#4B5563] border border-[#E3E6EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Basemaps and Layers */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Basemap switcher */}
                  <div className="flex items-center gap-1 bg-white border border-[#E3E6EB] rounded p-0.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280] px-1.5">Basemap:</span>
                    <button
                      type="button"
                      onClick={() => setActiveBasemap('carto_light')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        activeBasemap === 'carto_light' ? 'bg-[#EEF4FA] text-[#0F4C81] font-semibold' : 'text-[#6B7280]'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBasemap('esri_satellite')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        activeBasemap === 'esri_satellite' ? 'bg-[#EEF4FA] text-[#0F4C81] font-semibold' : 'text-[#6B7280]'
                      }`}
                    >
                      Satellite
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBasemap('osm')}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        activeBasemap === 'osm' ? 'bg-[#EEF4FA] text-[#0F4C81] font-semibold' : 'text-[#6B7280]'
                      }`}
                    >
                      OSM
                    </button>
                  </div>

                  {/* Layer Checkboxes */}
                  <div className="flex items-center gap-3 bg-white border border-[#E3E6EB] rounded px-3 py-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#6B7280]">Layers:</span>
                    <label className="flex items-center gap-1 text-[11px] text-[#4B5563] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showTalukas}
                        onChange={e => setShowTalukas(e.target.checked)}
                        className="rounded border-[#D1D5DB] text-[#0F4C81] focus:ring-[#0F4C81] w-3 h-3"
                      />
                      <span>Talukas</span>
                    </label>

                    <label className="flex items-center gap-1 text-[11px] text-[#4B5563] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showAWS}
                        onChange={e => setShowAWS(e.target.checked)}
                        className="rounded border-[#D1D5DB] text-[#0F4C81] focus:ring-[#0F4C81] w-3 h-3"
                      />
                      <span>AWS Weather</span>
                    </label>

                    <label className="flex items-center gap-1 text-[11px] text-[#4B5563] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showConvoys}
                        onChange={e => setShowConvoys(e.target.checked)}
                        className="rounded border-[#D1D5DB] text-[#0F4C81] focus:ring-[#0F4C81] w-3 h-3"
                      />
                      <span>Tanker Convoys</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Metric Explanation Banner in Fullscreen */}
              <div className="flex items-center justify-between text-[11px] bg-[#F1F5F9] px-3 py-1.5 rounded text-[#334155] border border-[#E2E8F0]">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0F4C81] shrink-0" />
                  <span>
                    <strong>{activeMetricConfig.label}:</strong> {activeMetricConfig.description}
                  </span>
                </div>
                <span className="text-[10px] text-[#64748B] shrink-0 font-medium">
                  Sync: {lastVedasSync}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Map Canvas Area */}
        <div className={`relative w-full flex-1 ${isFullscreen ? 'h-[calc(100vh-210px)] min-h-[500px]' : 'min-h-[460px] lg:min-h-[500px]'}`}>
          {/* Leaflet DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[460px] lg:min-h-[500px]" />

        {/* Floating Quick District Jump Bar (Top-Right) */}
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs border border-[#E3E6EB] rounded-md shadow-md p-2 flex items-center gap-1.5 text-xs">
          <span className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mr-1">
            Focus:
          </span>
          {['tikamgarh', 'chhatarpur', 'barwani', 'sheopur', 'shivpuri', 'khargone', 'dewas'].map(distId => {
            const isCurrent = selectedDistrictId === distId;
            const geo = MADHYA_PRADESH_DISTRICTS_GEO.find((d: DistrictGeoFeature) => d.id === distId);
            return (
              <button
                key={distId}
                type="button"
                onClick={() => zoomToDistrict(distId)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? 'bg-[#0F4C81] text-white font-semibold'
                    : 'bg-[#F1F3F5] text-[#4B5563] hover:bg-[#E2E8F0]'
                }`}
              >
                {geo?.name.split(' ')[0] || distId}
              </button>
            );
          })}
        </div>

        {/* Floating Interactive Legend (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs border border-[#E3E6EB] rounded-md shadow-md p-2.5 max-w-xs text-xs">
          <div className="font-semibold text-[#111827] text-[11px] mb-1.5 flex items-center justify-between">
            <span>{activeMetricConfig.legendTitle}</span>
            <span className="text-[10px] text-[#6B7280] font-normal">({activeMetricConfig.unit})</span>
          </div>
          <div className="space-y-1">
            {activeMetricConfig.legendSteps.map(step => (
              <div key={step.label} className="flex items-center justify-between gap-3 text-[10.5px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-xs shrink-0 shadow-2xs border border-black/10"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="font-medium text-[#1F2937]">{step.label}</span>
                </div>
                <span className="text-[#6B7280] text-[10px] truncate max-w-[120px]">{step.desc}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-1.5 border-t border-[#E5E7EB] text-[9.5px] text-[#9CA3AF] flex items-center justify-between">
            <span>Source: ISRO SAC / IMD</span>
            <span className="font-medium text-[#0F4C81]">Click district to inspect</span>
          </div>
        </div>

        {/* Hover Inspector Card (Bottom-Right) */}
        {hoveredDistrict && (
          <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs border border-[#0F4C81] rounded-md shadow-lg p-3 min-w-[220px] text-xs pointer-events-none transition-all">
            <div className="flex items-center justify-between border-b border-[#E3E6EB] pb-1.5 mb-1.5">
              <div>
                <strong className="text-sm text-[#111827]">{hoveredDistrict.name}</strong>
                <span className="text-[10px] text-[#6B7280] ml-1.5">({hoveredDistrict.marathiName})</span>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-bold text-white shadow-2xs"
                style={{ backgroundColor: getDistrictColor(hoveredDistrict, activeMetric) }}
              >
                {hoveredDistrict.vedasCategory}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div>
                <span className="text-[10px] text-[#6B7280] block">VCI Anomaly</span>
                <span className="font-semibold text-[#111827]">{hoveredDistrict.vci.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">SPI-3M</span>
                <span className="font-semibold text-[#111827]">{hoveredDistrict.spi3M.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">Soil Moisture</span>
                <span className="font-semibold text-[#DC2626]">{hoveredDistrict.soilMoistureDev.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B7280] block">Crop Risk</span>
                <span className="font-semibold text-[#DC2626]">{hoveredDistrict.cropLossRiskPct}% Loss</span>
              </div>
            </div>

            <div className="mt-2 pt-1 border-t border-[#E3E6EB] flex justify-between items-center text-[10px] text-[#4B5563]">
              <span>Tankers: <strong>{hoveredDistrict.activeTankers}</strong></span>
              <span>Acreage: <strong>{hoveredDistrict.monitoredAcreageHa}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Footer */}
      <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E3E6EB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#111827]">Active Focus District:</span>
          <span className="text-[#0F4C81] font-bold bg-[#EEF4FA] px-2 py-0.5 rounded border border-[#BCD4EC]">
            {MADHYA_PRADESH_DISTRICTS_GEO.find((d: DistrictGeoFeature) => d.id === selectedDistrictId)?.name || 'Tikamgarh'}
          </span>
          <span className="text-[11px] text-[#6B7280]">
            (Division: {MADHYA_PRADESH_DISTRICTS_GEO.find((d: DistrictGeoFeature) => d.id === selectedDistrictId)?.division})
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span>Layers: Districts · Taluka Hotspots ({TALUKA_HOTSPOTS.length}) · IMD AWS ({AWS_WEATHER_STATIONS.length})</span>
        </div>
      </div>
      </div>
    </>
  );
};
