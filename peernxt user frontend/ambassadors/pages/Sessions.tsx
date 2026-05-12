import React, { useEffect, useMemo, useState } from 'react';
import AmbassadorLayout from '../components/AmbassadorLayout';
import { Video, Calendar, Clock, MoreVertical } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const AmbassadorSessions: React.FC = () => {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [slots, setSlots] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<any[]>('/ambassador-slots/slots/me?upcoming=false')
      .then((data) => setSlots(data ?? []))
      .catch(() => setSlots([]));
  }, []);

  const sessions = useMemo(() => {
    const mapped = slots.map((slot) => ({
      id: String(slot.id),
      student: String(slot.ambassadorId ?? 'Student booking'),
      date: new Date(String(slot.slotAt)).toLocaleDateString(),
      time: new Date(String(slot.slotAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: String(slot.status ?? 'scheduled').toUpperCase(),
      meetLink: String(slot.meetLink ?? ''),
    }));
    if (filter === 'upcoming') return mapped.filter((s) => s.status === 'OPEN' || s.status === 'FULL' || s.status === 'SCHEDULED');
    return mapped.filter((s) => s.status === 'COMPLETED' || s.status === 'CANCELLED');
  }, [filter, slots]);

  return (
    <AmbassadorLayout title="Sessions" subtitle="View and manage your booked peer mentoring sessions.">
      <div className="space-y-8">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === 'past' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Past
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">
              {filter === 'upcoming' ? 'Upcoming Paid Sessions' : 'Completed Sessions'}
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${s.id}/100/100`} alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{s.student}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                        <Clock size={12} /> {s.date}, {s.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {filter === 'upcoming' && (
                    <a
                      href={s.meetLink || '#'}
                      target={s.meetLink ? '_blank' : undefined}
                      rel={s.meetLink ? 'noreferrer' : undefined}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                    >
                      Start Session
                    </a>
                  )}
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorSessions;
