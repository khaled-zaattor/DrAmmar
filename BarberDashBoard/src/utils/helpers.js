// Date & Time Formatting
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr) return '—';
  try {
    const combined = timeStr ? `${dateStr}T${timeStr}` : dateStr;
    const date = new Date(combined);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  try {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Status badge styles
export const getStatusStyle = (status) => {
  const map = {
    pending:   { color: '#b7791f', background: '#fefcbf', border: '#f6e05e' },
    confirmed: { color: '#2b6cb0', background: '#ebf8ff', border: '#90cdf4' },
    completed: { color: '#276749', background: '#f0fff4', border: '#9ae6b4' },
    cancelled: { color: '#c53030', background: '#fff5f5', border: '#feb2b2' },
    no_show:   { color: '#553c9a', background: '#faf5ff', border: '#d6bcfa' },
  };
  return map[status] || { color: '#4a5568', background: '#f7fafc', border: '#e2e8f0' };
};

// How many times this customer has booked (cancellations and no-shows excluded).
// null means the appointment predates the customer backfill.
export const getVisitsBadge = (count) => {
  if (count === null || count === undefined) return null;
  if (count <= 1) {
    return { label: 'New', title: 'First booking', color: '#975a16', background: '#fffaf0', border: '#f6ad55' };
  }
  return {
    label: `${count}×`,
    title: `${count} bookings so far`,
    color: '#2c5282', background: '#ebf8ff', border: '#bee3f8',
  };
};

export const getFollowUpStyle = (status) => {
  const map = {
    pending: { color: '#b7791f', background: '#fefcbf' },
    sent:    { color: '#276749', background: '#f0fff4' },
    failed:  { color: '#c53030', background: '#fff5f5' },
  };
  return map[status] || { color: '#4a5568', background: '#f7fafc' };
};

export const formatFollowUpType = (type) => {
  const map = {
    thank_you: 'Thank You',
    review_request: 'Review Request',
    rebooking_reminder: 'Rebooking Reminder',
  };
  return map[type] || type;
};

// Extract array from Laravel response — handles all 4 structures:
//  1. response.data = [...]                         → plain array
//  2. response.data = { data: [...] }               → public endpoint with success wrapper
//  3. response.data = { data: { data: [...] } }     → admin paginated endpoint
//  4. response.data = { success, data: { data: [] } } → admin paginated with success wrapper
export const extractData = (response) => {
  const body = response.data;

  // 1. Top-level is already an array
  if (Array.isArray(body)) return body;

  if (body && typeof body === 'object') {
    const inner = body.data;

    // 2. body.data is a plain array  →  { success, data: [...] }
    if (Array.isArray(inner)) return inner;

    // 3 & 4. body.data is an object with its own .data array  →  paginated
    if (inner && typeof inner === 'object' && Array.isArray(inner.data)) {
      return inner.data;
    }
  }

  return [];
};

// Today's date string YYYY-MM-DD
export const todayStr = () => new Date().toISOString().split('T')[0];

// Get appointment date string
export const getApptDate = (appt) =>
  appt.appointment_date || appt.date || '';

// Get appointment time string
export const getApptTime = (appt) =>
  appt.appointment_time || appt.time || '';
