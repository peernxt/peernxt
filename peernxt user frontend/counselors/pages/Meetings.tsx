import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CounselorLayout from '../components/CounselorLayout';
import { Calendar, Clock, ExternalLink, MoreVertical } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const CounselorMeetings: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [allMeetings, setAllMeetings] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<any[]>('/counselor-meetings/me')
      .then((data) => setAllMeetings(data ?? []))
      .catch(() => setAllMeetings([]));
  }, []);

  const meetings = useMemo(() => {
    if (filter === 'upcoming') return allMeetings.filter((m) => m.status === 'scheduled');
    return allMeetings.filter((m) => m.status !== 'scheduled');
  }, [allMeetings, filter]);

  return (
    <CounselorLayout title="Manage Meetings" subtitle="View and manage all your scheduled sessions.">
      <div className="space-y-8">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === 'upcoming' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === 'past' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Past
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">
              {filter === 'upcoming' ? "Today's Schedule" : 'Completed Sessions'}
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    <img src={`https://picsum.photos/seed/${meeting.id}/100/100`} alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{meeting.studentId}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Clock size={12} /> {new Date(String(meeting.slotAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar size={12} /> {new Date(String(meeting.slotAt)).toLocaleDateString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {String(meeting.status).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {meeting.id && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/counselor/meetings/${meeting.id}/chat`);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      Open chat
                    </button>
                  )}
                  {filter === 'upcoming' && meeting.meetLink && (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Join Meet <ExternalLink size={14} />
                    </a>
                  )}
                  <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CounselorLayout>
  );
};

export default CounselorMeetings;
