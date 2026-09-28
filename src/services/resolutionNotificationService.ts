import { CivicIssue } from '../types';

export interface ResolvedNotification {
  id: string;
  issueId: string;
  issueTitle: string;
  category: string;
  locationText: string;
  resolvedAt: string;
  resolvedBy: string;
  resolutionNotes?: string;
  beforePhotoUrl?: string;
  resolutionPhotoUrl?: string;
  isRead: boolean;
  ratingSubmitted?: boolean;
}

const NOTIFS_STORAGE_KEY = 'govinsight_citizen_resolved_notifs';
const STATUS_TRACKER_KEY = 'govinsight_last_tracked_issue_statuses';

/**
 * Plays an uplifting 3-tone chime (F#5, A5, C#6) using Web Audio API
 * to notify citizens when an issue has been successfully resolved by officials.
 */
export function playResolutionChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Notes: F#5 (739.99Hz), A5 (880Hz), C#6 (1108.73Hz)
    const notes = [
      { freq: 739.99, start: 0.0, duration: 0.18 },
      { freq: 880.0, start: 0.12, duration: 0.22 },
      { freq: 1108.73, start: 0.24, duration: 0.45 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1200);
  } catch (e) {
    // Non-blocking if audio blocked by autoplay policies
    console.debug('Notification chime notice:', e);
  }
}

/**
 * Retrieves all stored resolution notifications
 */
export function getResolvedNotifications(): ResolvedNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves notifications list to localStorage
 */
function saveNotifications(notifications: ResolvedNotification[]): void {
  try {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event('govinsight_resolution_notifs_updated'));
  } catch (err) {
    console.warn('Failed to save resolution notifications:', err);
  }
}

/**
 * Marks a specific notification as read
 */
export function markNotificationAsRead(id: string): void {
  const current = getResolvedNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveNotifications(updated);
}

/**
 * Marks all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  const current = getResolvedNotifications();
  const updated = current.map((n) => ({ ...n, isRead: true }));
  saveNotifications(updated);
}

/**
 * Removes a notification from the list
 */
export function clearResolvedNotification(id: string): void {
  const current = getResolvedNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveNotifications(updated);
}

/**
 * Clears all notification history
 */
export function clearAllResolutionNotifications(): void {
  saveNotifications([]);
}

/**
 * Evaluates live issues and detects if any issue has recently transitioned
 * to 'Resolved'. If so, automatically adds to notification list and triggers alert.
 */
export function processIssuesForResolutionAlerts(
  issues: CivicIssue[],
  citizenUserId?: string
): ResolvedNotification | null {
  if (typeof window === 'undefined' || !Array.isArray(issues) || issues.length === 0) {
    return null;
  }

  let statusMap: Record<string, string> = {};
  try {
    const rawMap = localStorage.getItem(STATUS_TRACKER_KEY);
    if (rawMap) statusMap = JSON.parse(rawMap);
  } catch {}

  const currentNotifs = getResolvedNotifications();
  let latestAlert: ResolvedNotification | null = null;
  let hasNew = false;

  for (const issue of issues) {
    const previousStatus = statusMap[issue.id];
    const isNowResolved = issue.status === 'Resolved';
    const alreadyNotified = currentNotifs.some((n) => n.issueId === issue.id);

    // If newly transitioned to Resolved OR resolved without prior notification
    if (isNowResolved && (previousStatus !== 'Resolved' || !alreadyNotified)) {
      // Find actor from latest timeline event or issue attributes
      const lastEvent = issue.timeline && issue.timeline.length > 0
        ? issue.timeline[issue.timeline.length - 1]
        : null;

      const resolvedBy = lastEvent?.actor || issue.assignedOfficer || 'Authorized Field Official';
      const resolutionNotes = lastEvent?.note || 'Site cleared and defect repaired by authorized municipal crew.';

      const newNotif: ResolvedNotification = {
        id: `notif_${issue.id}_${Date.now()}`,
        issueId: issue.id,
        issueTitle: issue.title,
        category: issue.category,
        locationText: `${issue.location?.address || ''}, ${issue.location?.city || ''}`.replace(/^, /, ''),
        resolvedAt: issue.updatedAt || new Date().toISOString(),
        resolvedBy,
        resolutionNotes,
        beforePhotoUrl: issue.photoUrl,
        resolutionPhotoUrl: issue.resolutionPhotoUrl,
        isRead: false,
        ratingSubmitted: !!issue.citizenFeedback,
      };

      currentNotifs.unshift(newNotif);
      latestAlert = newNotif;
      hasNew = true;

      // Dispatch real-time custom event
      window.dispatchEvent(
        new CustomEvent('govinsight_new_resolution_alert', {
          detail: newNotif,
        })
      );

      // Play audio chime
      playResolutionChime();

      // Trigger Web Notification API if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('GovInsight: Grievance Resolved!', {
            body: `Case ${issue.id} marked as CLEARED: "${issue.title}". Inspect the repair proof.`,
            icon: issue.resolutionPhotoUrl || issue.photoUrl || '/favicon.ico',
          });
        } catch {}
      }
    }

    // Update tracked status
    statusMap[issue.id] = issue.status;
  }

  // Update localStorage status tracker
  try {
    localStorage.setItem(STATUS_TRACKER_KEY, JSON.stringify(statusMap));
  } catch {}

  if (hasNew) {
    saveNotifications(currentNotifs);
  }

  return latestAlert;
}

/**
 * Subscribes to resolution notification changes
 */
export function subscribeToResolutionNotifications(
  callback: (notifications: ResolvedNotification[], latestAlert: ResolvedNotification | null) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUpdate = () => {
    callback(getResolvedNotifications(), null);
  };

  const handleNewAlert = (e: any) => {
    callback(getResolvedNotifications(), e.detail || null);
  };

  window.addEventListener('govinsight_resolution_notifs_updated', handleUpdate);
  window.addEventListener('govinsight_new_resolution_alert', handleNewAlert);

  // Initial callback
  callback(getResolvedNotifications(), null);

  return () => {
    window.removeEventListener('govinsight_resolution_notifs_updated', handleUpdate);
    window.removeEventListener('govinsight_new_resolution_alert', handleNewAlert);
  };
}
