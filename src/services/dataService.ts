import { CivicIssue, PolicyScenario, FutureTrend, ImpactBeforeAfter } from '../types';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { storeUserFeedback } from './feedbackService';
import { createResolutionNotification } from './citizenNotificationService';

const STORAGE_KEY = 'govinsight_civic_issues_real_v4';

// Memory cache for issues
let memoryIssues: CivicIssue[] = [];
let isFirestoreSubscribed = false;

// Initialize realtime Firestore sync
export function initFirestoreSync() {
  if (isFirestoreSubscribed || typeof window === 'undefined') return;
  isFirestoreSubscribed = true;

  try {
    const issuesCollection = collection(db, 'issues');
    onSnapshot(
      issuesCollection,
      (snapshot) => {
        const remoteIssues: CivicIssue[] = [];
        snapshot.forEach((docSnap) => {
          remoteIssues.push(docSnap.data() as CivicIssue);
        });

        if (remoteIssues.length > 0) {
          remoteIssues.sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          memoryIssues = remoteIssues;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteIssues));
          } catch {}
          window.dispatchEvent(new Event('govinsight_issues_updated'));

          // Check if any modified doc became Resolved
          try {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'modified') {
                const data = change.doc.data() as CivicIssue;
                if (data && data.status === 'Resolved') {
                  const lastTimeline = data.timeline?.[data.timeline.length - 1];
                  createResolutionNotification(
                    data,
                    lastTimeline?.actor || 'Government Official',
                    lastTimeline?.note || 'Issue resolved and site verified.',
                    data.resolutionPhotoUrl
                  );
                }
              }
            });
          } catch {}
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'issues');
      }
    );
  } catch (err) {
    console.warn('Firestore subscription notice:', err);
  }
}

// Automatically initiate sync in client context
if (typeof window !== 'undefined') {
  initFirestoreSync();
}

export const INITIAL_SEEDED_ISSUES: CivicIssue[] = [];

export function getFutureTrends(issues: CivicIssue[] = getStoredIssues()): FutureTrend[] {
  if (issues.length === 0) return [];
  const catMap: Record<string, { count: number; criticalCount: number }> = {};
  issues.forEach((issue) => {
    const cat = issue.category || "General Civic Infrastructure";
    if (!catMap[cat]) catMap[cat] = { count: 0, criticalCount: 0 };
    catMap[cat].count += 1;
    if (issue.criticality === "CRITICAL" || issue.criticality === "HIGH") {
      catMap[cat].criticalCount += 1;
    }
  });

  return Object.entries(catMap).map(([category, stats]) => {
    const urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
      stats.criticalCount > 0 ? (stats.criticalCount > 2 ? "CRITICAL" : "HIGH") : "MEDIUM";
    return {
      category,
      currentCount: stats.count,
      previousCount: Math.max(0, stats.count - 1),
      growthRatePercent: stats.count > 1 ? Math.round((1 / (stats.count - 1)) * 100) : 0,
      risk30Days: "Active unresolved " + category.toLowerCase() + " issues impacting local movement.",
      risk6Months: "Corridor degradation without proactive municipal maintenance.",
      risk1Year: "Compounded asset replacement requirements.",
      urgencyLevel,
      forecastSummary: stats.count + " real grievances logged in this sector. " + stats.criticalCount + " marked high/critical priority.",
    };
  });
}

export function getImpactMetrics(issues: CivicIssue[] = getStoredIssues()): ImpactBeforeAfter[] {
  if (issues.length === 0) return [];
  const resolvedIssues = issues.filter((i) => i.status === "Resolved");
  const resolutionRate = issues.length > 0 ? Math.round((resolvedIssues.length / issues.length) * 100) : 0;
  const feedbackItems = issues.filter((i) => i.citizenFeedback);
  const avgRating = feedbackItems.length > 0
    ? (feedbackItems.reduce((acc, i) => acc + (i.citizenFeedback?.rating || 5), 0) / feedbackItems.length).toFixed(1)
    : "5.0";

  return [
    {
      metricName: "Civic Grievance Resolution Rate",
      category: "Municipal Action",
      beforeValue: issues.length + " Logged",
      afterValue: resolvedIssues.length + " Resolved",
      improvementPercentage: resolutionRate,
      description: resolvedIssues.length + " out of " + issues.length + " verified citizen issues have been completed by field crews.",
    },
    {
      metricName: "Citizen Verification Satisfaction",
      category: "Public Trust",
      beforeValue: "Pending",
      afterValue: avgRating + " / 5.0",
      improvementPercentage: Math.round(Number(avgRating) * 20),
      description: feedbackItems.length + " citizens have submitted verification ratings on resolved works.",
    },
  ];
}

export function getPolicyScenarios(issues: CivicIssue[] = getStoredIssues()): PolicyScenario[] {
  if (issues.length === 0) return [];
  const total = issues.length;
  const critical = issues.filter((i) => i.criticality === "CRITICAL").length;

  return [
    {
      id: "scenario-live-1",
      title: "Scenario: Immediate Triage of Critical Reports",
      focus: "Address the " + critical + " critical-priority issues immediately.",
      budgetAllocated: "District Municipal Fund",
      beneficiaries: total * 1200,
      gapReductionPercent: 78,
      accessibilityImprovement: 82,
      priorityRegionsAddressed: Math.max(1, new Set(issues.map((i) => i.location.district)).size),
      estimatedImpactScore: 88,
      aiRationale: "Targeting highest-criticality verified cases produces immediate safety improvements for commuters.",
      recommended: true,
    },
  ];
}

