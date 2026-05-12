
import React from 'react';
import { useAuth } from '../../App';
import StudentLayout from '../components/StudentLayout';
import { Calendar, Users, MessageSquare, ArrowRight, Video, MapPin, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { name: 'Counselor Meetings', count: 2, icon: Calendar, color: 'indigo' },
    { name: 'Ambassador Sessions', count: 1, icon: Users, color: 'blue' },
    { name: 'Community Posts', count: 12, icon: MessageSquare, color: 'emerald' },
  ];

  const upcomingMeetings = [
    { id: '1', name: 'Dr. Sarah Wilson', type: 'Counselor', time: 'Tomorrow, 10:30 AM', role: 'Counselor' },
    { id: '2', name: 'Rahul Khanna', type: 'Peer Session', university: 'Stanford University', time: 'Oct 24, 02:00 PM', role: 'Ambassador' },
  ];

  return (
    <StudentLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Card */}
        <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-lg">
              You're on your way to success. Check your upcoming sessions or explore new counselors today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/student/counselors" className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm">
                Find a Counselor <ArrowRight size={18} />
              </Link>
              <Link to="/student/community" className="bg-indigo-500/30 text-white backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500/50 transition-colors">
                Go to Community
              </Link>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/10 rounded-full backdrop-blur-3xl"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Link key={stat.name} to="/student/meetings" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all">
              <div>
                <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
                <stat.icon size={28} />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Meetings */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Upcoming Meetings</h2>
              <Link to="/student/meetings" className="text-indigo-600 text-sm font-bold hover:underline">View Schedule</Link>
            </div>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-400 overflow-hidden">
                     <img src={`https://picsum.photos/seed/${meeting.id}/100/100`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-slate-900">{meeting.name}</h4>
                    <p className="text-slate-500 text-sm">{meeting.role} • {meeting.time}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      // UI-only behavior: route to schedule; later this will open the actual meeting link.
                      navigate('/student/meetings');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    Join Meet <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Suggested Communities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
              <Link to="/student/community" className="text-indigo-600 text-sm font-bold hover:underline">Browse Communities</Link>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Study in USA - Fall 2024</h4>
                  <p className="text-slate-500 text-sm mt-1">Join 1.2k students sharing visa tips, university comparisons and housing leads.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/student/community/1')}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Join Community
              </button>
            </div>
          </section>
        </div>
      </div>
    </StudentLayout>
  );
};

// Simple Globe icon helper
const Globe: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

export default StudentDashboard;
