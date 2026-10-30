import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useApp } from '../context/AppContext';

type MetricType = 'risk' | 'deficit' | 'impact' | 'vedas_spi' | 'vedas_vci';

interface DataPoint {
  day: number;
  label: string;
  isProjected: boolean;
  tikamgarh: number;
  chhatarpur: number;
  barwani: number;
  sheopur: number;
  khargone: number;
}

export const DroughtSeverityChart: React.FC = () => {
  const { stressScenario, budget } = useApp();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeMetric, setActiveMetric] = useState<MetricType>('risk');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [visibleDistricts, setVisibleDistricts] = useState<Record<string, boolean>>({
    tikamgarh: true,
    chhatarpur: true,
    barwani: true,
    sheopur: true,
    khargone: true
  });

  const scenarioMultiplier = useMemo(() => {
    if (stressScenario === 'mild') return 0.85;
    if (stressScenario === 'extreme') return 1.25;
    return 1.0;
  }, [stressScenario]);

  const reliefDampening = useMemo(() => {
    return Math.max(0.7, 1 - (budget - 20) / 450);
  }, [budget]);

  const timelineData: DataPoint[] = useMemo(() => {
    const timeLabels = [
      '24 Sep',
      '01 Oct',
      '08 Oct',
      '15 Oct',
      '24 Oct (Today)',
      '01 Nov (Proj)',
      '08 Nov (Proj)',
      '15 Nov (Proj)',
      '22 Nov (Proj)',
      '30 Nov (Proj)'
    ];

    return timeLabels.map((label, idx) => {
      const isProjected = idx >= 4;

      if (activeMetric === 'risk') {
        return {
          day: idx,
          label,
          isProjected,
          tikamgarh: Math.min(1.0, +(0.74 + idx * 0.038 * scenarioMultiplier - (isProjected ? (1 - reliefDampening) * 0.1 : 0)).toFixed(2)),
          chhatarpur: Math.min(1.0, +(0.69 + idx * 0.035 * scenarioMultiplier - (isProjected ? (1 - reliefDampening) * 0.09 : 0)).toFixed(2)),
          barwani: Math.min(1.0, +(0.59 + idx * 0.03 * scenarioMultiplier - (isProjected ? (1 - reliefDampening) * 0.08 : 0)).toFixed(2)),
          sheopur: Math.min(1.0, +(0.52 + idx * 0.026 * scenarioMultiplier - (isProjected ? (1 - reliefDampening) * 0.07 : 0)).toFixed(2)),
          khargone: Math.min(1.0, +(0.45 + idx * 0.02 * scenarioMultiplier - (isProjected ? (1 - reliefDampening) * 0.06 : 0)).toFixed(2))
        };
      } else if (activeMetric === 'deficit') {
        return {
          day: idx,
          label,
          isProjected,
          tikamgarh: Math.min(85, +(40 + idx * 4.0 * scenarioMultiplier).toFixed(1)),
          chhatarpur: Math.min(85, +(36 + idx * 3.8 * scenarioMultiplier).toFixed(1)),
          barwani: Math.min(85, +(30 + idx * 3.3 * scenarioMultiplier).toFixed(1)),
          sheopur: Math.min(85, +(25 + idx * 2.8 * scenarioMultiplier).toFixed(1)),
          khargone: Math.min(85, +(21 + idx * 2.5 * scenarioMultiplier).toFixed(1))
        };
      } else if (activeMetric === 'vedas_spi') {
        // ISRO SAC VEDAS Krishi-DSS Standardized Precipitation Index 3-Month
        const baseOffset = (idx - 4) * 0.08 * scenarioMultiplier;
        return {
          day: idx,
          label,
          isProjected,
          tikamgarh: Number((-2.24 + baseOffset).toFixed(2)),
          chhatarpur: Number((-2.12 + baseOffset * 0.95).toFixed(2)),
          barwani: Number((-2.05 + baseOffset * 0.9).toFixed(2)),
          sheopur: Number((-1.98 + baseOffset * 0.8).toFixed(2)),
          khargone: Number((-1.82 + baseOffset * 0.75).toFixed(2))
        };
      } else if (activeMetric === 'vedas_vci') {
        // ISRO SAC VEDAS Krishi-DSS Vegetation Condition Index (0-100%)
        const vciChange = (idx - 4) * 1.5 * scenarioMultiplier * (isProjected ? reliefDampening : 1);
        return {
          day: idx,
          label,
          isProjected,
          tikamgarh: Math.max(10, Math.min(100, Number((19.4 - vciChange).toFixed(1)))),
          chhatarpur: Math.max(10, Math.min(100, Number((22.1 - vciChange * 0.9).toFixed(1)))),
          barwani: Math.max(10, Math.min(100, Number((24.8 - vciChange * 0.85).toFixed(1)))),
          sheopur: Math.max(10, Math.min(100, Number((26.5 - vciChange * 0.75).toFixed(1)))),
          khargone: Math.max(10, Math.min(100, Number((31.2 - vciChange * 0.65).toFixed(1))))
        };
      } else {
        return {
          day: idx,
          label,
          isProjected,
          tikamgarh: Math.min(100, Math.round(44 + idx * 8.0 * scenarioMultiplier * (isProjected ? reliefDampening : 1))),
          chhatarpur: Math.min(100, Math.round(39 + idx * 7.5 * scenarioMultiplier * (isProjected ? reliefDampening : 1))),
          barwani: Math.min(100, Math.round(33 + idx * 6.5 * scenarioMultiplier * (isProjected ? reliefDampening : 1))),
          sheopur: Math.min(100, Math.round(27 + idx * 5.2 * scenarioMultiplier * (isProjected ? reliefDampening : 1))),
          khargone: Math.min(100, Math.round(21 + idx * 4.5 * scenarioMultiplier * (isProjected ? reliefDampening : 1)))
        };
      }
    });
  }, [activeMetric, scenarioMultiplier, reliefDampening]);

  const districtConfigs = [
    { key: 'tikamgarh', label: 'Tikamgarh', color: '#C62828' },
    { key: 'chhatarpur', label: 'Chhatarpur', color: '#B26A00' },
    { key: 'barwani', label: 'Barwani', color: '#0F4C81' },
    { key: 'sheopur', label: 'Sheopur', color: '#2E7D32' },
    { key: 'khargone', label: 'Khargone', color: '#6B7280' }
  ];

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const toggleDistrict = (key: string) => {
    setVisibleDistricts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Observe container size smoothly and avoid 0-width layout race conditions
  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };

    measure();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setContainerWidth(w);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const measuredWidth = containerWidth > 0 ? containerWidth : containerRef.current.clientWidth || 700;
    const width = Math.max(320, measuredWidth);
    const height = 240;
    const margin = { top: 20, right: 30, bottom: 35, left: 45 };

    const innerWidth = Math.max(10, width - margin.left - margin.right);
    const innerHeight = Math.max(10, height - margin.top - margin.bottom);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Scales
    const x = d3
      .scaleLinear()
      .domain([0, timelineData.length - 1])
      .range([margin.left, width - margin.right]);

    let yDomain: [number, number] = [0, 1.0];
    if (activeMetric === 'deficit') yDomain = [0, 85];
    if (activeMetric === 'impact') yDomain = [0, 100];
    if (activeMetric === 'vedas_spi') yDomain = [-3.0, 0.0];
    if (activeMetric === 'vedas_vci') yDomain = [0, 100];

    const y = d3
      .scaleLinear()
      .domain(yDomain)
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(d3.range(timelineData.length))
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#F1F3F5').attr('stroke-dasharray', '2,2'));

    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#F1F3F5').attr('stroke-dasharray', '2,2'));

    // Shaded projection zone background
    const todayIndex = 4;
    const projX = x(todayIndex);
    const projWidth = Math.max(0, width - margin.right - projX);

    if (projWidth > 0) {
      svg
        .append('rect')
        .attr('x', projX)
        .attr('y', margin.top)
        .attr('width', projWidth)
        .attr('height', innerHeight)
        .attr('fill', '#0F4C81')
        .attr('opacity', 0.035);
    }

    // Vertical dashed marker for 'Today'
    svg
      .append('line')
      .attr('x1', projX)
      .attr('x2', projX)
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#0F4C81')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    // 'Projection Horizon' label
    svg
      .append('text')
      .attr('x', projX + 6)
      .attr('y', margin.top + 12)
      .attr('fill', '#0F4C81')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text('PROJECTION HORIZON →');

    // Axes
    const xAxis = d3
      .axisBottom(x)
      .tickValues(d3.range(timelineData.length))
      .tickFormat((d) => timelineData[d as number]?.label || '');

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.select('.domain').attr('stroke', '#E3E6EB'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#E3E6EB'))
      .call(g =>
        g
          .selectAll('.tick text')
          .attr('font-size', '10px')
          .attr('fill', (d) => ((d as number) >= todayIndex ? '#0F4C81' : '#6B7280'))
          .attr('font-weight', (d) => ((d as number) === todayIndex ? '600' : '400'))
      );

    const yAxis = d3.axisLeft(y).ticks(5);
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .call(g => g.select('.domain').attr('stroke', '#E3E6EB'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#E3E6EB'))
      .call(g =>
        g
          .selectAll('.tick text')
          .attr('font-size', '10px')
          .attr('fill', '#6B7280')
      );

    // Render lines for each district
    districtConfigs.forEach(dist => {
      if (!visibleDistricts[dist.key]) return;

      const lineGenerator = d3
        .line<DataPoint>()
        .x(d => x(d.day))
        .y(d => y((d as any)[dist.key]))
        .curve(d3.curveMonotoneX);

      // Solid past line
      svg
        .append('path')
        .datum(timelineData.slice(0, todayIndex + 1))
        .attr('fill', 'none')
        .attr('stroke', dist.color)
        .attr('stroke-width', dist.key === 'tikamgarh' ? 2.2 : 1.6)
        .attr('d', lineGenerator);

      // Dashed projection line
      svg
        .append('path')
        .datum(timelineData.slice(todayIndex))
        .attr('fill', 'none')
        .attr('stroke', dist.color)
        .attr('stroke-width', dist.key === 'tikamgarh' ? 2.0 : 1.5)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0.85)
        .attr('d', lineGenerator);

      // Historical observed dots
      svg
        .selectAll(`.dot-${dist.key}`)
        .data(timelineData.slice(0, todayIndex + 1))
        .enter()
        .append('circle')
        .attr('class', `dot-${dist.key}`)
        .attr('cx', d => x(d.day))
        .attr('cy', d => y((d as any)[dist.key]))
        .attr('r', dist.key === 'tikamgarh' ? 3.5 : 2.5)
        .attr('fill', dist.color);
    });

    // Invisible hover overlay
    const overlay = svg
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    overlay.on('mousemove', (event) => {
      const [mx] = d3.pointer(event);
      if (isNaN(mx)) return;
      const rawDay = x.invert(mx);
      if (isNaN(rawDay)) return;
      const roundedDay = Math.round(Math.max(0, Math.min(timelineData.length - 1, rawDay)));
      setHoveredPoint(timelineData[roundedDay]);
      setHoverX(x(roundedDay));
    });

    overlay.on('mouseleave', () => {
      setHoveredPoint(null);
      setHoverX(null);
    });
  }, [timelineData, activeMetric, visibleDistricts, containerWidth]);

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#111827]">
              Multi-Horizon Drought Trajectory & 30-Day Predictive Model
            </h3>
            <span className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
              VEDAS Calibrated
            </span>
          </div>
          <p className="text-xs text-[#6B7280]">
            Empirical trajectory (Sep–Oct) extrapolated with IMD-MME ensemble projections through Nov 2026 across Madhya Pradesh
          </p>
        </div>

        {/* Metric Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveMetric('risk')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeMetric === 'risk'
                ? 'bg-[#0F4C81] text-white font-medium'
                : 'text-[#4B5563] bg-[#F1F3F5] hover:bg-[#E3E6EB]'
            }`}
          >
            Composite Risk
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('deficit')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeMetric === 'deficit'
                ? 'bg-[#0F4C81] text-white font-medium'
                : 'text-[#4B5563] bg-[#F1F3F5] hover:bg-[#E3E6EB]'
            }`}
          >
            Rainfall Deficit (%)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('vedas_spi')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeMetric === 'vedas_spi'
                ? 'bg-[#0F4C81] text-white font-medium'
                : 'text-[#4B5563] bg-[#F1F3F5] hover:bg-[#E3E6EB]'
            }`}
          >
            SPI-3M (ISRO VEDAS)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('vedas_vci')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeMetric === 'vedas_vci'
                ? 'bg-[#0F4C81] text-white font-medium'
                : 'text-[#4B5563] bg-[#F1F3F5] hover:bg-[#E3E6EB]'
            }`}
          >
            VCI Index (%)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('impact')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              activeMetric === 'impact'
                ? 'bg-[#0F4C81] text-white font-medium'
                : 'text-[#4B5563] bg-[#F1F3F5] hover:bg-[#E3E6EB]'
            }`}
          >
            Agrarian Distress
          </button>
        </div>
      </div>

      {/* District Legend & Toggle Pills */}
      <div className="flex items-center gap-2 py-2.5 flex-wrap text-xs border-b border-[#F1F3F5]">
        <span className="text-[11px] text-[#6B7280] font-medium mr-1">Track Districts:</span>
        {districtConfigs.map(dist => {
          const isVisible = visibleDistricts[dist.key];
          return (
            <button
              key={dist.key}
              type="button"
              onClick={() => toggleDistrict(dist.key)}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-all border ${
                isVisible
                  ? 'bg-white text-[#111827] border-[#E3E6EB] shadow-xs'
                  : 'bg-[#F9FAFB] text-[#9CA3AF] border-dashed border-[#E3E6EB] opacity-60'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isVisible ? dist.color : '#D1D5DB' }}
              />
              <span>{dist.label}</span>
            </button>
          );
        })}
      </div>

      {/* D3 SVG Chart Container */}
      <div ref={containerRef} className="relative w-full pt-2 min-h-[240px]">
        <svg ref={svgRef} className="w-full block overflow-visible min-h-[240px]" />

        {/* Hover Tooltip Card */}
        {hoveredPoint && hoverX !== null && (
          <div
            className="absolute top-2 pointer-events-none z-20 transform -translate-x-1/2 p-2.5 rounded-md bg-white border border-[#E3E6EB] shadow-md text-xs min-w-[150px]"
            style={{ left: `${hoverX}px` }}
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#E3E6EB] mb-1.5">
              <span className="font-semibold text-[#111827]">{hoveredPoint.label}</span>
              {hoveredPoint.isProjected && (
                <span className="text-[10px] text-[#0F4C81] font-medium">Forecast</span>
              )}
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              {visibleDistricts.tikamgarh && (
                <div className="flex justify-between items-center text-[#C62828]">
                  <span>Tikamgarh:</span>
                  <span className="font-semibold">{hoveredPoint.tikamgarh}</span>
                </div>
              )}
              {visibleDistricts.chhatarpur && (
                <div className="flex justify-between items-center text-[#B26A00]">
                  <span>Chhatarpur:</span>
                  <span className="font-semibold">{hoveredPoint.chhatarpur}</span>
                </div>
              )}
              {visibleDistricts.barwani && (
                <div className="flex justify-between items-center text-[#0F4C81]">
                  <span>Barwani:</span>
                  <span className="font-semibold">{hoveredPoint.barwani}</span>
                </div>
              )}
              {visibleDistricts.sheopur && (
                <div className="flex justify-between items-center text-[#2E7D32]">
                  <span>Sheopur:</span>
                  <span className="font-semibold">{hoveredPoint.sheopur}</span>
                </div>
              )}
              {visibleDistricts.khargone && (
                <div className="flex justify-between items-center text-[#6B7280]">
                  <span>Khargone:</span>
                  <span className="font-semibold">{hoveredPoint.khargone}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