export const FUTURE_TRENDS: FutureTrend[] = [];
export const POLICY_SCENARIOS: PolicyScenario[] = [];
export const IMPACT_METRICS: ImpactBeforeAfter[] = [];

export function getStoredIssues(): CivicIssue[] {
  if (memoryIssues.length > 0) {
    return memoryIssues;
  }
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryIssues = parsed;
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function clearStoredIssues(): void {
  memoryIssues = [];
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('govinsight_issues_updated'));
  }
}

export function saveIssue(issue: CivicIssue): void {
  const issues = getStoredIssues();
  const index = issues.findIndex((i) => i.id === issue.id);
  if (index >= 0) {
    issues[index] = issue;
  } else {
    issues.unshift(issue);
  }
  memoryIssues = [...issues];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    window.dispatchEvent(new Event('govinsight_issues_updated'));
  } catch (e) {
    console.error('Failed to save issue to localStorage', e);
  }

  // Persist directly to Firebase Firestore
  const pathForWrite = `issues/${issue.id}`;
  try {
    const cleanData = JSON.parse(JSON.stringify(issue));
    setDoc(doc(db, 'issues', issue.id), cleanData, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, pathForWrite);
    });
  } catch (err) {
    console.warn('Firestore prepare doc notice:', err);
  }
}

export function updateIssueStatus(
  id: string,
  newStatus: CivicIssue['status'],
  actor: string,
  note: string,
  resolutionPhotoUrl?: string
): CivicIssue | undefined {
  const issues = getStoredIssues();
  const issue = issues.find((i) => i.id === id);
  if (!issue) return undefined;

  issue.status = newStatus;
  issue.updatedAt = new Date().toISOString();
  if (resolutionPhotoUrl) {
    issue.resolutionPhotoUrl = resolutionPhotoUrl;
  }
  issue.timeline.push({
    status: newStatus,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    actor,
    note,
  });

  saveIssue(issue);

  // If marked resolved, trigger automated citizen notification
  if (newStatus === 'Resolved') {
    try {
      createResolutionNotification(issue, actor, note, resolutionPhotoUrl);
    } catch (e) {
      console.warn('Citizen resolution notification error:', e);
    }
  }

  // Sync status update directly to Firestore
  const pathForUpdate = `issues/${id}`;
  try {
    const updatePayload: Record<string, any> = {
      status: newStatus,
      updatedAt: issue.updatedAt,
      timeline: issue.timeline,
    };
    if (resolutionPhotoUrl) {
      updatePayload.resolutionPhotoUrl = resolutionPhotoUrl;
    }
    updateDoc(doc(db, 'issues', id), updatePayload).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, pathForUpdate);
    });
  } catch (err) {
    console.warn('Firestore async status update error:', err);
  }

  return issue;
}

export function submitCitizenFeedback(
  id: string,
  resolved: boolean,
  rating: number,
  comment?: string
): CivicIssue | undefined {
  const issues = getStoredIssues();
  const issue = issues.find((i) => i.id === id);
  if (!issue) return undefined;

  issue.citizenFeedback = {
    resolved,
    rating,
    comment,
    timestamp: new Date().toISOString(),
  };

  saveIssue(issue);

  // Mirror to dedicated /feedback collection via feedbackService
  try {
    storeUserFeedback({
      userId: issue.userId || 'citizen_user',
      userName: `Citizen (${issue.location.city || 'Local'})`,
      userRole: 'citizen',
      category: 'resolution',
      rating,
      comment: comment || (resolved ? 'Grievance was marked as satisfactorily resolved.' : 'Follow-up requested by citizen.'),
      issueId: id,
      issueTitle: issue.title,
      resolved,
    }).catch((err) => {
      console.warn('Feedback service sync notice:', err);
    });
  } catch (err) {
    console.warn('Async feedback dispatch error:', err);
  }

  try {
    updateDoc(doc(db, 'issues', id), {
      citizenFeedback: issue.citizenFeedback,
    }).catch((err) => {
      console.warn('Firestore updateFeedback notice:', err);
    });
  } catch (err) {
    console.warn('Firestore async feedback update error:', err);
  }

  return issue;
}

/**
 * Refreshes live civic cases from Firestore
 */
export async function refreshIssuesFromFirestore(): Promise<number> {
  const issuesCollection = collection(db, 'issues');
  try {
    const snapshot = await getDocs(issuesCollection);
    const remoteIssues: CivicIssue[] = [];
    snapshot.forEach((docSnap) => {
      remoteIssues.push(docSnap.data() as CivicIssue);
    });
    if (remoteIssues.length > 0) {
      remoteIssues.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      memoryIssues = remoteIssues;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteIssues));
      } catch {}
      window.dispatchEvent(new Event('govinsight_issues_updated'));
    }
    return remoteIssues.length;
  } catch (err) {
    console.warn('Failed to refresh issues from Firestore:', err);
    return memoryIssues.length;
  }
}

export const seedInitialIssuesToFirestore = refreshIssuesFromFirestore;
