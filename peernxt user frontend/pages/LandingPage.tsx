
import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, UserCheck, ArrowRight, ShieldCheck, Calendar, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200">
        <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-indigo-950">PeerNXT</span>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="py-16 md:py-24 bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Your Journey to Study Abroad, <br />
              <span className="text-indigo-600">Guided by Peers & Experts</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
              Connect with certified counselors, meet peer ambassadors already at your dream university, and join a global community of students.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Link to="/login/student" className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">For Students</h3>
                <p className="text-slate-500 mb-4">Join communities, find peer mentors, and navigate your study abroad journey.</p>
                <span className="flex items-center gap-2 text-indigo-600 font-semibold">
                  Get Started <ArrowRight size={16} />
                </span>
              </Link>

              <Link to="/login/ambassador" className="group p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">For Ambassadors</h3>
                <p className="text-slate-500 mb-4">Earn by helping juniors navigate university life and admissions.</p>
                <span className="flex items-center gap-2 text-blue-600 font-semibold">
                  Join as Peer <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">How PeerNXT Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="text-indigo-600" size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2">Book Meetings</h4>
                <p className="text-slate-500">Schedule free sessions with expert counselors.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="text-indigo-600" size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2">Join Communities</h4>
                <p className="text-slate-500">Connect with students heading to the same country.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-indigo-600" size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2">Paid Peer Sessions</h4>
                <p className="text-slate-500">Get unfiltered advice from seniors at your university.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="text-indigo-600" size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2">Safe & Verified</h4>
                <p className="text-slate-500">Verified professionals and peer mentors only.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <div className="bg-indigo-600 p-1 rounded text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-white font-bold tracking-tight">PeerNXT</span>
            </div>
            <p className="max-w-xs">Building the bridge between dreams and university classrooms.</p>
          </div>
          <div className="flex gap-12">
            <div>
              <h5 className="text-white font-bold mb-4">Quick Links</h5>
              <ul className="space-y-2">
                <li><Link to="/login/student" className="hover:text-white">Student Login</Link></li>
                <li><Link to="/login/ambassador" className="hover:text-white">Ambassador Login</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Support</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          &copy; 2024 PeerNXT. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
