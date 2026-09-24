import React, { useState, useEffect } from 'react';
import {
  CivicIssue,
  SupportedLanguage,
  CountryProfile,
  PolicyScenario,
  FutureTrend,
  ImpactBeforeAfter,
  CaseStatus,
} from '../../types';
import { t } from '../../services/i18n';
import {
  getStoredIssues,
  updateIssueStatus,
  POLICY_SCENARIOS,
  FUTURE_TRENDS,
  IMPACT_METRICS,
} from '../../services/dataService';
import { GlobalMap } from '../common/GlobalMap';
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Users,
  MapPin,
  Sparkles,
  Search,
  Filter,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  FileCheck,
  Send,
  Eye,
  Camera,
  Volume2,
  VolumeX,
  X,
  Lock,
  Unlock,
  Shield,
  HelpCircle,
} from 'lucide-react';
import {
  translateReport,
  speakCivicText,
  stopSpeaking,
  SPEECH_LOCALES,
  TranslatedCivicReport,
} from '../../services/multilingualVoiceService';

interface GovernmentDashboardProps {
  currentLanguage: SupportedLanguage;
  currentCountry: CountryProfile;
  onOpenResponsibleAi: () => void;
  onSwitchToCitizen: () => void;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({
  currentLanguage,
  currentCountry,
  onOpenResponsibleAi,
  onSwitchToCitizen,
}) => {
  // Official Auth simulation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [officialName, setOfficialName] = useState('Dr. Rajesh Sundaram');
  const [officialRole, setOfficialRole] = useState('Executive Infrastructure Director');
  const [officialBadge, setOfficialBadge] = useState('GI-OFFICIAL-8492');

  // Navigation
  const [govTab, setGovTab] = useState<
    'overview' | 'cases' | 'map' | 'recommendations' | 'policy' | 'trends' | 'impact' | 'departments'
  >('overview');

  // Issues and filtering
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<CivicIssue | null>(null);

  // Multilingual voice translation engine state
  const [listenLanguage, setListenLanguage] = useState<string>('ta');
  const [translatedCase, setTranslatedCase] = useState<TranslatedCivicReport | null>(null);
  const [isVoicePlaying, setIsVoicePlaying] = useState<boolean>(false);

  const handleSelectCase = (issue: CivicIssue) => {
    stopSpeaking();
    setIsVoicePlaying(false);
    setSelectedCase(issue);
    const initialLang = 'ta';
    setListenLanguage(initialLang);
    const trans = translateReport(
      {
        title: issue.title,
        description: issue.description,
        locationText: `${issue.location.address}, ${issue.location.city}`,
        category: issue.category,
        criticality: issue.criticality,
        status: issue.status,
        aiSummary: issue.aiSummary,
      },
      initialLang
    );
    setTranslatedCase(trans);
  };

  const handleLanguageVoiceSwitch = (langCode: string) => {
    if (!selectedCase) return;
    setListenLanguage(langCode);
    const trans = translateReport(
      {
        title: selectedCase.title,
        description: selectedCase.description,
        locationText: `${selectedCase.location.address}, ${selectedCase.location.city}`,
        category: selectedCase.category,
        criticality: selectedCase.criticality,
        status: selectedCase.status,
        aiSummary: selectedCase.aiSummary,
      },
      langCode
    );
    setTranslatedCase(trans);

    speakCivicText({
      text: trans.aiVoiceScript,
      langCode,
      onStart: () => setIsVoicePlaying(true),
      onEnd: () => setIsVoicePlaying(false),
      onError: () => setIsVoicePlaying(false),
    });
  };

  const handleStopVoice = () => {
    stopSpeaking();
    setIsVoicePlaying(false);
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Policy Simulator state
  const [budgetSlider, setBudgetSlider] = useState<number>(12); // $12M / ₹100 Cr
  const [selectedScenario, setSelectedScenario] = useState<PolicyScenario>(POLICY_SCENARIOS[2]);

  // Action modal note state
  const [actionNote, setActionNote] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');

  const refreshIssues = () => {
    const list = getStoredIssues();
    setIssues(list);
    if (selectedCase) {
      const updated = list.find((i) => i.id === selectedCase.id);
      if (updated) setSelectedCase(updated);
    }
  };

  useEffect(() => {
    refreshIssues();
    const handleUpdate = () => refreshIssues();
    window.addEventListener('govinsight_issues_updated', handleUpdate);
    return () => window.removeEventListener('govinsight_issues_updated', handleUpdate);
  }, []);

  // KPIs
  const totalReports = issues.length;
  const criticalCases = issues.filter((i) => i.criticality === 'CRITICAL').length;
  const highCases = issues.filter((i) => i.criticality === 'HIGH').length;
  const mediumCases = issues.filter((i) => i.criticality === 'MEDIUM').length;
  const inProgressCases = issues.filter((i) => i.status === 'Action In Progress' || i.status === 'Assigned').length;
  const resolvedCases = issues.filter((i) => i.status === 'Resolved').length;
  const totalBeneficiaries = issues.reduce((acc, i) => acc + (i.affectedPopulationEstimate || 0), 0);

  // Handle Action state change
  const handleUpdateStatus = (newStatus: CaseStatus) => {
    if (!selectedCase) return;
    const note = actionNote || `Status transitioned to ${newStatus} by ${officialName} (${officialRole})`;
    const updated = updateIssueStatus(
      selectedCase.id,
      newStatus,
      `${officialName} [${officialBadge}]`,
      note,
      newStatus === 'Resolved'
        ? 'https://images.unsplash.com/photo-1578961952402-f6f8e763137e?auto=format&fit=crop&w=800&q=80'
        : undefined
    );
    if (updated) {
      setSelectedCase(updated);
      setActionNote('');
      refreshIssues();
    }
  };

  const filteredIssues = issues.filter((i) => {
    if (filterCriticality !== 'all' && i.criticality !== filterCriticality) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterDepartment !== 'all' && !i.assignedDepartment?.includes(filterDepartment)) return false;
    if (
      searchQuery &&
      !i.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !i.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !i.location.city.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#06070a] text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Government Official HUD Bar */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-red-500/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-white tracking-wide">
                  GOVINSIGHT CIVIC COMMAND & ACTION DESK
                </span>
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold">
                  {currentCountry.name} DIVISION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorized Official: <strong className="text-slate-200">{officialName}</strong> ({officialRole}) • Badge: <span className="font-mono text-red-400">{officialBadge}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenResponsibleAi}
              className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-red-400" />
              <span>Responsible AI Support</span>
            </button>
            <button
              onClick={onSwitchToCitizen}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
            >
              Switch to Citizen View
            </button>
          </div>
        </div>

        {/* Government Sub-Navigation */}
        <div className="flex items-center gap-1 p-1 bg-black/60 rounded-2xl border border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: t('govOverview', currentLanguage.code), icon: Activity },
            { id: 'cases', label: `${t('govLiveCases', currentLanguage.code)} (${issues.length})`, icon: ShieldAlert },
            { id: 'map', label: t('govPriorityMap', currentLanguage.code), icon: MapPin },
            { id: 'policy', label: t('govPolicySim', currentLanguage.code), icon: Sliders },
            { id: 'trends', label: t('govFutureTrend', currentLanguage.code), icon: TrendingUp },
            { id: 'impact', label: t('govImpact', currentLanguage.code), icon: CheckCircle2 },
            { id: 'recommendations', label: t('govRecommend', currentLanguage.code), icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = govTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setGovTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW (Section 19 in brief) */}
        {govTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">{t('totalReports', currentLanguage.code)}</span>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">{totalReports}</div>
                <div className="text-[10px] text-red-400 mt-1">Multi-modal Citizen Evidence</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="text-[10px] text-red-400 font-mono uppercase block">{t('criticalCases', currentLanguage.code)}</span>
                <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono mt-1">{criticalCases}</div>
                <div className="text-[10px] text-red-400 mt-1">Emergency Hospital/School</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-amber-400 font-mono uppercase block">High Priority</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">{highCases}</div>
                <div className="text-[10px] text-slate-400 mt-1">Water & Sanitation Outages</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-blue-400 font-mono uppercase block">{t('inProgress', currentLanguage.code)}</span>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono mt-1">{inProgressCases}</div>
                <div className="text-[10px] text-slate-400 mt-1">Field Crews Mobilized</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 font-mono uppercase block">{t('resolved', currentLanguage.code)}</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">{resolvedCases}</div>
                <div className="text-[10px] text-emerald-400 mt-1">100% Citizen Verified</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                <span className="text-[10px] text-purple-400 font-mono uppercase block">{t('beneficiaries', currentLanguage.code)}</span>
                <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-1">
                  {(totalBeneficiaries / 1000).toFixed(0)}K
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Population Exposure</div>
              </div>
            </div>

            {/* Quick Priority Heatmap Preview & Live Critical Incident Alert */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>Global Civic Priority Heatmap</span>
                  </h3>
                  <button
                    onClick={() => setGovTab('map')}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
                  >
                    <span>Full Map Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <GlobalMap
                  issues={issues}
                  selectedIssue={selectedCase}
                  onSelectIssue={(i) => {
                    setSelectedCase(i);
                    setGovTab('cases');
                  }}
                  heightClass="h-80"
                />
              </div>

              {/* Unheard Community Detector Spotlight (Section 12 in brief) */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Unheard Community Detector</span>
                </h3>

                <div className="p-5 rounded-3xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400/50 text-[10px] font-mono font-bold">
                      LOW COMPLAINTS ≠ LOW NEED
                    </span>
                  </div>

                  <p className="text-xs text-cyan-100 leading-relaxed">
                    “Only 14 reports were received from this peripheral district, but demographic and satellite indicators identify a 78% baseline infrastructure deficit.”
                  </p>

                  <div className="p-3 rounded-xl bg-black/60 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Area:</span>
                      <span className="font-semibold text-white">Soweto / Zona Leste Sub-corridor</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Population Vulnerability:</span>
                      <span className="font-mono text-cyan-400 font-bold">HIGH (92%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">AI Recommendation:</span>
                      <span className="text-slate-200">Deploy proactive municipal water line inspection team.</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const underRep = issues.find((i) => i.isUnderRepresentedArea);
                      if (underRep) {
                        setSelectedCase(underRep);
                        setGovTab('cases');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-xs font-bold text-cyan-200 transition-colors"
                  >
                    Inspect Under-Represented Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CASES MANAGEMENT (Section 21 in brief) */}
        {govTab === 'cases' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search case ID, street, or description..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterCriticality}
                  onChange={(e) => setFilterCriticality(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">All Criticality</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="AI Analyzed">AI Analyzed</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Action In Progress">Action In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Cases Grid & Detailed Inspection Modal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cases List */}
              <div className="lg:col-span-1 space-y-3">
                {filteredIssues.map((issue) => {
                  const isSelected = selectedCase?.id === issue.id;
                  return (
                    <div
                      key={issue.id}
                      onClick={() => handleSelectCase(issue)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-slate-900 border-red-500/90 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                          : 'bg-black/50 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-red-400">{issue.id}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              issue.criticality === 'CRITICAL'
                                ? 'bg-red-950 text-red-400 border border-red-800'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {issue.criticality}
                          </span>
                          <span className="font-mono text-white text-xs font-bold">
                            {issue.priorityScore}/100
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1">{issue.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{issue.aiSummary}</p>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                        <span>📍 {issue.location.city}</span>
                        <span className="font-semibold text-emerald-400">{issue.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DETAILED GOVERNMENT CASE VIEW & ACTION CONTROLS (Section 21) */}
              <div className="lg:col-span-2">
                {selectedCase ? (
                  <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-500/40 shadow-2xl space-y-6">
                    {/* Header with Close Cross Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-red-400 font-bold">{selectedCase.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-xs font-black ${
                              selectedCase.criticality === 'CRITICAL'
                                ? 'bg-red-600 text-white'
                                : 'bg-amber-500 text-black'
                            }`}
                          >
                            {selectedCase.criticality}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Priority Score: <strong className="text-white">{selectedCase.priorityScore}/100</strong>
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-white mt-1">{selectedCase.title}</h3>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Current Status:</span>
                          <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold inline-block mt-0.5">
                            {selectedCase.status}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            stopSpeaking();
                            setIsVoicePlaying(false);
                            setSelectedCase(null);
                          }}
                          className="p-2 rounded-xl bg-white/10 hover:bg-red-600/80 border border-white/15 text-slate-300 hover:text-white transition-all shadow-md"
                          title="Close Case View"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* UNIVERSAL CROSS-LANGUAGE AUDIO DISPATCH & TRANSLATION ENGINE */}
                    <div className="p-5 rounded-2xl bg-black/70 border border-red-500/40 shadow-lg space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-red-400" />
                          <div>
                            <h4 className="text-sm font-black text-white">
                              Multilingual Voice & Cross-Translation Dispatch
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Choose target language to translate and immediately listen in native voice
                            </p>
                          </div>
                        </div>

                        {/* Speech controller */}
                        {isVoicePlaying && (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-bold animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              Speaking ({listenLanguage.toUpperCase()})...
                            </span>
                            <button
                              onClick={handleStopVoice}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Stop</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Language Selection Buttons */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block mb-2">
                          Select Listening / Target Language:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
                            { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
                            { code: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
                            { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
                            { code: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
                            { code: 'en', label: 'English (US)', flag: '🇺🇸' },
                            { code: 'en-gb', label: 'English (UK)', flag: '🇬🇧' },
                            { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
                            { code: 'pt', label: 'Português', flag: '🇧🇷' },
                            { code: 'ru', label: 'Русский', flag: '🇷🇺' },
                            { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
                          ].map((l) => {
                            const isCurrent = listenLanguage === l.code;
                            return (
                              <button
                                key={l.code}
                                onClick={() => handleLanguageVoiceSwitch(l.code)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                  isCurrent
                                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105'
                                    : 'bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                              >
                                <span>{l.flag}</span>
                                <span>{l.label}</span>
                                {isCurrent && isVoicePlaying && (
                                  <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Translated Case Card with Voice Dispatch Text */}
                      {translatedCase && (
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-red-400 font-bold">
                              Translated in: {translatedCase.targetLanguageName} ({translatedCase.targetLanguageCode.toUpperCase()})
                            </span>
                            <button
                              onClick={() => handleLanguageVoiceSwitch(listenLanguage)}
                              className="px-3 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-xs font-bold text-red-200 flex items-center gap-1.5 transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-red-400" />
                              <span>Replay Voice in {listenLanguage.toUpperCase()}</span>
                            </button>
                          </div>

                          <div className="text-sm font-bold text-white">
                            {translatedCase.title}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {translatedCase.description}
                          </p>

                          <div className="pt-2 border-t border-white/10 text-xs flex flex-wrap gap-3 text-slate-400">
                            <div>📍 <span className="text-white">{translatedCase.locationText}</span></div>
                            <div>Status: <span className="text-emerald-400 font-semibold">{translatedCase.officialStatus}</span></div>
                            <div>Category: <span className="text-white">{translatedCase.category}</span></div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 text-[11px] text-slate-300">
                            <span className="font-mono text-red-400 block font-semibold mb-0.5">Spoken AI Voice Dispatch Script:</span>
                            "{translatedCase.aiVoiceScript}"
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Citizen Request & Multilingual Transcription */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-1.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                          Original Citizen Submission ({selectedCase.originalLanguage}):
                        </span>
                        <p className="text-slate-200 leading-relaxed font-medium">
                          {selectedCase.transcription || selectedCase.description}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 space-y-1.5">
                        <span className="text-[10px] font-mono text-red-400 uppercase font-bold block">
                          AI Structured Summary:
                        </span>
                        <p className="text-slate-200 leading-relaxed">
                          {selectedCase.aiSummary}
                        </p>
                        <span className="text-[10px] text-slate-400 block pt-1 border-t border-white/10">
                          Category: <strong>{selectedCase.category}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Photo Evidence & AI Vision Analysis */}
                    {selectedCase.photoUrl && (
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-red-400" />
                            <span>Photographic Damage Evidence</span>
                          </span>
                          {selectedCase.photoAnalysis && (
                            <span className="text-[10px] font-mono text-emerald-400">
                              AI Confidence: {selectedCase.photoAnalysis.confidence}%
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                            <img
                              src={selectedCase.photoUrl}
                              alt="Damage Evidence"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {selectedCase.photoAnalysis && (
                            <div className="flex-1 text-xs space-y-1 text-slate-300">
                              <div>Detected: <strong className="text-white">{selectedCase.photoAnalysis.detectedObject}</strong></div>
                              <div>Severity: <strong className="text-red-400">{selectedCase.photoAnalysis.severity}</strong></div>
                              <p className="text-slate-400 text-[11px] pt-1 border-t border-white/10">
                                {selectedCase.photoAnalysis.details}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location & GPS */}
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>Incident Geolocation: {selectedCase.location.address}</span>
                        </span>
                        <span className="font-mono text-red-400 text-[11px]">
                          {selectedCase.location.lat.toFixed(4)}°, {selectedCase.location.lng.toFixed(4)}°
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Jurisdiction: {selectedCase.location.city}, {selectedCase.location.country}</span>
                        <span>Population Exposure: <strong className="text-white">{selectedCase.affectedPopulationEstimate.toLocaleString()} citizens</strong></span>
                      </div>
                    </div>

                    {/* Explanatory Why & Priority Score Breakdown */}
                    <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        AI Reasoning & Transparency
                      </span>
                      <div className="space-y-1 text-xs">
                        {selectedCase.criticalityReasons.map((r, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-slate-300">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACTION CONTROLS BUTTONS (Section 21) */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-red-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                          Official Decision & Field Action
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Authorized Official Review Required
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <button
                          onClick={() => handleUpdateStatus('Under Review')}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200"
                        >
                          [ ACCEPT ]
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('Assigned')}
                          className="p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-xs font-bold text-blue-200"
                        >
                          [ ASSIGN ]
                        </button>
                        <button
                          onClick={() => alert('Information request notification dispatched to citizen mobile.')}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200"
                        >
                          [ REQUEST INFO ]
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('Action In Progress')}
                          className="p-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-xs font-bold text-amber-200"
                        >
                          [ START ACTION ]
                        </button>
                        <button
                          onClick={() => handleUpdateStatus('Resolved')}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
                        >
                          [ MARK RESOLVED ]
                        </button>
                      </div>

                      <input
                        type="text"
                        value={actionNote}
                        onChange={(e) => setActionNote(e.target.value)}
                        placeholder="Add official resolution log / engineering work order note..."
                        className="w-full p-2.5 rounded-xl bg-black/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-slate-900/40 border border-white/5 text-center text-slate-500">
                    Select a case from the list to view government command view
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRIORITY MAP (Section 20 in brief) */}
        {govTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">Global Geographic Hotspot Explorer</h3>
                <p className="text-xs text-slate-400">
                  Interactive multi-layer geospatial intelligence across global civic jurisdictions.
                </p>
              </div>
            </div>

            <GlobalMap
              issues={issues}
              selectedIssue={selectedCase}
              onSelectIssue={(i) => {
                setSelectedCase(i);
                setGovTab('cases');
              }}
              heightClass="h-[520px]"
            />
          </div>
        )}

        {/* TAB 4: POLICY & BUDGET SIMULATOR (Section 24 in brief) */}
        {govTab === 'policy' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider">
                  AI Decision Support & Capital Allocation
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Policy & Budget Simulator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test and compare municipal investment scenarios against real civic demand.
                </p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/40 text-xs font-mono text-red-300">
                AI ESTIMATE / DEMO SIMULATION
              </div>
            </div>

            {/* Budget Slider */}
            <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">Available Infrastructure Budget:</span>
                <span className="text-xl font-mono font-black text-red-400">
                  ${budgetSlider} Million (~₹{(budgetSlider * 8.3).toFixed(0)} Crore)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={budgetSlider}
                onChange={(e) => setBudgetSlider(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$5M Minimum</span>
                <span>$25M Medium</span>
                <span>$50M Major Capital Plan</span>
              </div>
            </div>

            {/* 3 Scenarios Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {POLICY_SCENARIOS.map((scenario) => {
                const isSelected = selectedScenario.id === scenario.id;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-950 border-red-500/90 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                        : 'bg-black/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{scenario.title}</span>
                        {scenario.recommended && (
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/50 text-[9px] font-bold">
                            AI RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{scenario.focus}</p>

                      {/* Scenario Metrics */}
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Beneficiaries:</span>
                          <span className="font-mono font-bold text-white">
                            {scenario.beneficiaries.toLocaleString()} citizens
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gap Reduction:</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            {scenario.gapReductionPercent}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Accessibility Gain:</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            +{scenario.accessibilityImprovement}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Composite Impact:</span>
                          <span className="font-mono text-red-400 font-bold">
                            {scenario.estimatedImpactScore} / 100
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 italic">
                      "{scenario.aiRationale}"
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Recommendation Summary */}
            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 text-xs text-red-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">AI Policy Recommendation: </strong>
                “Scenario C delivers the highest combined civic ROI across all tested metrics: addresses 23 priority regions, removes 86% of baseline infrastructure deficits, and covers 520,000+ vulnerable citizens.”
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FUTURE TREND PREDICTION (Section 25 in brief) */}
        {govTab === 'trends' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-white">Future Trend & Risk Predictions</h3>
              <p className="text-xs text-slate-400">
                Machine learning forecast predicting complaint velocity and structural infrastructure degradation risk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FUTURE_TRENDS.map((trend, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{trend.category}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        trend.urgencyLevel === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {trend.urgencyLevel}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/60 border border-white/10">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-black text-white">{trend.currentCount}</span>
                      <span className="text-xs font-mono font-bold text-red-400">
                        +{trend.growthRatePercent}% vs last period
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Active citizen complaints</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">30-Day Risk:</span>
                      <p className="text-slate-300">{trend.risk30Days}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">6-Month Forecast:</span>
                      <p className="text-slate-300">{trend.risk6Months}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">1-Year Without Intervention:</span>
                      <p className="text-red-300">{trend.risk1Year}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 italic">
                    {trend.forecastSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: IMPACT ANALYTICS (Section 26 in brief) */}
        {govTab === 'impact' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-white">Before vs After Civic Impact</h3>
                <p className="text-xs text-slate-400">
                  Empirical verification of government action effectiveness and public satisfaction.
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-red-950 border border-red-500/40 font-mono text-xs text-red-400 font-bold">
                Overall Civic Impact Score: 89 / 100
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IMPACT_METRICS.map((metric, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{metric.metricName}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                      +{metric.improvementPercentage}% Improvement
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-center">
                      <span className="text-[10px] font-mono text-slate-400 block">BEFORE FIX</span>
                      <span className="text-lg font-mono font-bold text-red-400">{metric.beforeValue}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/60 border border-emerald-500/40 text-center">
                      <span className="text-[10px] font-mono text-emerald-400 block">AFTER ACTION</span>
                      <span className="text-lg font-mono font-bold text-emerald-400">{metric.afterValue}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {metric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: AI CAPITAL RECOMMENDATIONS (Section 23 in brief) */}
        {govTab === 'recommendations' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-extrabold text-white">AI Infrastructure Capital Proposals</h3>
              <p className="text-xs text-slate-400">
                Systemic infrastructure investments generated by clustering high-priority civic incident corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-red-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">PROJECT #1: ARTERIAL EMERGENCY HEALTHCARE CORRIDOR</span>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 text-[10px] font-bold">
                    CRITICAL PRIORITY
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Comprehensive 6.8km road resurfacing, elevated storm drainage culverts, and dedicated emergency ambulance priority lanes connecting District Hospital.
                </p>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Beneficiaries:</span>
                    <span className="font-mono text-white font-bold">65,000 citizens / day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Emergency Delay Reduction:</span>
                    <span className="font-mono text-emerald-400 font-bold">-71% (20.2 mins saved)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supporting Evidence:</span>
                    <span className="text-slate-300">27 merged citizen reports + photo analysis</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">PROJECT #2: PERIPHERAL TRUNK WATER MAIN UPGRADE</span>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 text-[10px] font-bold">
                    HIGH PRIORITY
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Replacement of 12.4km aging asbestos-cement water conduits with ductile iron pipeline and automated leak detection acoustic nodes.
                </p>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Beneficiaries:</span>
                    <span className="font-mono text-white font-bold">48,000 low-income residents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Water Loss Prevention:</span>
                    <span className="font-mono text-emerald-400 font-bold">140,000 Liters / day saved</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Supporting Evidence:</span>
                    <span className="text-slate-300">Unheard Community Detector flag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
