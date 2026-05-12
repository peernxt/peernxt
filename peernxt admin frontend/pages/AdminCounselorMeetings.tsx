import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, ExternalLink, Filter, XCircle } from 'lucide-react';
import { CounselorMeeting, MeetingStatus } from '../types';
import { apiRequest } from '../lib/api';

const statusBadge: Record<MeetingStatus, string> = {
  scheduled: 'bg-indigo-50 text-indigo-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

const AdminCounselorMeetings: React.FC = () => {
  const [meetings, setMeetings] = useState<CounselorMeeting[]>([]);
  const [status, setStatus] = useState<MeetingStatus | 'all'>('all');

  useEffect(() => {
    apiRequest<any[]>('/admin/counselor-meetings')
      .then((data) =>
        setMeetings(
          (data ?? []).map((m) => ({
            id: String(m.id),
            studentName: String(m.studentId),
            counselorName: String(m.agentId),
            startsAtLabel: new Date(String(m.slotAt)).toLocaleString(),
            status: String(m.status ?? 'scheduled') as MeetingStatus,
            meetLink: m.meetLink,
          }))
        )
      )
      .catch(() => setMeetings([]));
  }, []);

  const filtered = useMemo(() => {
    return meetings.filter((m) => status === 'all' || m.status === status);
  }, [meetings, status]);

  const cancelMeeting = (id: string) => {
    apiRequest(`/admin/counselor-meetings/${id}/status`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
      .then(() => setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, status: 'cancelled' } : m))))
      .catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Counselor Meetings</h3>
            <p className="text-slate-500 text-sm mt-1">Review and cancel meetings.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 text-slate-600 text-sm font-semibold">
              <Filter size={16} className="text-slate-400" />
              Status
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300"
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar size={22} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 truncate">
                  {m.studentName} <span className="text-slate-400 font-semibold">→</span> {m.counselorName}
                </p>
                <p className="text-slate-500 text-sm truncate">{m.startsAtLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${statusBadge[m.status]}`}>
                {m.status.toUpperCase()}
              </span>

              {m.meetLink && (
                <a
                  href={m.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  Meet <ExternalLink size={14} />
                </a>
              )}

              <button
                onClick={() => cancelMeeting(m.id)}
                disabled={m.status !== 'scheduled'}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  m.status === 'scheduled'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <XCircle size={16} />
                Cancel
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 font-medium">
            No meetings found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCounselorMeetings;

