
import React from 'react';
import StudentLayout from '../students/components/StudentLayout';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { User as UserIcon, Camera, Save, Mail, MapPin, Phone, Globe, Calendar } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const profilePicture = user?.profilePicture?.trim() || null;
  const fallbackInitial = (user?.name?.[0] ?? 'U').toUpperCase();

  // Fix: Move profile content to a variable to avoid nested component errors and improve rendering performance
  const content = (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 inline-block">
             <div className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-400">
                {profilePicture ? (
                  <img src={profilePicture} alt={user?.name ?? 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-indigo-600">{fallbackInitial}</span>
                )}
             </div>
             <button
               type="button"
               onClick={() => alert('Profile photo upload is coming soon.')}
               className="absolute bottom-2 right-2 bg-white p-2 rounded-xl shadow-md border border-slate-100 text-indigo-600 hover:bg-indigo-50"
             >
               <Camera size={18} />
             </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
               <h1 className="text-3xl font-extrabold text-slate-900">{user?.name}</h1>
               <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mt-1">{user?.role.replace('_', ' ')}</p>
             </div>
             <button
               type="button"
               onClick={() => alert('Profile saved (mock).')}
               className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
             >
               <Save size={18} /> Save Changes
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-300" size={18} />
                <input type="text" defaultValue={user?.name} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
                <input type="email" disabled defaultValue={user?.email} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Location & Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">City/Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-300" size={18} />
                <input type="text" defaultValue="Mumbai, India" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Country</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">
                  <option>USA</option>
                  <option>UK</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Intake</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">
                  <option>Fall 2024</option>
                  <option>Spring 2025</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Fix: Use conditional rendering based on user role instead of a nested PageWrapper component
  if (user?.role === UserRole.STUDENT) {
    return <StudentLayout title="Profile">{content}</StudentLayout>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {content}
    </div>
  );
};

export default ProfilePage;
