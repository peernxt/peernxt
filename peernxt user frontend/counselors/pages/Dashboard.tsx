
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../App';
import {
  Users,
  Calendar,
  Star,
  Video,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CounselorLayout from '../components/CounselorLayout';
import { apiRequest } from '../../lib/api';

const MoreHorizontal: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
);

const CounselorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiRequest<any[]>('/counselor-meetings/me')
      .then((data) => {
        if (mounted) setMeetings(data ?? []);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : 'Could not load meetings');
      });
    return () => {
      mounted = false;
    };
  }, []);

  const upcomingMeetings = useMemo(() => meetings.filter((m) => m.status === 'scheduled').slice(0, 6), [meetings]);
  const completed = useMemo(() => meetings.filter((m) => m.status === 'completed').length, [meetings]);

  const stats = [
    { name: 'Total Meetings', value: String(meetings.length), trend: 'all time', icon: Calendar, color: 'indigo' },
    { name: 'Upcoming', value: String(upcomingMeetings.length), trend: 'scheduled', icon: Users, color: 'orange' },
    { name: 'Avg. Rating', value: '4.9', trend: 'from reviews', icon: Star, color: 'amber' },
    { name: 'Completed', value: String(completed), trend: 'overall', icon: CheckCircle, color: 'emerald' },
  ];

  return (
    <CounselorLayout title="Expert Dashboard" subtitle={`Hello ${user?.name}, you have ${upcomingMeetings.length} upcoming meetings.`}>
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 bg-${stat.color}-100 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
            <p className="text-xs font-bold text-indigo-600 mt-2 uppercase tracking-tight">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Today&apos;s Schedule</h3>
            <Link to="/counselor/meetings" className="text-indigo-600 font-bold text-sm hover:underline">Manage All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meeting.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {String(meeting.status).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {meeting.meetLink && (
                    <a
                      href={meeting.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      Join Meet <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      // #region agent log
                      fetch('http://127.0.0.1:7754/ingest/e019f77b-9cc8-4792-b508-1b9b9f842355',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b7fb4d'},body:JSON.stringify({sessionId:'b7fb4d',runId:'pre-fix-1',hypothesisId:'H1',location:'CounselorDashboard.tsx:openChat',message:'counselor navigating to meeting chat from dashboard',data:{meetingId:String(meeting.id ?? ''),status:String(meeting.status ?? ''),hasMeetLink:Boolean(meeting.meetLink)},timestamp:Date.now()})}).catch(()=>{});
                      // #endregion
                      navigate(`/counselor/meetings/${meeting.id}/chat`);
                    }}
                    className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    Open Chat
                  </button>
                  <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-100 hover:bg-slate-50">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Link to="/counselor/settings" className="block">
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <Video size={24} />
                </div>
                <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold uppercase tracking-wider border border-white/20">Synced</div>
              </div>
              <h3 className="text-xl font-bold mb-2">Google Calendar</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Your availability is synced with Google. Students will see slots from your linked calendar.</p>
              <span className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                Adjust Settings <ArrowRight size={18} />
              </span>
            </div>
          </Link>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Lead Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: 'Hot Leads', value: 8, color: 'bg-red-500' },
                { label: 'Warm Leads', value: 18, color: 'bg-amber-500' },
                { label: 'General Queries', value: 22, color: 'bg-indigo-500' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.value / 48) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CounselorLayout>
  );
};

export default CounselorDashboard;
