import React, { useState, useEffect } from 'react';
import {
  Dna,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  fetchCropGenomics,
  fetchDroughtLiterature,
  ProteinRecord,
  ScientificArticle
} from '../services/api';

interface CropGenomicsExplorerProps {
  initialCrop?: string;
}

export const CropGenomicsExplorer: React.FC<CropGenomicsExplorerProps> = ({
  initialCrop = 'Soybean'
}) => {
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [isLoadingProteins, setIsLoadingProteins] = useState(false);
  const [proteins, setProteins] = useState<ProteinRecord[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [articles, setArticles] = useState<ScientificArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'proteins' | 'literature'>('proteins');

  const mpCrops = [
    { id: 'Soybean', label: 'Soybean (Glycine max — Malwa & Bundelkhand)', variety: 'JS-9560 / NRC-37' },
    { id: 'Cotton', label: 'Upland Cotton (Gossypium hirsutum — Nimar Valley)', variety: 'RCH-2 Bt Cotton' },
    { id: 'Millet', label: 'Pearl Millet / Bajra (Pennisetum — Chambal & Sheopur)', variety: 'HHB-67' },
    { id: 'Mustard', label: 'Indian Mustard (Brassica juncea — Morena & Bhind)', variety: 'Pusa Bold' },
    { id: 'Chickpea', label: 'Gram / Chickpea (Cicer arietinum — Bundelkhand)', variety: 'JG-11' }
  ];

  const loadData = async (crop: string) => {
    setIsLoadingProteins(true);
    setIsLoadingArticles(true);

    try {
      const pRes = await fetchCropGenomics(crop);
      setProteins(pRes.proteins || []);
    } catch {
      console.warn('Failed to load crop genomics');
    } finally {
      setIsLoadingProteins(false);
    }

    try {
      const lRes = await fetchDroughtLiterature(`Madhya Pradesh ${crop} drought tolerance resilience`);
      setArticles(lRes.articles || []);
    } catch {
      console.warn('Failed to load drought literature');
    } finally {
      setIsLoadingArticles(false);
    }
  };

  useEffect(() => {
    loadData(selectedCrop);
  }, [selectedCrop]);

  return (
    <div className="bg-white rounded-lg border border-[#BCD4EC] p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E6EB] gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C81] text-white flex items-center justify-center shadow-xs">
            <Dna className="w-4 h-4 text-[#93C5FD]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#111827]">
                Crop Genomics & Agronomic Science Explorer
              </h3>
              <span className="text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                UniProtKB + Europe PMC
              </span>
            </div>
            <p className="text-xs text-[#64748B]">
              Molecular drought response pathways & peer-reviewed agronomic literature for Madhya Pradesh cropping systems
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-md text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('proteins')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'proteins'
                ? 'bg-white text-[#0F4C81] shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Proteins & Genes ({proteins.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('literature')}
            className={`px-3 py-1 rounded font-semibold transition-colors ${
              activeTab === 'literature'
                ? 'bg-white text-[#0F4C81] shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Scientific Literature ({articles.length})
          </button>
        </div>
      </div>

      {/* Crop Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold text-[#111827]">Select Crop System:</span>
        {mpCrops.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCrop(c.id)}
            className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              selectedCrop === c.id
                ? 'bg-[#0F4C81] text-white border-[#0F4C81] font-semibold'
                : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC]'
            }`}
          >
            {c.id}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeTab === 'proteins' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Showing verified molecular markers & aquaporins for <strong>{selectedCrop}</strong> from UniProt Knowledgebase:
            </span>
            <button
              type="button"
              onClick={() => loadData(selectedCrop)}
              className="text-[#0F4C81] hover:underline flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingProteins ? 'animate-spin' : ''}`} />
              <span>Refresh UniProt Stream</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {proteins.map((p, idx) => (
              <div
                key={p.accession || idx}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#0F4C81] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#0F4C81] bg-[#EEF4FA] px-1.5 py-0.5 rounded">
                      {p.gene || 'DREB/PIP'}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      Acc: {p.accession}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#111827] mt-1">
                    {p.proteinName}
                  </h4>
                  <p className="text-[10px] text-[#64748B] italic mb-2">
                    {p.organism} ({p.length} aa)
                  </p>

                  <p className="text-[11px] text-[#334155] leading-relaxed line-clamp-4">
                    {p.function}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
                  <span className="text-[#166534] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                    Osmotic Resistance
                  </span>
                  <a
                    href={p.uniprotLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#0F4C81] hover:underline font-semibold"
                  >
                    <span>UniProtKB</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>
              Recent peer-reviewed research papers from Europe PMC for <strong>{selectedCrop} in Madhya Pradesh</strong>:
            </span>
            <button
              type="button"
              onClick={() => loadData(selectedCrop)}
              className="text-[#0F4C81] hover:underline flex items-center gap-1 text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingArticles ? 'animate-spin' : ''}`} />
              <span>Refresh Literature</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {articles.map((art, idx) => (
              <div
                key={art.id || idx}
                className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-3.5 flex flex-col justify-between hover:border-[#0F4C81] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-1">
                    <span className="font-semibold text-[#0F4C81] truncate max-w-[200px]">
                      {art.journal} ({art.year})
                    </span>
                    <span className="font-mono">PMCID: {art.id}</span>
                  </div>

                  <h4 className="text-xs font-bold text-[#111827] line-clamp-2 mb-1">
                    {art.title}
                  </h4>
                  <p className="text-[10px] text-[#64748B] mb-2 truncate">
                    Authors: {art.author}
                  </p>

                  <p className="text-[11px] text-[#334155] leading-relaxed line-clamp-3">
                    {art.abstract}
                  </p>
                </div>

                <div className="pt-2.5 mt-2 border-t border-[#E2E8F0] flex items-center justify-end">
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#0F4C81] hover:underline font-semibold"
                  >
                    <span>Read Article on Europe PMC</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
