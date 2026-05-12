
import React from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { Video, Calendar, Clock, University, ExternalLink } from 'lucide-react';

const PeerSessionList: React.FC = () => {
  const sessions = [
    { id: 'ps1', name: 'Rahul Khanna', university: 'Stanford University', date: '2024-10-24', time: '02:00 PM', status: 'PAID', meetLink: 'https://meet.google.com/xyz-pdqr-stv' },
  ];

  return (
    <StudentLayout title="Peer Sessions">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Paid Peer Mentoring</h1>
          <p className="text-slate-500">Unfiltered insights from students living the dream.</p>
        </div>

        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map(s => (
              <div key={s.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-200 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                     <img src={`https://picsum.photos/seed/${s.id}/150/150`} alt="" />
                   </div>
                   <div>
                     <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                     <p className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-2">
                       <University size={14} /> {s.university}
                     </p>
                     <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                          <Calendar size={14} className="text-blue-500" /> {s.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                          <Clock size={14} className="text-blue-500" /> {s.time}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                          {s.status}
                        </span>
                     </div>
                   </div>
                </div>
                <a 
                  href={s.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  <Video size={18} /> Join Meeting <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Video size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-900">No sessions yet</h3>
             <p className="text-slate-500 mb-6">Connect with university peers for genuine advice.</p>
             <Link to="/student/ambassadors" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Find Ambassadors</Link>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default PeerSessionList;
