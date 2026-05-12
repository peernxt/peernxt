
import React, { useState } from 'react';
import StudentLayout from '../components/StudentLayout';
import { Search, MapPin, Globe, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CounselorList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const counselors = [
    { id: '1', name: 'Dr. Sarah Wilson', location: 'London, UK', bio: 'Expert in UK university admissions and visa processing for 10+ years.', countries: ['UK', 'Ireland'], rating: 4.9, reviews: 124 },
    { id: '2', name: 'David Chen', location: 'Toronto, Canada', bio: 'Specializes in Canadian permanent residency and university placement.', countries: ['Canada'], rating: 4.8, reviews: 95 },
    { id: '3', name: 'Priya Sharma', location: 'New Delhi, India', bio: 'Guidance for masters in USA and Germany. Expertise in scholarship applications.', countries: ['USA', 'Germany', 'France'], rating: 5.0, reviews: 210 },
    { id: '4', name: 'Michael Smith', location: 'Melbourne, Australia', bio: 'Native expert helping students find the best programs in ANZ region.', countries: ['Australia', 'NZ'], rating: 4.7, reviews: 88 },
  ];

  const countries = ['All', 'UK', 'USA', 'Canada', 'Australia', 'Germany'];

  const filteredCounselors = counselors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || c.countries.includes(selectedCountry);
    return matchesSearch && matchesCountry;
  });

  return (
    <StudentLayout title="Find a Counselor">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {countries.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCountry === c 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounselors.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full overflow-hidden">
              <div className="p-6 flex-grow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-100">
                    <img src={`https://picsum.photos/seed/${c.id}/200/200`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{c.name}</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1">
                      <MapPin size={14} /> {c.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Star size={16} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-slate-900">{c.rating}</span>
                  <span className="text-slate-400 text-xs">({c.reviews} reviews)</span>
                </div>

                <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                  {c.bio}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {c.countries.map(country => (
                    <span key={country} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded tracking-wider">
                      {country} Expert
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto">
                <Link 
                  to={`/student/counselors/${c.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                >
                  View Profile <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCounselors.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No counselors found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default CounselorList;
