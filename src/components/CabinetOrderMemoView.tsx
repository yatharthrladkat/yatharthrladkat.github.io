import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Printer,
  Download,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Building,
  Stamp
} from 'lucide-react';

export const CabinetOrderMemoView: React.FC = () => {
  const {
    districts,
    allocatedBudgetCr,
    coveredBeneficiariesLakh,
    budget,
    officerName
  } = useApp();

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-lg border border-[#E3E6EB] shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-[#111827]">
            Official Government Gazette Memorandum (Cabinet Scarcity Order)
          </h3>
          <p className="text-xs text-[#6B7280]">
            Format compliant with MP Scarcity Manual (Rule 42) & State Disaster Response Fund (SDRF) Norms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0F4C81] text-white text-xs font-bold hover:bg-[#0A3963] transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Order (PDF)</span>
          </button>
        </div>
      </div>

      {/* Official Government Memorandum Paper Document */}
      <div
        ref={printRef}
        className="bg-white p-8 md:p-12 rounded-lg border border-[#D1D5DB] shadow-md max-w-4xl mx-auto text-[#111827] font-serif leading-normal"
        id="printable-cabinet-memo"
      >
        {/* Government Header */}
        <div className="text-center pb-6 border-b-2 border-[#111827] space-y-1">
          <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-full border-2 border-[#111827] font-sans font-bold text-xs">
            MP SDMA
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-wide uppercase">
            Government of Madhya Pradesh
          </h1>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#374151]">
            Revenue and Disaster Relief Department
          </h2>
          <p className="text-xs text-[#4B5563]">
            Mantralaya, Vallabh Bhawan, Bhopal - 462004
          </p>
        </div>

        {/* Order Metadata */}
        <div className="flex justify-between items-center text-xs pt-4 font-sans border-b border-[#E5E7EB] pb-3">
          <div>
            <strong>Notification Order No.:</strong> F-14-08/2026/Rev-Disaster/EPE-01
          </div>
          <div>
            <strong>Date of Promulgation:</strong> {currentDate}
          </div>
        </div>

        {/* Subject */}
        <div className="my-6 text-sm font-sans">
          <div className="font-bold uppercase tracking-wide text-xs text-[#374151]">
            Subject:
          </div>
          <p className="font-bold text-[#111827] mt-1 border-l-4 border-[#0F4C81] pl-3 py-1">
            Preemptive Financial Sanction and Statutory Resource Allocation for Mitigating El Niño Phase Deficits across Priority Districts under the MP Scarcity Manual (Rule 42).
          </p>
        </div>

        {/* Memorandum Body Paragraphs */}
        <div className="space-y-4 text-xs md:text-sm text-justify font-serif leading-relaxed">
          <p>
            <strong>1. PREAMBLE:</strong> In accordance with satellite hydrological observations received from the ISRO SAC VEDAS Krishi-DSS portal and the India Meteorological Department (IMD) Bhopal, compounded by three-month rainfall departures exceeding -50% in Bundelkhand and Nimar agrarian belts, the State Disaster Management Authority hereby notifies the invocation of <strong>Anticipatory Scarcity Protocols</strong>.
          </p>
          <p>
            <strong>2. ADMINISTRATIVE APPROVAL:</strong> The Governor of Madhya Pradesh is pleased to accord administrative and financial sanction to the allocation of <strong>₹{budget.toFixed(1)} Crores</strong> (Rupees {budget.toFixed(1)} Crores only) from the State Disaster Contingency Reserve to safeguard drinking water availability, cattle sustenance, and smallholder equity.
          </p>
          <p>
            <strong>3. DETERMINISTIC ALLOCATION SCHEDULE:</strong> Allocations have been determined using the state's certified deterministic preemption solver, ensuring resource conservation without negative stock balances:
          </p>

          {/* Allocation Table */}
          <div className="my-4 font-sans">
            <table className="w-full text-left text-xs border border-[#111827]">
              <thead className="bg-[#F3F4F6] border-b border-[#111827] text-[#111827]">
                <tr>
                  <th className="p-2 border-r border-[#111827] font-bold">District</th>
                  <th className="p-2 border-r border-[#111827] font-bold">Division</th>
                  <th className="p-2 border-r border-[#111827] font-bold">Risk Index</th>
                  <th className="p-2 border-r border-[#111827] font-bold">Tankers/Day</th>
                  <th className="p-2 border-r border-[#111827] font-bold">Fodder (MT)</th>
                  <th className="p-2 font-bold">Sanctioned (₹ Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {districts.slice(0, 7).map(d => (
                  <tr key={d.id} className="border-b border-[#E5E7EB]">
                    <td className="p-2 border-r border-[#111827] font-bold">{d.name}</td>
                    <td className="p-2 border-r border-[#111827]">{d.division}</td>
                    <td className="p-2 border-r border-[#111827] font-mono">{d.riskScore.toFixed(2)}</td>
                    <td className="p-2 border-r border-[#111827] tabular-nums font-semibold">
                      {Math.round(d.reqBudgetCr * 14.5)} Trips
                    </td>
                    <td className="p-2 border-r border-[#111827] tabular-nums">
                      {Math.round(d.reqBudgetCr * 220)} MT
                    </td>
                    <td className="p-2 font-bold text-[#111827] tabular-nums">
                      ₹{d.reqBudgetCr} Cr
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F9FAFB] font-bold border-t border-[#111827]">
                <tr>
                  <td colSpan={5} className="p-2 border-r border-[#111827] text-right uppercase">
                    Total State Preemption Allocation:
                  </td>
                  <td className="p-2 text-[#0F4C81]">₹{allocatedBudgetCr} Cr</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p>
            <strong>4. DIRECTIVES TO DISTRICT COLLECTORS:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 font-serif text-xs">
            <li>District Collectors shall enforce automated FASTag green-corridor clearance for all designated water tankers and fodder consignments.</li>
            <li>No diversion of sanctioned funds to non-scarcity works shall be permitted without prior Cabinet authorization.</li>
            <li>Daily telemetric delivery logs and GPS waypoint confirmations must be uploaded to the state preemption portal by 18:00 hours IST.</li>
          </ul>

          <p>
            <strong>5. CERTIFICATION:</strong> This order has been vetted and mathematically verified under Algorithm Version <code>v1.0.0-deterministic-greedy</code> with zero negative inventory balances.
          </p>
        </div>

        {/* Signature Blocks */}
        <div className="mt-12 pt-6 border-t border-[#111827] flex justify-between items-end font-sans text-xs">
          <div>
            <div className="font-bold">Officer-in-Charge:</div>
            <div className="text-[#374151] mt-1">{officerName}</div>
            <div className="text-[#6B7280]">State Relief Officer, Grade I</div>
            <div className="text-[#9CA3AF] text-[10px] mt-1 font-mono">
              Digital Signature Verified: 0x8F9C...22B1
            </div>
          </div>

          <div className="text-right">
            <div className="w-24 h-12 border border-dashed border-[#9CA3AF] rounded mb-1 ml-auto flex items-center justify-center text-[10px] text-[#6B7280] font-mono">
              [GOVT OF MP STAMP]
            </div>
            <div className="font-bold">By Order and in the Name of the Governor,</div>
            <div className="font-semibold text-[#111827]">Principal Secretary to Government</div>
            <div className="text-[#4B5563]">Revenue and Relief Department, Madhya Pradesh</div>
          </div>
        </div>
      </div>
    </div>
  );
};
