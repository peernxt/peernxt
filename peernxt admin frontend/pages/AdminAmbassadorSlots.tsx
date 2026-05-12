import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Filter, Users, XCircle } from 'lucide-react';
import { AmbassadorSlot, MeetingStatus } from '../types';
import { apiRequest } from '../lib/api';

const statusBadge: Record<MeetingStatus, string> = {
  scheduled: 'bg-indigo-50 text-indigo-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

const AdminAmbassadorSlots: React.FC = () => {
  const [slots, setSlots] = useState<AmbassadorSlot[]>([]);
  const [status, setStatus] = useState<MeetingStatus | 'all'>('all');

  useEffect(() => {
    apiRequest<any[]>('/admin/ambassador-slots')
      .then((data) =>
        setSlots(
          (data ?? []).map((s) => ({
            id: String(s.id),
            ambassadorName: String(s.ambassadorId),
            startsAtLabel: new Date(String(s.slotAt)).toLocaleString(),
            status: String(s.status === 'open' || s.status === 'full' ? 'scheduled' : s.status) as MeetingStatus,
            maxStudents: Number(s.maxStudents ?? 10),
            bookedCount: Number(s.bookedCount ?? 0),
          }))
        )
      )
      .catch(() => setSlots([]));
  }, []);

  const filtered = useMemo(() => {
    return slots.filter((s) => status === 'all' || s.status === status);
  }, [slots, status]);

  const cancelSlot = (id: string) => {
    apiRequest(`/admin/ambassador-slots/${id}/status`, {
      method: 'PATCH',
      body: { status: 'cancelled' },
    })
      .then(() => setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'cancelled' } : s))))
      .catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Ambassador Slots</h3>
            <p className="text-slate-500 text-sm mt-1">Review slots and capacity.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{s.ambassadorName}</p>
                  <p className="text-slate-500 text-sm truncate">{s.startsAtLabel}</p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${statusBadge[s.status]}`}>
                {s.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-slate-600 font-semibold">
                <Users size={18} className="text-slate-400" />
                {s.bookedCount}/{s.maxStudents} booked
              </div>
              <button
                onClick={() => cancelSlot(s.id)}
                disabled={s.status !== 'scheduled'}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  s.status === 'scheduled'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <XCircle size={16} />
                Cancel slot
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 font-medium lg:col-span-2">
            No slots found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAmbassadorSlots;

