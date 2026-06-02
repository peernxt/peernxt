import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MapPin, Globe, Phone, Calendar, Loader2, Crosshair, CheckCircle2 } from 'lucide-react';
import { apiRequest, parseApiError } from '../../lib/api';

type Coords = { lat: number; lng: number };

const reverseGeocode = async (coords: Coords): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return '';
  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? '';
};

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return `+91${digits}`;
}

const COUNTRY_OPTIONS = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'France', 'Netherlands'];
const INTAKE_OPTIONS = ['Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027', 'Fall 2027'];

const StudentOnboarding: React.FC = () => {
  const { user, login, token } = useAuth();
  const navigate = useNavigate();

  const [countries, setCountries] = useState<string[]>([]);
  const [intake, setIntake] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [coords, setCoords] = useState<Coords | null>(null);
  const [coordsAddress, setCoordsAddress] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    void captureCurrentLocation();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const captureCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported on this device.');
      return;
    }
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(nextCoords);
        try {
          const address = await reverseGeocode(nextCoords);
          setCoordsAddress(address);
        } catch {
          setCoordsAddress('');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocationError('Could not access location. Allow permission and retry.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };

  const handleSendOTP = async () => {
    const normalized = normalizePhone(whatsapp);
    if (!/^\+91[6-9]\d{9}$/.test(normalized)) {
      setOtpError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      await apiRequest('/auth/send-otp', {
        method: 'POST',
        body: { phone: normalized, email: user?.email },
      });
      setOtpSent(true);
      setResendTimer(30);
      setOtpError('OTP sent to your email (WhatsApp coming soon).');
    } catch (e) {
      setOtpError(parseApiError(e));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const normalized = normalizePhone(whatsapp);
    if (otpCode.length !== 6) { setOtpError('Enter the 6-digit OTP.'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: { phone: normalized, otp: otpCode },
      });
      setPhoneVerified(true);
      setOtpError('');
    } catch (e) {
      setOtpError(parseApiError(e));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneVerified || countries.length === 0 || !intake.trim()) return;

    setIsSubmitting(true);
    try {
      const location = coordsAddress || (coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : '');
      const profilePayload = {
        ...(user?.profile ?? {}),
        whatsappNumber: normalizePhone(whatsapp),
        preferredCountries: countries,
        intake: intake.trim(),
        location,
      };

      await apiRequest('/users/me', {
        method: 'PUT',
        body: { profile: profilePayload },
      });

      if (user && token) {
        login(token, { ...user, onboardingCompleted: true, profile: profilePayload });
      }
      navigate('/student/dashboard');
    } catch (error) {
      alert(parseApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = phoneVerified && countries.length > 0 && intake.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Let's set up your profile</h1>
          <p className="text-slate-500 mt-2 text-lg">Help us personalize your PeerNXT experience.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Preferred Countries */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Globe size={16} className="text-indigo-600" /> Preferred Countries
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2">
                {COUNTRY_OPTIONS.map((c) => {
                  const active = countries.includes(c);
                  return (
                    <button key={c} type="button" onClick={() => setCountries((prev) => active ? prev.filter((x) => x !== c) : [...prev, c])}
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Intake */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" /> Preferred Intake
              </label>
              <select required value={intake} onChange={(e) => setIntake(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select intake</option>
                {INTAKE_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* WhatsApp + OTP */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-indigo-600" /> WhatsApp Number
                {phoneVerified && <span className="ml-auto flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 size={14} /> Verified</span>}
              </label>

              <div className="flex gap-2">
                <div className="flex flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <span className="flex items-center px-3 text-slate-500 font-bold border-r border-slate-200 bg-slate-100 text-sm">🇮🇳 +91</span>
                  <input type="tel" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10)); setOtpSent(false); setPhoneVerified(false); setOtpCode(''); }}
                    placeholder="98765 43210" disabled={phoneVerified} maxLength={10}
                    className="flex-1 p-3 bg-transparent outline-none disabled:opacity-60" />
                </div>
                {!phoneVerified && (
                  <button type="button" onClick={handleSendOTP} disabled={otpLoading || (otpSent && resendTimer > 0)}
                    className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 whitespace-nowrap">
                    {otpLoading ? <Loader2 size={16} className="animate-spin" /> : otpSent ? (resendTimer > 0 ? `${resendTimer}s` : 'Resend') : 'Send OTP'}
                  </button>
                )}
              </div>

              {otpSent && !phoneVerified && (
                <div className="mt-3 flex gap-2">
                  <input type="text" inputMode="numeric" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center font-bold text-lg" />
                  <button type="button" onClick={handleVerifyOTP} disabled={otpLoading || otpCode.length !== 6}
                    className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50">
                    {otpLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                  </button>
                </div>
              )}

              {otpError && (
                <p className={`mt-2 text-sm ${otpError.includes('sent') ? 'text-indigo-600' : 'text-red-600'}`}>{otpError}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" /> Current Location (optional)
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <button type="button" onClick={() => void captureCurrentLocation()} disabled={isLocating}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-50 flex items-center gap-2">
                  <Crosshair size={16} />
                  {isLocating ? 'Fetching location...' : 'Use my current location'}
                </button>
                {coordsAddress && <p className="text-sm text-slate-700"><span className="font-bold">Address:</span> {coordsAddress}</p>}
                {locationError && <p className="text-sm text-red-600">{locationError}</p>}
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isSubmitting || !canSubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
              </button>
              {!phoneVerified && <p className="text-center text-sm text-slate-400 mt-3">Verify your WhatsApp number to continue</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;
