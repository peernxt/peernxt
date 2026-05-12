
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { MapPin, Star, Calendar, Clock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

const CounselorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  // Mock data
  const counselor = {
    id,
    name: 'Dr. Sarah Wilson',
    location: 'London, UK',
    bio: 'Expert in UK university admissions and visa processing for 10+ years. I help students with SOP writing, portfolio reviews, and mock interviews.',
    longBio: "With over a decade of experience in international education consultancy, Sarah has successfully guided more than 1,000 students to their dream universities across the UK and Europe. She specializes in high-tier university applications (Oxbridge, Russell Group) and comprehensive visa advisory. Her approach is personalized, ensuring every student's unique strengths are highlighted in their application.",
    countries: ['UK', 'Ireland'],
    rating: 4.9,
    reviews: 124,
    price: 'Free'
  };

  const dates = [
    { day: 'Mon', date: '21', full: '2024-10-21' },
    { day: 'Tue', date: '22', full: '2024-10-22' },
    { day: 'Wed', date: '23', full: '2024-10-23' },
    { day: 'Thu', date: '24', full: '2024-10-24' },
    { day: 'Fri', date: '25', full: '2024-10-25' },
  ];

  const slots = ['10:00', '11:00', '14:30', '16:00', '17:30'];

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsBooking(true);
    // Simulate API POST /meetings/schedule
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsBooking(false);
    alert('Meeting booked successfully! Check your meetings tab.');
    navigate('/student/meetings');
  };

  return (
    <StudentLayout title="Counselor Profile">
      <div className="max-w-5xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                 <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                    <img src={`https://picsum.photos/seed/${id}/300/300`} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{counselor.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="flex items-center gap-1.5 text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-lg">
                        <MapPin size={16} /> {counselor.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-lg">
                        <Star size={16} className="text-amber-400 fill-amber-400" /> {counselor.rating} ({counselor.reviews} reviews)
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      {counselor.longBio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {counselor.countries.map(c => (
                        <span key={c} className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase rounded-xl tracking-wider">
                          {c} Admissions
                        </span>
                      ))}
                    </div>
                 </div>
               </div>
               <div className="absolute top-0 right-0 p-8">
                 <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl font-bold text-sm">Free Meeting</div>
               </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-6">Services Offered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'University Selection', 'SOP Review', 'Scholarship Assistance', 
                  'Visa Consultation', 'Mock Interviews', 'Pre-departure Briefing'
                ].map(service => (
                  <div key={service} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                    <CheckCircle size={20} className="text-indigo-600" />
                    <span className="font-semibold text-slate-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Booking */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" />
                Schedule a Session
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Select Date</p>
                  <div className="grid grid-cols-5 gap-2">
                    {dates.map(d => (
                      <button
                        key={d.full}
                        onClick={() => setSelectedDate(d.full)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          selectedDate === d.full 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase mb-1">{d.day}</span>
                        <span className="block text-sm font-bold">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Select Time (IST)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedTime(s)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                          selectedTime === s 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-600'
                        }`}
                      >
                        <Clock size={14} /> {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                   <button
                    disabled={!selectedDate || !selectedTime || isBooking}
                    onClick={handleBook}
                    className="w-full flex items-center justify-center py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                   >
                     {isBooking ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                   </button>
                   <p className="text-center text-xs text-slate-400 mt-4">
                     By booking, you agree to our Terms of Service.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default CounselorProfile;
