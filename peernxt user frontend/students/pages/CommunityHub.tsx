
import React from 'react';
import StudentLayout from '../components/StudentLayout';
import { Globe, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityHub: React.FC = () => {
  const communities = [
    { id: '1', name: 'USA Fall 2024', country: 'USA', description: 'Everything about US admissions, visa, and university life.', members: '1,240', isJoined: true },
    { id: '2', name: 'UK Masters Guide', country: 'UK', description: 'The hub for post-graduate students heading to United Kingdom.', members: '850', isJoined: false },
    { id: '3', name: 'Germany Tech 2025', country: 'Germany', description: 'Discuss engineering programs, APS requirements and job prospects.', members: '620', isJoined: false },
    { id: '4', name: 'Canada PR & Study', country: 'Canada', description: 'Covers study permits, PGP, and university transfers.', members: '1,100', isJoined: true },
  ];

  return (
    <StudentLayout title="Communities">
      <div className="space-y-8">
        <div className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Connect with fellow students globally.</h1>
            <p className="text-indigo-200 text-lg mb-0">
              Join country-specific groups to discuss everything from visa preparation to finding the best off-campus housing.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
          <div className="absolute bottom-0 right-0 p-8 hidden md:block opacity-20">
             <Globe size={180} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communities.map(community => (
            <div key={community.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all flex flex-col md:flex-row gap-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-400">
                <Globe size={32} />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{community.name}</h3>
                  {community.isJoined && (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle size={14} /> Joined
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mb-4">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-medium flex items-center gap-1.5">
                    <Users size={16} /> {community.members} Members
                  </span>
                  <Link 
                    to={`/student/community/${community.id}`}
                    className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    Enter Hub <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default CommunityHub;
