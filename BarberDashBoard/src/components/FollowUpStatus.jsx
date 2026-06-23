import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { getFollowUpStyle, formatFollowUpType, formatDateTime } from '../utils/helpers';

// Each follow-up type with its scheduled offset description
const FOLLOW_UP_TYPES = [
  {
    type: 'thank_you',
    label: 'Thank You',
    offset: '2 hours after appointment',
    icon: '💌',
  },
  {
    type: 'review_request',
    label: 'Review Request',
    offset: '24 hours after appointment',
    icon: '⭐',
  },
  {
    type: 'rebooking_reminder',
    label: 'Rebooking Reminder',
    offset: '30 days after appointment',
    icon: '🔔',
  },
];

const FollowUpStatus = ({ appointmentId, followUps = [], onRefresh }) => {
  const [scheduling, setScheduling] = useState(null);

  const getFollowUp = (type) =>
    followUps.find((f) => f.type === type) || null;

  const handleSchedule = async (type) => {
    setScheduling(type);
    try {
      await api.post('/api/admin/follow-up-settings', {
        appointment_id: appointmentId,
        type,
      });
      toast.success(`${formatFollowUpType(type)} email scheduled`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setScheduling(null);
    }
  };

  return (
    <div>
      <h3 style={s.title}>Follow-Up Emails</h3>
      <div style={s.list}>
        {FOLLOW_UP_TYPES.map(({ type, label, offset, icon }) => {
          const fu = getFollowUp(type);
          const style = fu ? getFollowUpStyle(fu.status) : { color: '#a0aec0', background: '#f7fafc' };

          return (
            <div key={type} style={s.item}>
              <div style={s.itemLeft}>
                <span style={s.itemIcon}>{icon}</span>
                <div>
                  <div style={s.itemLabel}>{label}</div>
                  <div style={s.itemOffset}>{offset}</div>
                  {fu?.scheduled_at && (
                    <div style={s.itemDate}>
                      Scheduled: {formatDateTime(fu.scheduled_at)}
                    </div>
                  )}
                  {fu?.sent_at && (
                    <div style={{ ...s.itemDate, color: '#48bb78' }}>
                      Sent: {formatDateTime(fu.sent_at)}
                    </div>
                  )}
                </div>
              </div>

              <div style={s.itemRight}>
                {fu ? (
                  <span
                    className="badge"
                    style={{
                      color: style.color,
                      background: style.background,
                      fontSize: 12,
                      padding: '4px 12px',
                    }}
                  >
                    {fu.status}
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={s.notScheduled}>Not scheduled</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleSchedule(type)}
                      disabled={scheduling === type}
                      style={{ fontSize: 12 }}
                    >
                      {scheduling === type ? 'Scheduling…' : '+ Schedule'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const s = {
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2d3748',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    background: '#fff',
    borderBottom: '1px solid #f0f4f8',
    gap: 12,
    flexWrap: 'wrap',
  },
  itemLeft: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  itemIcon: { fontSize: 20, flexShrink: 0, marginTop: 2 },
  itemLabel: { fontSize: 14, fontWeight: 600, color: '#2d3748' },
  itemOffset: { fontSize: 12, color: '#a0aec0', marginTop: 2 },
  itemDate: { fontSize: 12, color: '#718096', marginTop: 3 },
  itemRight: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  notScheduled: { fontSize: 12, color: '#a0aec0', fontStyle: 'italic' },
};

export default FollowUpStatus;
