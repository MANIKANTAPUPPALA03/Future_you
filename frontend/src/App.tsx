import { ArrowRight, Shield, TrendingUp, Zap, Mail, Lock, User, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { ReactNode, FormEvent, useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from './firebase';
import api from './api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/initialize" element={<InitializeWizard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="text-xl text-slate-600">Oops! The page you are looking for does not exist.</p>
        <Link to="/" className="inline-block mt-4 text-emerald-500 font-semibold hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
                Future You
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => navigate('/auth')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer"
              >
                Login / Signup
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-grow pt-32 pb-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6">
              Your Future Is Being <br className="hidden md:block" /> Built Today.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              Future You helps you visualize how your daily habits shape your health, career, financial stability, and resilience over the next decade.
            </p>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                Login / Signup <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-slate-400 font-medium">
                Privacy-first design. Your journey stays yours.
              </p>
            </div>
          </motion.div>
        </section>

        {/* TRUST SECTION / FEATURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 md:mt-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
              title="Predictive Behavioral Simulation"
              description="Understand long-term impact of daily decisions."
              delay={0.1}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-emerald-500" />}
              title="Multi-Scenario Future Modeling"
              description="Compare current path with optimized outcomes."
              delay={0.2}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-emerald-500" />}
              title="Shock Preparedness Insights"
              description="Evaluate how resilient your life is to unexpected disruptions."
              delay={0.3}
            />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-900 font-bold mb-2">Future You</p>
          <p className="text-slate-500 text-sm mb-4">Built for long-term thinking.</p>
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Future You. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Create the profile in backend via API call
        await api.post('/profile', {
          name: name || 'User',
          email,
          plan: 'free'
        });
        navigate('/initialize');
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link to="/" className="text-3xl font-bold tracking-tight text-slate-900">
          Future You
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-soft border border-gray-100 overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative cursor-pointer ${isLogin ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Login
            {isLogin && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
              />
            )}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 text-sm font-semibold transition-colors relative cursor-pointer ${!isLogin ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Signup
            {!isLogin && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
              />
            )}
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer">
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-emerald-500 font-semibold hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer">
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-emerald-500 font-semibold hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function InitializeWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sleep: 7,
    exercise: '3-4 times/week',
    screenTime: 4,
    stressLevel: 5,
    productivity: 8,
    savings: 20,
    familyIncome: 'Middle',
    supportSystem: 'Moderate',
    accessResources: 'Adequate',
    urbanRural: 'Suburban',
    workCulture: 'Hybrid',
    stressExposure: 'Moderate',
    economicCondition: 'Stable',
    industryVolatility: 'Moderate',
    techAdaptability: 'Moderate',
    automationRisk: 'Moderate'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulationSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        personal: {
          sleep: formData.sleep,
          exercise: formData.exercise,
          screenTime: formData.screenTime,
          stressLevel: formData.stressLevel,
          productivity: formData.productivity,
          savings: formData.savings
        },
        socio_economic: {
          familyIncome: formData.familyIncome,
          supportSystem: formData.supportSystem,
          accessResources: formData.accessResources
        },
        environmental: {
          urbanRural: formData.urbanRural,
          workCulture: formData.workCulture,
          stressExposure: formData.stressExposure
        },
        macro_dynamic: {
          economicCondition: formData.economicCondition,
          industryVolatility: formData.industryVolatility,
          techAdaptability: formData.techAdaptability,
          automationRisk: formData.automationRisk
        }
      };

      await api.post('/simulate', payload);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Simulation failed:", err);
      setError("Failed to run simulation. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const progress = step * 25;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900">Personal Behavior</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RangeField label="Sleep (Hours)" value={formData.sleep} min={0} max={24} onChange={(v) => handleInputChange('sleep', v)} />
              <SelectField
                label="Exercise"
                value={formData.exercise}
                options={['None', '1-2 times/week', '3-4 times/week', '5+ times/week']}
                onChange={(v) => handleInputChange('exercise', v)}
              />
              <RangeField label="Screen Time (Hours)" value={formData.screenTime} min={0} max={24} onChange={(v) => handleInputChange('screenTime', v)} />
              <RangeField label="Stress Level" value={formData.stressLevel} min={1} max={10} onChange={(v) => handleInputChange('stressLevel', v)} />
              <RangeField label="Productivity Hours" value={formData.productivity} min={0} max={24} onChange={(v) => handleInputChange('productivity', v)} />
              <RangeField label="Savings Percentage" value={formData.savings} min={0} max={100} unit="%" onChange={(v) => handleInputChange('savings', v)} />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900">Socio-Economic Context</h2>
            <div className="space-y-6">
              <SelectField
                label="Family Income"
                value={formData.familyIncome}
                options={['Low', 'Middle', 'High']}
                onChange={(v) => handleInputChange('familyIncome', v)}
              />
              <SelectField
                label="Support System"
                value={formData.supportSystem}
                options={['Weak', 'Moderate', 'Strong']}
                onChange={(v) => handleInputChange('supportSystem', v)}
              />
              <SelectField
                label="Access to Resources"
                value={formData.accessResources}
                options={['Limited', 'Adequate', 'Abundant']}
                onChange={(v) => handleInputChange('accessResources', v)}
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900">Environmental Factors</h2>
            <div className="space-y-6">
              <SelectField
                label="Urban / Rural"
                value={formData.urbanRural}
                options={['Urban', 'Suburban', 'Rural']}
                onChange={(v) => handleInputChange('urbanRural', v)}
              />
              <SelectField
                label="Work Culture"
                value={formData.workCulture}
                options={['Remote', 'Hybrid', 'On-site']}
                onChange={(v) => handleInputChange('workCulture', v)}
              />
              <SelectField
                label="Stress Exposure"
                value={formData.stressExposure}
                options={['Low', 'Moderate', 'High']}
                onChange={(v) => handleInputChange('stressExposure', v)}
              />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-900">Macro-Dynamic Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Economic Condition"
                value={formData.economicCondition}
                options={['Recession', 'Stable', 'Growth']}
                onChange={(v) => handleInputChange('economicCondition', v)}
              />
              <SelectField
                label="Industry Volatility"
                value={formData.industryVolatility}
                options={['Low', 'Moderate', 'High']}
                onChange={(v) => handleInputChange('industryVolatility', v)}
              />
              <SelectField
                label="Tech Adaptability"
                value={formData.techAdaptability}
                options={['Low', 'Moderate', 'High']}
                onChange={(v) => handleInputChange('techAdaptability', v)}
              />
              <SelectField
                label="Automation Risk"
                value={formData.automationRisk}
                options={['Low', 'Moderate', 'High']}
                onChange={(v) => handleInputChange('automationRisk', v)}
              />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl space-y-8">
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Step {step} of 4</p>
              <div className="h-1 w-64 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">{progress}%</span>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${step === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-gray-50 cursor-pointer'
                  }`}
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>

              {step < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {error && <p className="text-rose-500 text-sm font-semibold">{error}</p>}
                  <button
                    onClick={handleSimulationSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    {loading ? 'Running...' : 'Run Future Simulation'} <Zap className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRerunModal, setShowRerunModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [showPlannerPanel, setShowPlannerPanel] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await api.get('/dashboard');
          if (res.data) {
            setDashboardData(res.data);
            if (res.data.profile?.plan === 'premium') {
              setHasPremium(true);
            }
          }
        } catch (err) {
          console.error("Failed to load dashboard data", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        navigate('/'); // Redirect to landing if not logged in
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleRerun = () => {
    setShowRerunModal(false);
    navigate('/initialize');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* PRIMARY NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
                Future You
              </Link>
              <button
                onClick={() => setShowRerunModal(true)}
                className="text-sm font-semibold text-slate-600 hover:text-emerald-500 transition-colors flex items-center gap-2 cursor-pointer"
              >
                Re-Run Simulation
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (!hasPremium) {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${hasPremium
                  ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {hasPremium ? 'PREMIUM' : 'FREE'}
              </button>

              <Link to="/profile" className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm cursor-pointer hover:ring-2 ring-emerald-500 ring-offset-2 transition-all">
                {dashboardData?.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* RERUN MODAL */}
      <AnimatePresence>
        {showRerunModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Re-run Simulation?</h3>
              <p className="text-slate-600 text-sm mb-6">
                Re-running will overwrite your current scores and plans. Continue?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRerunModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRerun}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECONDARY NAVBAR (TABS) */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto hide-scrollbar">
            {[
              { id: 'overview', label: 'Score Overview' },
              { id: 'projection', label: 'Score Projection' },
              { id: 'risk', label: 'Future Risk Analysis' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-semibold relative whitespace-nowrap cursor-pointer transition-colors ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab.label}
                {tab.id === 'risk' && !hasPremium && (
                  <Lock className="w-3 h-3 inline-block ml-1.5 text-slate-400 mb-0.5" />
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="dashboardTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {loading ? (
          <div className="flex animate-pulse space-x-4 p-8">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-6 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="h-32 bg-slate-200 rounded-2xl"></div>
                  <div className="h-32 bg-slate-200 rounded-2xl"></div>
                  <div className="h-32 bg-slate-200 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <ScoreOverviewTab key="overview" dashboardData={dashboardData} />}
            {activeTab === 'projection' && <ScoreProjectionTab key="projection" hasPremium={hasPremium} onUpgradeClick={() => setShowUpgradeModal(true)} dashboardData={dashboardData} />}
            {activeTab === 'risk' && <FutureRiskTab key="risk" hasPremium={hasPremium} onUpgradeClick={() => setShowUpgradeModal(true)} />}
          </AnimatePresence>
        )}
      </main>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            if (!hasPremium) {
              setShowUpgradeModal(true);
            } else {
              setShowPlannerPanel(true);
            }
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-white" />
          Plan My Routine
        </button>
      </div>

      {/* PLANNER SLIDE-UP PANEL */}
      <PlannerPanel isOpen={showPlannerPanel} onClose={() => setShowPlannerPanel(false)} />

      {/* SUBSCRIPTION & UPGRADE MODALS */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          setShowSubscriptionModal(true);
        }}
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onUpgradeSuccess={() => window.location.reload()}
      />
    </div>
  );
}

function ScoreOverviewTab({ dashboardData, key }: { dashboardData: any, key?: React.Key }) {
  const [hasPlan, setHasPlan] = useState(!!dashboardData?.plan);
  const [planDate, setPlanDate] = useState(
    dashboardData?.plan?.created_at ? new Date(dashboardData.plan.created_at).toLocaleDateString() : ''
  );
  const [planItems, setPlanItems] = useState<any[]>(dashboardData?.plan?.blueprint || []);
  const [completedItems, setCompletedItems] = useState<number[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("Analyzing your life constraints with AI...");

  React.useEffect(() => {
    // Fetch AI Summary
    api.get('/ai-summary')
      .then(res => {
        if (res.data?.summary) {
          setAiSummary(res.data.summary);
        }
      })
      .catch(err => {
        console.error("Failed to load AI summary", err);
        setAiSummary("AI summary failed to load.");
      });

    // Listen for custom newly generated plans
    const handlePlanEvent = (e: any) => {
      setHasPlan(true);
      setPlanDate(e.detail.date || new Date().toLocaleDateString());
      if (e.detail.plan?.blueprint) {
        setPlanItems(e.detail.plan.blueprint);
        setCompletedItems([]);
      }
    };

    window.addEventListener('planGenerated', handlePlanEvent);
    return () => window.removeEventListener('planGenerated', handlePlanEvent);
  }, []);

  const toggleItem = async (idx: number) => {
    const isCompleted = completedItems.includes(idx);
    const newCompleted = isCompleted ? completedItems.filter(i => i !== idx) : [...completedItems, idx];
    setCompletedItems(newCompleted);

    // Trigger streak update if 100% complete
    if (newCompleted.length === planItems.length && planItems.length > 0) {
      try {
        await api.post('/update-streak', { completed_today: true });
      } catch (e) {
        console.error("Failed to update streak", e);
      }
    }
  };

  const scores = dashboardData?.simulation?.scores || {
    health: 70,
    career: 70,
    finance: 70,
    mental: 70,
    shock_preparedness: 70
  };

  const hasPremium = dashboardData?.profile?.plan === 'premium';
  const productivityData = React.useMemo(() => {
    // Generate mock productivity curve based on current streak
    const data = [];
    const today = new Date();
    let currentProd = 50;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - (89 - i)); // Past to present
      currentProd += (Math.random() * 20 - 9); // Random walk
      currentProd = Math.max(10, Math.min(100, currentProd));
      data.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        level: Math.round(currentProd)
      });
    }
    return data;
  }, []);

  const completionPct = planItems.length > 0 ? Math.round((completedItems.length / planItems.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Today's Progress Section */}
      {hasPlan && (
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Today's Progress</h2>
              <p className="text-sm text-slate-500">Last Plan Generated: {planDate}</p>
            </div>
            <div className="flex gap-3">
              <button className="text-sm font-semibold text-slate-600 hover:text-emerald-500 transition-colors border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                View Plan
              </button>
              <button
                onClick={() => document.querySelector<HTMLButtonElement>('.fixed.bottom-6.right-6 > button')?.click()}
                className="text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors px-4 py-2 rounded-xl shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                Regenerate Plan
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Daily Completion</span>
              <span className="text-sm font-bold text-emerald-500">{completionPct}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {planItems.map((item, idx) => {
                const isDone = completedItems.includes(idx);
                return (
                  <div key={idx} onClick={() => toggleItem(idx)} className="flex flex-col gap-1 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white group-hover:border-emerald-500'}`}>
                        {isDone && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-emerald-600'}`}>
                        {item.activity}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 ml-8 font-medium">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Advanced Productivity Curve (Premium) */}
      <section className={`bg-white rounded-2xl shadow-soft border border-gray-100 p-6 relative overflow-hidden ${!hasPremium ? 'select-none' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">90-Day Productivity</h2>
          <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded-md">PREMIUM</span>
        </div>
        <div className={`transition-all ${!hasPremium ? 'blur-md pointer-events-none' : ''}`}>
          <div className="text-xs text-slate-500 mb-6">Your daily execution efficiency over the last 90 days</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="level" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" name="Efficiency %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {!hasPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
            <div className="bg-white p-4 rounded-full shadow-lg mb-4">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Feature</h3>
            <p className="text-sm text-slate-600 mb-6 text-center max-w-xs">Upgrade to unlock historical 90-day productivity tracking.</p>
            <button onClick={() => document.querySelector<HTMLButtonElement>('.fixed.bottom-6.right-6 > button')?.click()} className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-colors cursor-pointer">
              Upgrade Now
            </button>
          </div>
        )}
      </section>

      {/* Score Cards */}
      <h2 className="text-xl font-bold text-slate-900">Life Trajectory Scores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScoreCard title="Health Score" score={scores.health} status={scores.health > 75 ? "Good" : "Action Needed"} trend="+2%" color="emerald" />
        <ScoreCard title="Career Score" score={scores.career} status={scores.career > 75 ? "Stable" : "Vulnerable"} trend="+5%" color="blue" />
        <ScoreCard title="Financial Stability" score={scores.finance} status={scores.finance > 75 ? "Stable" : "Action Needed"} trend="-1%" color="amber" />
        <ScoreCard title="Mental Wellness" score={scores.mental} status={scores.mental > 75 ? "Excellent" : "Action Needed"} trend="+4%" color="purple" />
        <ScoreCard title="Shock Preparedness" score={scores.shock_preparedness} status={scores.shock_preparedness > 75 ? "Resilient" : "Vulnerable"} trend="0%" color="rose" />
      </div>

      {/* AI Summary Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold">AI Trajectory Summary</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-base max-w-4xl">
            {aiSummary}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ title, score, status, trend, color }: { title: string, score: number, status: string, trend: string, color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    amber: 'text-amber-500 bg-amber-50 border-amber-100',
    purple: 'text-purple-500 bg-purple-50 border-purple-100',
    rose: 'text-rose-500 bg-rose-50 border-rose-100',
  };

  const isPositive = trend.startsWith('+');
  const isNeutral = trend.startsWith('0');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex items-end gap-4 mb-4">
        <span className="text-5xl font-bold text-slate-900 leading-none">{score}</span>
        <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${colorMap[color]}`}>
          {status}
        </span>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-500' : isNeutral ? 'text-slate-400' : 'text-rose-500'}`}>
          {trend}
        </span>
        <span className="text-xs text-slate-400 font-medium">vs Last Month</span>
      </div>
    </div>
  );
}

function ScoreProjectionTab({ hasPremium, onUpgradeClick, dashboardData, key }: { hasPremium: boolean, onUpgradeClick: () => void, dashboardData: any, key?: React.Key }) {
  const baseScores = dashboardData?.simulation?.scores || { health: 70, career: 70, finance: 70 };

  // Generate mathematically modeled bounds for charting
  const data = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const arr = [];
    let h = baseScores.health || 70;
    let c = baseScores.career || 70;
    let f = baseScores.finance || 70;

    for (let i = 0; i <= 10; i++) {
      arr.push({
        year: (currentYear + i).toString(),
        health: Math.min(100, Math.round(h)),
        career: Math.min(100, Math.round(c)),
        finance: Math.min(100, Math.round(f))
      });
      // Simulate compounding growth or decline
      h += (h > 60 ? 1.5 : -1);
      c += (c > 60 ? 2 : -0.5);
      f += (f > 60 ? 2.5 : -1.5);
    }
    return arr;
  }, [baseScores]);

  const handleExportPDF = async () => {
    const input = document.getElementById('premium-charts-container');
    if (!input) return;
    try {
      // Capture the DOM node
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Calculate centering
      const yOffset = (pdf.internal.pageSize.getHeight() - pdfHeight) / 2;

      pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
      pdf.save('Future_You_10_Year_Blueprint.pdf');
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Free View: 5-Year Projection */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">5-Year Baseline Projection</h3>
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.slice(0, 6)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Health" />
              <Line type="monotone" dataKey="career" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Career" />
              <Line type="monotone" dataKey="finance" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Finance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Premium Stats Space */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Premium Dashboards</h3>
        {hasPremium && (
          <button
            onClick={handleExportPDF}
            className="text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-xl border border-emerald-200 shadow-sm cursor-pointer flex items-center gap-2"
          >
            📥 Export 10-Year PDF
          </button>
        )}
      </div>

      <div id="premium-charts-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50 p-6 -mx-6 rounded-3xl">
        <div className={`bg-white p-6 rounded-2xl shadow-soft border border-gray-100 relative overflow-hidden ${!hasPremium ? 'select-none' : ''}`}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Optimized 10-Year Path</h3>
          <div className={`h-64 w-full transition-all ${!hasPremium ? 'blur-md pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Line type="monotone" dataKey="finance" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} name="Compounded Wealth" />
                <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Health Optimization" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {!hasPremium && <PremiumLockOverlay onUpgradeClick={onUpgradeClick} />}
        </div>

        <div className={`bg-white p-6 rounded-2xl shadow-soft border border-gray-100 relative overflow-hidden ${!hasPremium ? 'select-none' : ''}`}>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Life Balance Radar</h3>
          <div className={`h-64 w-full transition-all ${!hasPremium ? 'blur-md pointer-events-none' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Health', A: baseScores.health || 70, fullMark: 100 },
                { subject: 'Career', A: baseScores.career || 70, fullMark: 100 },
                { subject: 'Finance', A: baseScores.finance || 70, fullMark: 100 },
                { subject: 'Mental', A: baseScores.mental || 70, fullMark: 100 },
                { subject: 'Shock P.', A: baseScores.shock_preparedness || 70, fullMark: 100 }
              ]}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Balance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {!hasPremium && <PremiumLockOverlay onUpgradeClick={onUpgradeClick} />}
        </div>
      </div>
    </motion.div>
  );
}

function FutureRiskTab({ hasPremium, onUpgradeClick, key }: { hasPremium: boolean, onUpgradeClick: () => void, key?: React.Key }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (hasPremium) {
      api.get('/future-risks')
        .then(res => {
          if (res.data?.risks) {
            setRisks(res.data.risks);
          }
        })
        .catch(err => console.error("Failed to load risks", err))
        .finally(() => setLoading(false));
    }
  }, [hasPremium]);

  if (!hasPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="h-[60vh] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-emerald-100 rounded-3xl bg-emerald-50/30"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Advanced Risk Analysis Locked</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
          Upgrade to Premium to unlock multi-scenario shock modeling, including financial crisis impact, technological disruption, and health resilience tracking.
        </p>
        <button onClick={onUpgradeClick} className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer">
          Upgrade to Premium
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-slate-900 mb-2">Shock Scenario Simulations</h2>
      {loading ? (
        <div className="flex items-center gap-3 text-emerald-600 font-medium p-6 bg-emerald-50 rounded-2xl w-fit">
          <Zap className="w-5 h-5 animate-pulse" />
          AI is generating custom life disruption models...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {risks.map((r, i) => (
            <RiskCard key={i} title={r.title} score={r.score} impact={r.impact} recovery={r.recovery} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RiskCard({ title, score, impact, recovery, key }: { title: string, score: number, impact: string, recovery: string, key?: React.Key }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-bold text-slate-900 w-2/3">{title}</h3>
        <div className={`px-2 py-1 rounded-md text-xs font-bold ${score > 70 ? 'bg-emerald-50 text-emerald-600' : score > 50 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
          }`}>
          Score: {score}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Impact Level</span>
          <span className="font-semibold text-slate-900">{impact}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-medium">Est. Recovery</span>
          <span className="font-semibold text-slate-900">{recovery}</span>
        </div>
      </div>
    </div>
  );
}

function PremiumLockOverlay({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  return (
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4 text-center">
      <Lock className="w-8 h-8 text-slate-400 mb-3" />
      <h4 className="font-bold text-slate-900 mb-1">Premium Feature</h4>
      <p className="text-xs text-slate-500 mb-4 max-w-[200px]">Unlock lifetime projections and advanced radar charts.</p>
      <button onClick={onUpgradeClick} className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
        Upgrade
      </button>
    </div>
  );
}

function PlannerPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [plannerType, setPlannerType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<any | null>(null);

  const [localData, setLocalData] = useState({
    // Generic
    wakeTime: '07:00 AM', sleepTime: '11:00 PM',
    // Study
    studyCollegeStart: '09:00 AM', studyCollegeEnd: '03:00 PM',
    // Routine
    routineStatus: 'Student', routinePace: 'Steady',
    // Work
    workStart: '09:00 AM', workEnd: '05:00 PM', commuteDuration: 'None', industry: 'Tech',
    // Stress
    stressSource: 'Work', recoveryActivity: 'Exercise',
    // Financial
    finTarget: '500', finInterval: 'Monthly', incomeFocus: 'Salary', frugality: 'Moderate',
    // All in One
    primaryGoal: 'Wealth', exerciseDays: '3-4'
  });

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const payload = {
        intensity_mode: plannerType || 'all',
        wake_time: localData.wakeTime,
        sleep_time: localData.sleepTime,
        college_timing_start: localData.studyCollegeStart,
        college_timing_end: localData.studyCollegeEnd,
        routine_status: localData.routineStatus,
        routine_pace: localData.routinePace,
        work_start: localData.workStart,
        work_end: localData.workEnd,
        commute_duration: localData.commuteDuration,
        industry: localData.industry,
        stress_source: localData.stressSource,
        recovery_activity: localData.recoveryActivity,
        fin_target: localData.finTarget,
        fin_interval: localData.finInterval,
        income_focus: localData.incomeFocus,
        frugality: localData.frugality,
        primary_goal: localData.primaryGoal,
        exercise_days: localData.exerciseDays
      };
      const res = await api.post('/generate-plan', payload);

      // Instead of dispatching immediately, show the preview modal
      setPreviewPlan({
        type: plannerType,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        plan: res.data
      });
    } catch (err) {
      console.error("Failed to generate plan:", err);
      alert("Plan generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity cursor-pointer"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto h-[80vh] bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Grab Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 bg-white cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="px-8 pb-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                {plannerType ? 'Configure Planner' : 'Select Plan Type'}
              </h2>
              {plannerType && (
                <button
                  onClick={() => setPlannerType(null)}
                  className="text-sm font-semibold text-slate-500 hover:text-emerald-500 cursor-pointer"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {!plannerType ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'study', title: 'Study Planner', icon: '📚', desc: 'Schedules based on college & sleep.' },
                    { id: 'routine', title: 'Daily Routine', icon: '🌅', desc: 'Structure day by profession.' },
                    { id: 'work', title: 'Work Planner', icon: '💼', desc: 'Deep work and admin blocks.' },
                    { id: 'stress', title: 'Stress Relief', icon: '🧘', desc: 'Inserts micro breaks and recovery.' },
                    { id: 'financial', title: 'Economical Planner', icon: '💰', desc: 'Generate savings breakdown.' },
                    { id: 'all', title: 'All-in-One Blueprint', icon: '✨', desc: 'Integrates all aspects seamlessly.' },
                  ].map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => setPlannerType(plan.id)}
                      className="p-5 border border-gray-100 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group bg-white"
                    >
                      <div className="text-3xl mb-3">{plan.icon}</div>
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{plan.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{plan.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Dynamic Form Placeholder based on plannerType */}
                  {plannerType === 'study' && (
                    <>
                      <SelectField label="Wake Up Time" value={localData.wakeTime} options={['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM']} onChange={(v) => setLocalData({ ...localData, wakeTime: v })} />
                      <SelectField label="Sleep Time" value={localData.sleepTime} options={['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM']} onChange={(v) => setLocalData({ ...localData, sleepTime: v })} />
                      <div className="grid grid-cols-2 gap-4">
                        <SelectField label="College Start" value={localData.studyCollegeStart} options={['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM']} onChange={(v) => setLocalData({ ...localData, studyCollegeStart: v })} />
                        <SelectField label="College End" value={localData.studyCollegeEnd} options={['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM']} onChange={(v) => setLocalData({ ...localData, studyCollegeEnd: v })} />
                      </div>
                    </>
                  )}
                  {plannerType === 'routine' && (
                    <>
                      <SelectField label="Wake Up Time" value={localData.wakeTime} options={['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM']} onChange={(v) => setLocalData({ ...localData, wakeTime: v })} />
                      <SelectField label="Sleep Time" value={localData.sleepTime} options={['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM']} onChange={(v) => setLocalData({ ...localData, sleepTime: v })} />
                      <SelectField label="Current Status" value={localData.routineStatus} options={['Student', 'Professional', 'Freelancer', 'None']} onChange={(v) => setLocalData({ ...localData, routineStatus: v })} />
                      <SelectField label="Work Pace" value={localData.routinePace} options={['Steady', 'Bursts', 'Deep Work Only']} onChange={(v) => setLocalData({ ...localData, routinePace: v })} />
                    </>
                  )}
                  {plannerType === 'work' && (
                    <>
                      <SelectField label="Wake Up Time" value={localData.wakeTime} options={['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM']} onChange={(v) => setLocalData({ ...localData, wakeTime: v })} />
                      <SelectField label="Sleep Time" value={localData.sleepTime} options={['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM']} onChange={(v) => setLocalData({ ...localData, sleepTime: v })} />
                      <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Work Start" value={localData.workStart} options={['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM']} onChange={(v) => setLocalData({ ...localData, workStart: v })} />
                        <SelectField label="Work End" value={localData.workEnd} options={['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM']} onChange={(v) => setLocalData({ ...localData, workEnd: v })} />
                      </div>
                      <SelectField label="Commute Duration" value={localData.commuteDuration} options={['None', '30m', '1h', '1.5h']} onChange={(v) => setLocalData({ ...localData, commuteDuration: v })} />
                      <SelectField label="Industry" value={localData.industry} options={['Tech', 'Finance', 'Creative', 'Healthcare', 'Other']} onChange={(v) => setLocalData({ ...localData, industry: v })} />
                    </>
                  )}
                  {plannerType === 'stress' && (
                    <>
                      <SelectField label="Wake Up Time" value={localData.wakeTime} options={['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM']} onChange={(v) => setLocalData({ ...localData, wakeTime: v })} />
                      <SelectField label="Sleep Time" value={localData.sleepTime} options={['09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM']} onChange={(v) => setLocalData({ ...localData, sleepTime: v })} />
                      <SelectField label="Primary Stress Source" value={localData.stressSource} options={['Work', 'Personal', 'Financial', 'Unknown']} onChange={(v) => setLocalData({ ...localData, stressSource: v })} />
                      <SelectField label="Favorite Recovery" value={localData.recoveryActivity} options={['Exercise', 'Meditation', 'Reading', 'Gaming / TV', 'Socializing']} onChange={(v) => setLocalData({ ...localData, recoveryActivity: v })} />
                    </>
                  )}
                  {plannerType === 'financial' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Savings Target ($/Mo)</label>
                        <input type="number" value={localData.finTarget} onChange={(e) => setLocalData({ ...localData, finTarget: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm" />
                      </div>
                      <SelectField label="Planning Interval" value={localData.finInterval} options={['Daily', 'Weekly', '10 Days', 'Monthly']} onChange={(v) => setLocalData({ ...localData, finInterval: v })} />
                      <SelectField label="Income Focus" value={localData.incomeFocus} options={['Salary', 'Freelance', 'Side-Hustle', 'Investments']} onChange={(v) => setLocalData({ ...localData, incomeFocus: v })} />
                      <SelectField label="Frugality Level" value={localData.frugality} options={['Lenient', 'Moderate', 'Strict']} onChange={(v) => setLocalData({ ...localData, frugality: v })} />
                    </>
                  )}
                  {plannerType === 'all' && (
                    <>
                      <SelectField label="Wake Up Time" value={localData.wakeTime} options={['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM']} onChange={(v) => setLocalData({ ...localData, wakeTime: v })} />
                      <SelectField label="Sleep Time" value={localData.sleepTime} options={['10:00 PM', '11:00 PM', '12:00 AM', '01:00 AM']} onChange={(v) => setLocalData({ ...localData, sleepTime: v })} />
                      <SelectField label="Primary Life Goal" value={localData.primaryGoal} options={['Wealth', 'Career Progression', 'Physical Health', 'Mental Peace']} onChange={(v) => setLocalData({ ...localData, primaryGoal: v })} />
                      <SelectField label="Weekly Exercise" value={localData.exerciseDays} options={['0-2 Days', '3-4 Days', '5-7 Days']} onChange={(v) => setLocalData({ ...localData, exerciseDays: v })} />
                    </>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mt-8 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                        Generating...
                      </span>
                    ) : (
                      <><Zap className="w-5 h-5" /> Generate Plan</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Plan Preview Overlay */}
      <AnimatePresence>
        {previewPlan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Your Generated Plan</h2>
                  <p className="text-sm text-slate-500 mt-1">Review your AI-generated {previewPlan.type} schedule.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-bold">
                  {previewPlan.plan.intensity_mode}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 mb-6">
                {previewPlan.plan.blueprint.map((block: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-start">
                    <div className="w-24 flex-shrink-0 text-right">
                      <span className="text-sm font-bold text-slate-700">{block.time.split(' - ')[0]}</span>
                    </div>
                    <div className="w-1 h-full bg-emerald-200 rounded-full mx-2 self-stretch min-h-[40px]"></div>
                    <div className="flex-1 pb-2">
                      <h4 className="font-bold text-slate-900">{block.activity}</h4>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {block.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPreviewPlan(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  onClick={() => {
                    const event = new CustomEvent('planGenerated', { detail: previewPlan });
                    window.dispatchEvent(event);
                    setPreviewPlan(null);
                    onClose();
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Confirm & Add to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

function RangeField({ label, value, min, max, unit = '', onChange }: { label: string, value: number, min: number, max: number, unit?: string, onChange: (v: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
        <span className="text-sm font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm appearance-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-8 rounded-2xl shadow-soft border border-gray-50 hover:border-emerald-100 transition-colors duration-300"
    >
      <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function PremiumUpgradeModal({ isOpen, onClose, onUpgrade }: { isOpen: boolean, onClose: () => void, onUpgrade: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-gray-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Upgrade Your Plan</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-3xl leading-none">&times;</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Card: Free Plan */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border border-gray-100 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Free Plan</h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Current Plan</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    '5-Year Score Projection',
                    'Basic AI Summary',
                    'Limited Graph Access',
                    'No Risk Analysis',
                    'No Routine Planner'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${i < 3 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <span className={i >= 3 ? 'text-slate-400' : ''}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button disabled className="w-full py-4 text-sm font-bold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed">
                  Current Plan
                </button>
              </div>

              {/* Right Card: Premium Plan */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-soft border-2 border-emerald-500 flex flex-col relative">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Recommended
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Premium Plan</h3>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    'Lifetime Score Projection',
                    'Advanced Graphs (Radar + Compounding)',
                    'Future Risk Analysis',
                    'All Routine Planners',
                    'All-in-One Life Blueprint',
                    'Daily Progress Tracking',
                    'Priority AI Analysis'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                      <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={onUpgrade} className="w-full py-4 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                  Upgrade Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SubscriptionModal({ isOpen, onClose, onUpgradeSuccess }: { isOpen: boolean, onClose: () => void, onUpgradeSuccess: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePremiumSubscribe = async () => {
    setIsProcessing(true);
    try {
      await api.post('/upgrade');
      onUpgradeSuccess(); // Notify parent to refresh premium UI
      onClose();
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to process mock subscription.");
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    { name: 'Monthly', price: '₹49' },
    { name: 'Quarterly', price: '₹129' },
    { name: 'Half-Yearly', price: '₹249' },
    { name: 'Annual', price: '₹499' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Choose Subscription Duration</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-3xl leading-none">&times;</button>
            </div>

            <div className="space-y-4">
              {plans.map((plan, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-500 hover:shadow-sm transition-all bg-gray-50/50">
                  <span className="font-semibold text-slate-700">{plan.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">{plan.price}</span>
                    <button
                      onClick={handlePremiumSubscribe}
                      disabled={isProcessing}
                      className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {isProcessing ? 'Processing...' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ProfilePage() {
  const [hasPremium, setHasPremium] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editOccupation, setEditOccupation] = useState('Professional');
  const [editLocation, setEditLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      if (res.data) {
        setDashboardData(res.data);
        if (res.data.profile?.plan === 'premium') {
          setHasPremium(true);
        }

        // Initialize form states
        if (res.data.profile) {
          setEditName(res.data.profile.name || '');
          setEditAge(res.data.profile.age || '');
          setEditOccupation(res.data.profile.occupation || 'Professional');
          setEditLocation(res.data.profile.location || '');
        }
      }
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDashboardData();
      } else {
        setLoading(false);
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Generic modal state for actions and confirmations
  const [actionModal, setActionModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm?: () => void, confirmText?: string }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleAction = (title: string, message: string, onConfirm?: () => void, confirmText?: string) => {
    setActionModal({ isOpen: true, title, message, onConfirm, confirmText });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await api.post('/profile', {
        name: editName,
        email: dashboardData?.profile?.email || '',
        plan: dashboardData?.profile?.plan || 'free',
        age: editAge,
        occupation: editOccupation,
        location: editLocation
      });
      handleAction('Changes Saved', 'Your account information has been updated successfully.');
      await fetchDashboardData(); // Refresh UI profile block
    } catch (err) {
      console.error("Failed to save profile", err);
      handleAction('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const res = await api.get('/export-data');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "futureyou_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      handleAction('Download Complete', 'Your Future You data archive has been downloaded onto your device.');
    } catch (err) {
      console.error("Failed to export data", err);
      handleAction('Error', 'Failed to compile data archive. Please try again.');
    }
  };

  const handleResetData = async () => {
    handleAction(
      'Warning: Data Reset',
      'Are you sure you want to permanently reset all simulation data and plans? This action cannot be undone.',
      async () => {
        try {
          await api.delete('/reset-data');
          handleAction('Reset Successful', 'Your simulation config data, logs, and plans have been wiped from our system.');
          await fetchDashboardData(); // Refresh to empty UI
        } catch (err) {
          console.error("Failed to wipe data", err);
          handleAction('Error', 'Failed to reset data. Please contact support.');
        }
      },
      'Reset Data'
    );
  };

  const handleCancelSubscription = async () => {
    try {
      await api.post('/cancel-subscription');
      setHasPremium(false);
      handleAction('Subscription Canceled', 'Your premium subscription has been canceled. You have reverted to the Free plan. We hope you reconsider!');
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to cancel subscription", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    handleAction(
      'Warning: Delete Account',
      'Are you completely sure you want to delete your Future You account? All data will be lost immediately.',
      async () => {
        try {
          await auth.currentUser!.delete();
          navigate('/');
        } catch (err) {
          console.error("Failed to delete account auth wrapper", err);
          handleAction('Error', 'Firebase auth restriction prevented deletion. Please sign-in again and retry.');
        }
      },
      'Delete Account'
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex animate-pulse space-x-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const profile = dashboardData?.profile || { name: 'User', email: 'user@example.com' };
  const streak = dashboardData?.streak || { current_streak: 0, longest_streak: 0 };
  const plan = dashboardData?.plan;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer mr-4"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Profile</h1>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">

        {/* SECTION 1: PROFILE OVERVIEW */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-2xl shadow-inner cursor-pointer hover:ring-4 ring-emerald-500/20 transition-all uppercase">
                {profile.name.charAt(0)}
              </div>
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs">✏️</div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{profile.name}</h2>
              <p className="text-sm text-slate-500 mb-2">{profile.email}</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${hasPremium ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>
                  {hasPremium ? 'PREMIUM' : 'FREE'} PLAN
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button
              onClick={() => handleAction('Edit Profile', 'Profile editing mode would open here.')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer text-center"
            >
              Edit Profile
            </button>
            {!hasPremium && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </section>

        {/* SECTION 2: ACCOUNT INFORMATION */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-bold text-slate-900">Account Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input type="email" defaultValue={profile.email} disabled className="w-full px-4 py-3 bg-gray-100/50 border border-gray-100 rounded-xl font-medium text-slate-400 focus:outline-none cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Age (Optional)</label>
                <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} placeholder="e.g. 28" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
              <SelectField label="Occupation" value={editOccupation} options={['Student', 'Professional', 'Both', 'Other']} onChange={(v) => setEditOccupation(v)} />
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location (Optional)</label>
                <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} placeholder="City, Country" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: SIMULATION OVERVIEW */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Simulation Overview</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Active</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Last Simulation</p>
                <p className="font-semibold text-slate-900">Today</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Total Runs</p>
                <p className="font-semibold text-slate-900">3</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Projection Mode</p>
                <p className="font-semibold text-slate-900">{hasPremium ? 'Lifetime' : '5-Year Baseline'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Plan Generated</p>
                <p className="font-semibold text-slate-900">{plan ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/initialize')} className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex-1 md:flex-none text-center">
                Re-Run Simulation
              </button>
              <button
                onClick={() => handleAction('Compare Simulations', 'Opening comparison view to analyze differences between your past projections.')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex-1 md:flex-none text-center"
              >
                Compare with Previous
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 4: SUBSCRIPTION & PLAN */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Subscription & Plan</h3>
          </div>
          <div className="p-6">
            {!hasPremium ? (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Current Plan: Free</h4>
                  <p className="text-sm text-slate-500 max-w-md">You are currently on the Free plan. Upgrade to unlock lifetime projections, advanced risk analysis, and comprehensive routine planners.</p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-6 py-3 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap cursor-pointer"
                >
                  Upgrade to Premium
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-slate-900">Premium Plan</h4>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 flex items-center justify-center rounded-md border border-emerald-100 h-6">ACTIVE</span>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-slate-400 font-medium mb-1">Billing Cycle</p>
                      <p className="font-semibold text-slate-900">Annual</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium mb-1">Next Billing Date</p>
                      <p className="font-semibold text-slate-900">Oct 24, 2027</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setShowSubscriptionModal(true)}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Change Plan
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer text-center whitespace-nowrap"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 5: LIFE BLUEPRINT STATUS */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center gap-2 bg-slate-50/50">
            <Zap className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-900">Life Blueprint Status</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Last Generated</p>
                <p className="font-semibold text-slate-900">{plan ? new Date(plan.created_at).toLocaleDateString() : 'Never'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Intensity Mode</p>
                <p className="font-semibold text-emerald-600">{plan ? plan.intensity_mode : 'None'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Avg Daily Comp.</p>
                <p className="font-semibold text-slate-900">{plan ? '68%' : '0%'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">Consistency</p>
                <p className="font-semibold text-slate-900">Good</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                View Current Plan
              </button>
              <button
                onClick={() => handleAction('Regenerate Plan', 'AI is analyzing your latest data to create a newly optimized behavioral blueprint...')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer text-center"
              >
                Regenerate Plan
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 6: STREAK & CONSISTENCY */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Consistency & Streak</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">🔥</span>
                <p className="text-3xl font-bold text-orange-600 mb-1">{streak.current_streak}</p>
                <p className="text-xs font-bold text-orange-700/70 uppercase tracking-widest leading-tight">Current Streak</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">👑</span>
                <p className="text-3xl font-bold text-slate-700 mb-1">{streak.longest_streak}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight">Longest Streak</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">📈</span>
                <p className="text-3xl font-bold text-emerald-600 mb-1">82<span className="text-lg">%</span></p>
                <p className="text-xs font-bold text-emerald-700/70 uppercase tracking-widest leading-tight">Weekly Habit</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <span className="text-2xl mb-1">📅</span>
                <p className="text-3xl font-bold text-blue-600 mb-1">75<span className="text-lg">%</span></p>
                <p className="text-xs font-bold text-blue-700/70 uppercase tracking-widest leading-tight">Monthly Avg</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: PRIVACY & DATA */}
        <section className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden mb-12">
          <div className="p-6 border-b border-gray-50 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">Privacy & Data</h3>
          </div>
          <div className="p-2">
            <div
              onClick={() => setEmailNotifications(!emailNotifications)}
              className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-500 hidden sm:block">Receive weekly simulation insights and plan updates</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative cursor-pointer outline-none mr-2 flex-shrink-0 transition-colors ${emailNotifications ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${emailNotifications ? 'right-1' : 'left-1'}`} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Download My Data</p>
                <p className="text-sm text-slate-500 hidden sm:block">Get a copy of your simulation scores and generated plans</p>
              </div>
              <button
                onClick={handleDownloadData}
                className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg group-hover:bg-white group-hover:border-slate-300 px-4 py-2 transition-all whitespace-nowrap w-fit cursor-pointer"
              >
                Download .JSON
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-rose-50/50 rounded-xl transition-colors cursor-pointer group gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-rose-600">Reset Simulation Data</p>
                <p className="text-sm text-rose-500/80 hidden sm:block">Clear all past projections and plans. This cannot be undone.</p>
              </div>
              <button
                onClick={handleResetData}
                className="text-sm font-semibold text-rose-600 bg-white border border-rose-200 px-4 py-2 rounded-lg group-hover:bg-rose-50 transition-colors whitespace-nowrap w-fit cursor-pointer"
              >
                Reset Data
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-rose-50/50 rounded-xl transition-colors cursor-pointer group gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-rose-600">Delete Account</p>
                <p className="text-sm text-rose-500/80 hidden sm:block">Permanently delete your account and all associated data</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="text-sm font-semibold text-white bg-rose-500 px-4 py-2 rounded-lg group-hover:bg-rose-600 transition-colors whitespace-nowrap w-fit cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 bg-slate-100 px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Sign Out / Logout
            </button>
          </div>
        </section>

      </main>

      {/* Upgrades */}
      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          setShowSubscriptionModal(true);
        }}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onUpgradeSuccess={() => window.location.reload()}
      />

      {/* Generic Action Modal */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-3">{actionModal.title}</h3>
              <p className="text-slate-600 mb-6">{actionModal.message}</p>
              <div className="flex gap-3">
                {actionModal.onConfirm ? (
                  <>
                    <button
                      onClick={() => setActionModal({ isOpen: false, title: '', message: '' })}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        actionModal.onConfirm?.();
                        setActionModal({ isOpen: false, title: '', message: '' });
                      }}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      {actionModal.confirmText || 'Confirm'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setActionModal({ isOpen: false, title: '', message: '' })}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Okay
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
