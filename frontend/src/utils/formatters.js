/**
 * Formatting and Utility Helpers
 */

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getScoreColor(score) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
  if (score >= 65) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
  if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
  return 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
}

export function getScoreBadge(score) {
  if (score >= 80) return { label: 'Excellent', color: '#10B981', bg: 'bg-emerald-500' };
  if (score >= 65) return { label: 'Good', color: '#3867F5', bg: 'bg-blue-600' };
  if (score >= 50) return { label: 'Needs Improvement', color: '#F59E0B', bg: 'bg-amber-500' };
  return { label: 'Weak ATS Compatibility', color: '#EF4444', bg: 'bg-rose-500' };
}

export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

