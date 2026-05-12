
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MapPin, Globe, Phone, Calendar, Loader2, Crosshair } from 'lucide-react';
import { apiRequest, parseApiError } from '../../lib/api';

type Coords = { lat: number; lng: number };

const reverseGeocode = async (coords: Coords): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return '';
  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? '';
};

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

  const countryOptions = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'Ireland', 'France', 'Netherlands'];
  const intakeOptions = ['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026'];

  const toggleCountry = (country: string) => {
    setCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]));
  };

  const captureCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported on this device/browser.');
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
        setLocationError('Could not access your current location. Please allow location permission and retry.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };

  useEffect(() => {
    // Prompt once when page opens to keep onboarding quick.
    void captureCurrentLocation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords || countries.length === 0 || !intake.trim() || !whatsapp.trim()) return;

    setIsSubmitting(true);
    try {
      const profilePayload = {
        ...(user?.profile ?? {}),
        whatsappNumber: whatsapp.trim(),
        preferredCountries: countries,
        intake: intake.trim(),
        currentLocation: {
          mode: 'device',
          coords,
          address: coordsAddress || null,
        },
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

  const locationReady = Boolean(coords);
  const canSubmit = locationReady && countries.length > 0 && intake.trim().length > 0 && whatsapp.trim().length > 0;

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
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Globe size={16} className="text-indigo-600" /> Preferred Countries
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex flex-wrap gap-2">
                  {countryOptions.map((c) => {
                    const active = countries.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCountry(c)}
                        className={`px-3 py-2 rounded-xl text-sm font-bold transition-all border ${
                          active
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-600" /> Preferred Intake
              </label>
              <select
                required
                value={intake}
                onChange={(e) => setIntake(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select intake</option>
                {intakeOptions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-indigo-600" /> WhatsApp Number
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-600" /> Current Location (Device)
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => void captureCurrentLocation()}
                  disabled={isLocating}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Crosshair size={16} />
                    {isLocating ? 'Fetching location...' : 'Use my current location'}
                  </span>
                </button>
                {coords && (
                  <p className="text-sm text-slate-700">
                    <span className="font-bold">Coordinates:</span> {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                  </p>
                )}
                {coordsAddress && (
                  <p className="text-sm text-slate-700">
                    <span className="font-bold">Address:</span> {coordsAddress}
                  </p>
                )}
                {locationError && <p className="text-sm text-red-600">{locationError}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentOnboarding;

