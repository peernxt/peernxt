
import React, { useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { Search, MapPin, University, ArrowRight, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

const AmbassadorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const ambassadors = [
    { id: 'pa1', name: 'Rahul Khanna', university: 'Stanford University', country: 'USA', bio: 'CS senior. I can help with silicon valley internships and SAT prep.', price: 1500 },
    { id: 'pa2', name: 'Ishani Gupta', university: 'Oxford University', country: 'UK', bio: 'Philosophy & Economics. Ask me about the college system and Rhodes scholarships.', price: 1200 },
    { id: 'pa3', name: 'Zayn Malik', university: 'University of Toronto', country: 'Canada', bio: 'Engineering student. Expert on cold winters and work-study permits.', price: 1000 },
    { id: 'pa4', name: 'Sarah Ahmed', university: 'TU Munich', country: 'Germany', bio: 'Mechanical Eng. Can guide on public vs private uni and learning German.', price: 800 },
  ];

  const filtered = ambassadors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.university.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <StudentLayout title="Peer Ambassadors">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Real Advice from Real Students.</h1>
            <p className="text-blue-100 text-lg">
              Book affordable 1-on-1 sessions with students currently studying at your target university. No filters, just raw experience.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
            <University size={200} />
          </div>
        </div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by university, major or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col">
               <div className="p-6 flex-grow">
                 <div className="flex gap-4 items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 flex-shrink-0">
                       <img src={`https://picsum.photos/seed/${a.id}/200/200`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{a.name}</h3>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                          <University size={14} className="text-slate-400" /> {a.university}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                          <MapPin size={14} className="text-slate-400" /> {a.country}
                        </span>
                      </div>
                    </div>
                 </div>

                 <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                   "{a.bio}"
                 </p>

                 <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Session Fee</span>
                    <span className="text-xl font-black text-blue-900 flex items-center">
                      <IndianRupee size={18} /> {a.price}
                    </span>
                 </div>
               </div>
               
               <div className="p-6 pt-0 mt-auto">
                 <Link 
                   to={`/student/ambassadors/${a.id}`}
                   className="w-full py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm"
                 >
                   Book Session <ArrowRight size={16} />
                 </Link>
               </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default AmbassadorList;
