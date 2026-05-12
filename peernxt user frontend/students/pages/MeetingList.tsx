
import React, { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { Calendar, Clock, Video, MoreVertical, ExternalLink, UserCheck, Users, University } from 'lucide-react';
import { useAuth } from '../../App';
import { apiRequest, parseApiError } from '../../lib/api';

type CounselorRow = {
  id: string;
  name: string;
  date: string;
  time: string;
  status: string;
  meetLink: string;
};

type PeerRow = {
  id: string;
  name: string;
  university: string;
  date: string;
  time: string;
  status: string;
  meetLink: string;
};

function formatSessionDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatSessionTime(iso: string, durationMinutes?: number) {
  const d = new Date(iso);
  const end = durationMinutes
    ? new Date(d.getTime() + durationMinutes * 60_000)
    : new Date(d.getTime() + 60 * 60_000);
  return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function counselorStatusLabel(status: string) {
  const s = String(status).toLowerCase();
  if (s === 'scheduled') return 'SCHEDULED';
  if (s === 'completed') return 'COMPLETED';
  if (s === 'cancelled' || s === 'no_show') return 'CANCELLED';
  return s.replace(/_/g, ' ').toUpperCase();
}

const MeetingList: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'counselors' | 'peers'>('counselors');
  const [counselorMeetings, setCounselorMeetings] = useState<CounselorRow[]>([]);
  const [peerSessions, setPeerSessions] = useState<PeerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const [meetings, bookings] = await Promise.all([
        apiRequest<Record<string, unknown>[]>('/counselor-meetings/me'),
        apiRequest<Record<string, unknown>[]>('/ambassador-slots/bookings/me'),
      ]);

      const myUid = String(user.id);
      const asStudentMeetings = (meetings ?? []).filter((m) => String(m.studentId ?? m.student_id) === myUid);

      const counselorRows: CounselorRow[] = [];
      for (const m of asStudentMeetings) {
        const agentId = String(m.agentId ?? m.agent_id ?? '');
        const slotAt = String(m.slotAt ?? m.slot_at ?? '');
        let name = 'Counselor';
        if (agentId) {
          try {
            const agent = await apiRequest<Record<string, unknown>>(`/users/${agentId}`);
            name = String(agent.displayName ?? agent.display_name ?? agent.email ?? name);
          } catch {
            name = `Counselor (${agentId.slice(0, 8)}…)`;
          }
        }
        counselorRows.push({
          id: String(m.id),
          name,
          date: formatSessionDate(slotAt),
          time: formatSessionTime(slotAt, Number(m.durationMinutes ?? m.duration_minutes) || 30),
          status: counselorStatusLabel(String(m.status ?? 'scheduled')),
          meetLink: String(m.meetLink ?? m.meet_link ?? '#'),
        });
      }
      setCounselorMeetings(counselorRows);

      const peerRows: PeerRow[] = [];
      for (const b of bookings ?? []) {
        if (String(b.status) === 'cancelled') continue;
        const slotId = String(b.slotId ?? b.slot_id ?? '');
        if (!slotId) continue;
        let slot: Record<string, unknown> = {};
        try {
          slot = await apiRequest<Record<string, unknown>>(`/ambassador-slots/slots/${slotId}`);
        } catch {
          continue;
        }
        const slotAt = String(slot.slotAt ?? slot.slot_at ?? '');
        const ambassadorId = String(slot.ambassadorId ?? slot.ambassador_id ?? '');
        let name = 'Peer mentor';
        let university = 'Study abroad mentor';
        if (ambassadorId) {
          try {
            const amb = await apiRequest<Record<string, unknown>>(`/users/${ambassadorId}`);
            name = String(amb.displayName ?? amb.display_name ?? amb.email ?? name);
            const prof = (amb.profile ?? {}) as Record<string, unknown>;
            university = String(prof.universityName ?? prof.university_name ?? university);
          } catch {
            name = `Ambassador (${ambassadorId.slice(0, 8)}…)`;
          }
        }
        peerRows.push({
          id: String(b.id),
          name,
          university,
          date: formatSessionDate(slotAt),
          time: formatSessionTime(slotAt, Number(slot.durationMinutes ?? slot.duration_minutes) || 60),
          status: String(b.status).toLowerCase() === 'confirmed' ? 'CONFIRMED' : String(b.status).toUpperCase(),
          meetLink: String(slot.meetLink ?? slot.meet_link ?? '#'),
        });
      }
      setPeerSessions(peerRows);
    } catch (e) {
      setLoadError(parseApiError(e));
      setCounselorMeetings([]);
      setPeerSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const currentItems = activeTab === 'counselors' ? counselorMeetings : peerSessions;

  return (
    <StudentLayout title="My Schedule">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Booked Sessions</h1>
            <p className="text-slate-500">Counselor meetings and ambassador sessions from your PeerNXT account.</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('counselors')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'counselors' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck size={16} /> Counselors
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('peers')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'peers' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users size={16} /> Peer Mentors
            </button>
          </div>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {loadError}
            <button type="button" className="ml-3 font-bold underline" onClick={() => void loadSchedule()}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading your schedule…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentItems.length > 0 ? (
              currentItems.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-6 transition-all group hover:shadow-md ${
                    activeTab === 'peers' ? 'hover:border-blue-200' : 'hover:border-indigo-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl font-bold text-white ${
                          activeTab === 'peers' ? 'bg-blue-500' : 'bg-indigo-500'
                        }`}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{m.name}</h3>
                        {activeTab === 'peers' && 'university' in m && (
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-1">
                            <University size={14} /> {(m as PeerRow).university}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-lg">
                            <Calendar size={14} className={activeTab === 'peers' ? 'text-blue-500' : 'text-indigo-500'} />{' '}
                            {m.date}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-lg">
                            <Clock size={14} className={activeTab === 'peers' ? 'text-blue-500' : 'text-indigo-500'} />{' '}
                            {m.time}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              m.status === 'CONFIRMED' || m.status === 'SCHEDULED' || m.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700'
                                : m.status === 'COMPLETED'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {m.status !== 'COMPLETED' && (
                        <>
                          <a
                            href={m.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (!m.meetLink || m.meetLink === '#') {
                                e.preventDefault();
                                alert('Meeting link is not available yet.');
                              }
                            }}
                            className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md ${
                              !m.meetLink || m.meetLink === '#'
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : activeTab === 'peers'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            }`}
                          >
                            <Video size={18} /> Join Meet <ExternalLink size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => alert('Reschedule: contact support or your counselor from the session chat.')}
                            className="flex-grow sm:flex-grow-0 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => alert('Use in-app chat from your session for more options.')}
                        className="p-3 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-2xl"
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  {activeTab === 'counselors' ? <UserCheck size={32} /> : <Users size={32} />}
                </div>
                <h3 className="text-xl font-bold text-slate-900">No {activeTab} sessions yet</h3>
                <p className="text-slate-500 mb-6">Book a counselor or peer session from the Home or directory tabs.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default MeetingList;
