import React, { useState } from 'react';
import { GovernmentPolicy } from '../../types';
import {
  X,
  Bell,
  ShieldAlert,
  MapPin,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Radio,
  CheckCheck,
} from 'lucide-react';
import {
  markPolicyAsRead,
  markAllPoliciesAsRead,
  simulateAreaPolicyAlert,
} from '../../services/policyService';

interface PolicyAlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  policies: GovernmentPolicy[];
  userLocation: { country?: string; state?: string; district?: string };
  onPolicySelected?: (policy: GovernmentPolicy) => void;
}

export const PolicyAlertsDrawer: React.FC<PolicyAlertsDrawerProps> = ({
  isOpen,
  onClose,
  policies,
  userLocation,
  onPolicySelected,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'urgent' | 'district' | 'state'>('all');
  const [expandedPolicyId, setExpandedPolicyId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string>('');

  if (!isOpen) return null;

  const userDistrict = userLocation.district || 'Chennai';
  const userState = userLocation.state || 'Tamil Nadu';

  // Filter policies based on active tab
  const filteredPolicies = policies.filter((p) => {
    if (filterTab === 'urgent') return p.priority === 'URGENT';
    if (filterTab === 'district') return p.scope === 'district';
    if (filterTab === 'state') return p.scope === 'state' || p.scope === 'national';
    return true;
  });

  const unreadCount = policies.filter((p) => !p.isRead).length;

  const handleSimulateNewAlert = async () => {
    setIsSimulating(true);
    setSimulationNotice('');
    try {
      const simulated = await simulateAreaPolicyAlert(userDistrict, userState);
      setSimulationNotice(`✓ Published: "${simulated.title.slice(0, 45)}..." in real-time Firestore!`);
      setTimeout(() => setSimulationNotice(''), 4500);
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleMarkAllRead = () => {
    markAllPoliciesAsRead(policies.map((p) => p.id));
  };

  const toggleExpand = (policy: GovernmentPolicy) => {
    setExpandedPolicyId((prev) => (prev === policy.id ? null : policy.id));
    markPolicyAsRead(policy.id);
    onPolicySelected?.(policy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#090b12] border border-red-500/30 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center relative shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black font-mono flex items-center justify-center border-2 border-slate-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Government Policy & Area Alerts
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-ping text-emerald-400" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>
                  Jurisdiction: <strong className="text-slate-200">{userDistrict}, {userState}</strong>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Mark all alerts as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-600/20 text-slate-400 hover:text-white transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Simulation Notice Bar */}
        <div className="px-5 py-2.5 bg-black/60 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Testing real-time notification push?</span>
            <button
              onClick={handleSimulateNewAlert}
              disabled={isSimulating}
              className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-[11px] font-bold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            >
              <Sparkles className="w-3 h-3 text-red-400" />
              <span>{isSimulating ? 'Publishing Alert...' : 'Simulate New Policy Publish'}</span>
            </button>
          </div>

          {simulationNotice && (
            <span className="text-[11px] font-mono text-emerald-400 font-semibold animate-fade-in">
              {simulationNotice}
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto border-b border-white/5 bg-[#0b0e17]">
          {[
            { id: 'all', label: `All Alerts (${policies.length})` },
            {
              id: 'urgent',
              label: `Urgent Directives (${policies.filter((p) => p.priority === 'URGENT').length})`,
            },
            {
              id: 'district',
              label: `${userDistrict} District (${policies.filter((p) => p.scope === 'district').length})`,
            },
            {
              id: 'state',
              label: `State & National (${policies.filter((p) => p.scope !== 'district').length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Policy Cards List */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {filteredPolicies.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Building2 className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No policies found for this filter criteria.</p>
            </div>
          ) : (
            filteredPolicies.map((policy) => {
              const isExpanded = expandedPolicyId === policy.id;
              const isUrgent = policy.priority === 'URGENT';
              const isHigh = policy.priority === 'HIGH';

              return (
                <div
                  key={policy.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'bg-gradient-to-r from-red-950/40 via-black to-slate-950 border-red-500/40 hover:border-red-500/70'
                      : 'bg-black/50 border-white/10 hover:border-white/20'
                  } ${!policy.isRead ? 'ring-1 ring-red-500/50' : ''}`}
                >
                  {/* Top Policy Metadata Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider ${
                            isUrgent
                              ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {policy.priority}
                        </span>

                        {/* Scope */}
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400 capitalize">
                          {policy.scope} Scope
                        </span>

                        {/* Unread indicator */}
                        {!policy.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="Unread alert" />
                        )}

                        {policy.gazetteRef && (
                          <span className="text-[10px] font-mono text-slate-500">
                            Ref: {policy.gazetteRef}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-extrabold text-white pt-1">
                        {policy.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span className="font-semibold text-slate-300">{policy.department}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span>
                            {policy.affectedDistrict ? `${policy.affectedDistrict}, ` : ''}
                            {policy.affectedState}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">
                          {new Date(policy.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(policy)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand full directive'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Executive Summary */}
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {policy.summary}
                  </p>

                  {/* Citizen Action Callout Box */}
                  {policy.actionRequiredForCitizen && (
                    <div className="mt-3 p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-300 block mb-0.5">
                          Action Required for Residents:
                        </span>
                        <span className="text-slate-200 text-[11px] leading-relaxed">
                          {policy.actionRequiredForCitizen}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Affected Neighborhoods / Wards */}
                  {policy.affectedAreas && policy.affectedAreas.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px]">
                      <span className="text-slate-500 font-mono text-[10px]">Affects Wards:</span>
                      {policy.affectedAreas.map((area) => (
                        <span
                          key={area}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Expanded Full Gazette Directive */}
                  {isExpanded && policy.fullContent && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2 animate-fade-in text-xs">
                      <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                        <span>Full Gazette Text & Directives</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-[11px] bg-black/40 p-3.5 rounded-xl border border-white/5 whitespace-pre-line">
                        {policy.fullContent}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[10px] font-mono">
            Directives broadcasted via official Municipal & State Gazette channels.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
