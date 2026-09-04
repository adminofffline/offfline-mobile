export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]+/g, '')) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatTimeOnly(timeStr?: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',');
    return parts[parts.length - 1].trim();
  }
  if (trimmed.includes('T')) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  const timeMatch = trimmed.match(/\b(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\b/);
  if (timeMatch) {
    return timeMatch[0].trim();
  }
  return trimmed;
}

export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return 'Today';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
