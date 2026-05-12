
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { MapPin, University, IndianRupee, Clock, Calendar, Shield, ArrowLeft, Loader2, Star, Video } from 'lucide-react';

const AmbassadorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data
  const ambassador = {
    id,
    name: 'Rahul Khanna',
    university: 'Stanford University',
    country: 'USA',
    bio: 'CS senior. I can help with silicon valley internships and SAT prep.',
    longBio: "Currently a Senior pursuing Computer Science at Stanford. I've been through the rigorous application process, managed financial aid applications, and landed two summer internships at Meta and Google. I'm passionate about helping juniors find their feet in the Bay Area and navigating the US tech recruitment cycle as an international student.",
    price: 1500,
    rating: 4.8,
    reviews: 42
  };

  const dates = [
    { day: 'Mon', date: '21', full: '2024-10-21' },
    { day: 'Tue', date: '22', full: '2024-10-22' },
    { day: 'Wed', date: '23', full: '2024-10-23' }
  ];

  const slots = ['18:00', '19:00', '20:30'];

  const handlePayAndBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setIsProcessing(true);
    // Simulate Razorpay / Payment process
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsProcessing(false);
    alert('Payment successful! Your peer session is booked.');
    // Redirect to unified schedule
    navigate('/student/meetings');
  };

  return (
    <StudentLayout title="Ambassador Profile">
      <div className="max-w-5xl mx-auto space-y-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors">
          <ArrowLeft size={18} /> Back to Ambassadors
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                    <img src={`https://picsum.photos/seed/${id}/300/300`} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{ambassador.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm font-semibold text-slate-500">
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                         <University size={16} /> {ambassador.university}
                       </span>
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
                         <MapPin size={16} /> {ambassador.country}
                       </span>
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
                         <Star size={16} className="text-amber-400 fill-amber-400" /> {ambassador.rating}
                       </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-6">{ambassador.longBio}</p>
                 </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
               <h3 className="text-xl font-bold mb-6">What we'll cover</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   'Life at Stanford', 'CS Course Selection', 'Internship Strategy',
                   'Bay Area Housing', 'Part-time Jobs', 'Social Integration'
                 ].map(item => (
                   <div key={item} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                     <span className="font-semibold text-slate-700">{item}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-24">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Price per session</p>
                     <h3 className="text-3xl font-black text-slate-900 flex items-center">
                       <IndianRupee size={24} /> {ambassador.price}
                     </h3>
                   </div>
                   <div className="bg-blue-100 text-blue-700 p-3 rounded-2xl"><Video size={24} /></div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Choose Date</p>
                    <div className="grid grid-cols-3 gap-2">
                      {dates.map(d => (
                        <button
                          key={d.full}
                          onClick={() => setSelectedDate(d.full)}
                          className={`p-2 rounded-xl text-center border transition-all ${
                            selectedDate === d.full 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="block text-[10px] font-bold uppercase">{d.day}</span>
                          <span className="block text-sm font-bold">{d.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Choose Time</p>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedTime(s)}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
                            selectedTime === s 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <Clock size={14} /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!selectedDate || !selectedTime || isProcessing}
                  onClick={handlePayAndBook}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Pay & Schedule'}
                </button>

                <div className="mt-6 flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <Shield size={20} className="text-emerald-600" />
                   <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Secured via PeerNXT Trust</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default AmbassadorProfile;
