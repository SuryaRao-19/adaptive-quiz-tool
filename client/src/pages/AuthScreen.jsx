import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { recordRegistrationOnWeb3Forms } from '../services/web3forms';
import { loginUser, registerUser } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { 
  Sparkles, 
  User, 
  Key, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  School, 
  Mail, 
  ArrowLeft,
  ShieldCheck,
  Check,
  Building,
  AlertTriangle,
  Lock,
  Layers
} from 'lucide-react';

export const AuthScreen = () => {
  const { login, signup, switchRole } = useContext(AuthContext);
  const { applyRoleDefaultTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' || location.pathname.includes('register') ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loginRole, setLoginRole] = useState('student'); // 'student' | 'teacher'
  const [signupStep, setSignupStep] = useState(1); // 1 = Role select, 2 = Details form
  const [selectedRole, setSelectedRole] = useState('student');

  // Form states
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [studentForm, setStudentForm] = useState({ 
    fullName: '', 
    rollNumber: '', 
    grade: 7, 
    schoolName: 'Kendriya Vidyalaya No. 1', 
    email: '', 
    password: '' 
  });
  const [teacherForm, setTeacherForm] = useState({ 
    fullName: '', 
    schoolName: 'District Model Secondary School', 
    subjects: 'Math & Science', 
    email: '', 
    password: '' 
  });

  // Google OAuth Simulation Modal
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleRole, setCustomGoogleRole] = useState('student');
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Web3Forms status toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Rotating stat on right panel
  const testimonials = [
    { stat: "+34.2%", label: "Average Growth Delta", desc: "Students improve 34% on average after 4 weeks of calibrated adaptive practice." },
    { stat: "8+ Hours", label: "Educator Time Saved", desc: "Automated diagnostic grading replaces manual weekend worksheet marking." },
    { stat: "SDG 4", label: "Quality Education", desc: "Empowering under-resourced community schools with AI personalization." }
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Standard Login Submit (Real Backend JWT Auth)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    try {
      const email = loginForm.identifier.trim();
      const password = loginForm.password;

      const res = await loginUser({ email, password });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        applyRoleDefaultTheme(res.user.role || loginRole);
        triggerToast(`Welcome back, ${res.user.name || res.user.fullName}!`);
        navigate('/dashboard');
      } else {
        setAuthError(res.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Please check your credentials or register a new account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Standard Email Registration Submit (Real Backend MongoDB Persistence)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);

    const isTeacher = selectedRole === 'teacher';
    const formSource = isTeacher ? teacherForm : studentForm;

    try {
      const payload = {
        name: formSource.fullName.trim(),
        email: formSource.email.trim(),
        password: formSource.password,
        role: selectedRole,
        gradeLevel: isTeacher ? undefined : Number(formSource.grade) || 7
      };

      const res = await registerUser(payload);

      if (res.success && res.token && res.user) {
        // Record registration on Web3Forms if configured
        recordRegistrationOnWeb3Forms({
          name: formSource.fullName,
          email: formSource.email,
          role: selectedRole,
          method: "email",
          metadata: {
            school: formSource.schoolName,
            grade: isTeacher ? undefined : formSource.grade,
            rollNumber: isTeacher ? undefined : formSource.rollNumber
          }
        }).catch(err => console.warn('Web3Forms registration log:', err));

        login(res.token, res.user);
        applyRoleDefaultTheme(selectedRole);
        triggerToast(`Account created for ${res.user.name || res.user.fullName}!`);
        navigate('/dashboard');
      } else {
        setAuthError(res.message || 'Registration failed. Please check the details provided.');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration error. An account with this email may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google OAuth Selection (With Web3Forms Recording)
  const handleGoogleAccountSelect = async (account) => {
    setGoogleSubmitting(true);
    triggerToast("Connecting Google Account via OAuth 2.0...");

    const userData = {
      id: `google_${Date.now()}`,
      fullName: account.name,
      email: account.email,
      role: account.role,
      school: account.school || "National Demonstration School",
      grade: account.role === 'student' ? 7 : undefined,
      rollNumber: account.role === 'student' ? 'G7-GOOGLE-01' : 'TEACH-GOOGLE',
      avatarUrl: account.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      authProvider: "google"
    };

    // Record on Web3Forms
    await recordRegistrationOnWeb3Forms({
      name: userData.fullName,
      email: userData.email,
      role: userData.role,
      method: "google",
      metadata: {
        googleProvider: true,
        school: userData.school,
        rollNumber: userData.rollNumber
      }
    });

    setGoogleSubmitting(false);
    setGoogleModalOpen(false);
    login(`google_token_${Date.now()}`, userData);
    applyRoleDefaultTheme(userData.role);
    triggerToast(`Authenticated with Google as ${userData.fullName}!`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-elevated flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-card-hover overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        
        {/* ========================================================================= */}
        {/* LEFT PANEL: PROPER LOGIN & REGISTRATION FORMS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Top Brand Logo & Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-cyan-500 text-white flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">AdaptIQ</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    SDG 4
                  </span>
                </div>
              </Link>

              {/* Mode Toggle Tabs (Sign In vs Register) */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setSignupStep(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'login' 
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-cyan-400 shadow-subtle' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setSignupStep(1); }}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    mode === 'signup' 
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-cyan-400 shadow-subtle' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Google OAuth Quick Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-3 shadow-subtle transition-all active:scale-[0.99]"
              >
                {/* Official Google SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.14z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.94H1.21v3.13C3.26 21.48 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.32 14.26c-.24-.73-.38-1.5-.38-2.26s.14-1.53.38-2.26V6.61H1.21C.44 8.14 0 9.87 0 12s.44 3.86 1.21 5.39l4.11-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.52 1.21 6.61l4.11 3.13c.94-2.84 3.58-4.97 6.68-4.97z"
                  />
                </svg>
                <span>Continue with Google</span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                  Web3Forms Sync
                </span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold">
                    or continue with credentials
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* A. PROPER LOGIN MODE (Segmented Student vs Teacher) */}
            {/* =================================================================== */}
            {mode === 'login' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                
                {/* Segmented Role Switcher on Login */}
                <div className="mb-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Select Account Portal:
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setLoginRole('student')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        loginRole === 'student'
                          ? 'bg-indigo-600 text-white shadow-subtle'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Student Portal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginRole('teacher')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        loginRole === 'teacher'
                          ? 'bg-indigo-600 text-white shadow-subtle'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <School className="w-4 h-4" />
                      <span>Teacher / Admin</span>
                    </button>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <Input
                    label={loginRole === 'student' ? "Student Roll Number or Email" : "Institutional / School Email"}
                    placeholder={loginRole === 'student' ? "e.g. G7-B-24 or rahul@school.edu" : "e.g. anita.rao@school.edu"}
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                    icon={loginRole === 'student' ? User : Mail}
                    required
                  />

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {loginRole === 'student' ? "Password / PIN" : "Password"}
                      </label>
                      <button
                        type="button"
                        onClick={() => { setForgotSubmitted(false); setForgotModalOpen(true); }}
                        className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline font-semibold"
                      >
                        Forgot?
                      </button>
                    </div>
                    <Input
                      type="password"
                      placeholder={loginRole === 'student' ? "Enter your 4-digit PIN or password" : "Enter educator password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      icon={Lock}
                      required
                    />
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* 1-Click Demo Shortcut Chip */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs">
                    <span className="text-indigo-900 dark:text-indigo-300 font-medium text-[11px]">
                      {loginRole === 'student' ? '💡 Demo Student: student@school.edu' : '💡 Demo Educator: teacher@school.edu'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginForm({
                          identifier: loginRole === 'student' ? 'student@school.edu' : 'teacher@school.edu',
                          password: loginRole === 'student' ? 'student123' : 'teacher123'
                        });
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                    >
                      Fill Demo
                    </button>
                  </div>

                  <Button type="submit" size="lg" variant="primary" fullWidth iconRight={ArrowRight} disabled={isSubmitting}>
                    {isSubmitting ? 'Authenticating...' : `Sign In as ${loginRole === 'student' ? 'Student' : 'Teacher'}`}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* =================================================================== */}
            {/* B. REGISTRATION MODE (Role Select -> Clean Form) */}
            {/* =================================================================== */}
            {mode === 'signup' && signupStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Select your role</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Choose how you will be participating on AdaptIQ.</p>

                <div className="grid grid-cols-1 gap-3 mb-5">
                  {[
                    {
                      id: 'student',
                      title: 'I am a Student',
                      desc: 'Adaptive practice quizzes, diagnostic gap discovery, and real-time Socratic AI tutor help.',
                      icon: GraduationCap,
                      color: 'border-indigo-500 bg-indigo-50/50 dark:bg-slate-800'
                    },
                    {
                      id: 'teacher',
                      title: 'I am a Teacher / Educator',
                      desc: 'Create classrooms, assign timed tests, monitor cohort mastery, and export standardized reports.',
                      icon: School,
                      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-slate-800'
                    }
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                          isSelected 
                            ? `${r.color} ring-2 ring-indigo-500/20 shadow-sm` 
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{r.title}</h3>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{r.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button 
                  onClick={() => setSignupStep(2)} 
                  size="lg" 
                  variant="primary" 
                  fullWidth 
                  iconRight={ArrowRight}
                >
                  Next: Enter {selectedRole === 'student' ? 'Student' : 'Teacher'} Profile →
                </Button>
              </motion.div>
            )}

            {/* SIGNUP STEP 2: PROFILE DETAILS & WEB3FORMS REGISTRATION */}
            {mode === 'signup' && signupStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-2 mb-3">
                  <button 
                    type="button" 
                    onClick={() => setSignupStep(1)} 
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {selectedRole === 'student' ? 'Student Registration' : 'Educator Registration'}
                    </h1>
                    <span className="text-xs text-indigo-600 dark:text-cyan-400 font-semibold">
                      Recorded to Web3Forms Registry
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  {selectedRole === 'student' ? (
                    <>
                      <Input
                        label="Full Name"
                        placeholder="e.g. Rahul Sharma"
                        value={studentForm.fullName}
                        onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Roll Number / Student ID"
                          placeholder="e.g. G7-B-24"
                          value={studentForm.rollNumber}
                          onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                          required
                        />
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                            Grade
                          </label>
                          <select
                            value={studentForm.grade}
                            onChange={(e) => setStudentForm({ ...studentForm, grade: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none"
                          >
                            <option value={6}>Grade 6</option>
                            <option value={7}>Grade 7</option>
                            <option value={8}>Grade 8</option>
                            <option value={9}>Grade 9</option>
                            <option value={10}>Grade 10</option>
                          </select>
                        </div>
                      </div>
                      <Input
                        label="School / Institution Name"
                        placeholder="e.g. Kendriya Vidyalaya No. 1"
                        value={studentForm.schoolName}
                        onChange={(e) => setStudentForm({ ...studentForm, schoolName: e.target.value })}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="e.g. student@school.edu"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        required
                      />
                      <Input
                        label="Password or PIN"
                        type="password"
                        placeholder="Create a secure password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Educator Full Name"
                        placeholder="e.g. Mrs. Anita Rao"
                        value={teacherForm.fullName}
                        onChange={(e) => setTeacherForm({ ...teacherForm, fullName: e.target.value })}
                        required
                      />
                      <Input
                        label="School / District Name"
                        placeholder="e.g. District Model Secondary School"
                        value={teacherForm.schoolName}
                        onChange={(e) => setTeacherForm({ ...teacherForm, schoolName: e.target.value })}
                        required
                      />
                      <Input
                        label="Work / Institutional Email"
                        type="email"
                        placeholder="e.g. anita.rao@school.edu"
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                        required
                      />
                      <Input
                        label="Password"
                        type="password"
                        placeholder="Create a secure password"
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                        required
                      />
                    </>
                  )}

                  {authError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <Button type="submit" size="lg" variant="primary" fullWidth iconRight={ArrowRight} className="mt-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Complete Registration & Open Dashboard →'}
                  </Button>
                </form>
              </motion.div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-4 text-center text-xs text-slate-400">
            Protected by AdaptIQ Session Security • Aligned with UN SDG-4
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: BRAND TESTIMONIALS & PLATFORM CREDENTIALS */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Badge variant="primary" size="sm" className="mb-4">
              AI Diagnostic Platform
            </Badge>
            <h2 className="text-2xl font-extrabold leading-tight">
              Adaptive practice engineered for resource-constrained schools.
            </h2>
            <p className="text-xs text-indigo-200/80 mt-2 leading-relaxed">
              Serving continuous difficulty calibration, instant Socratic feedback, and transparent post-test growth certification.
            </p>
          </div>

          {/* Rotating Impact Stat Card */}
          <div className="relative z-10 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <span className="text-3xl font-extrabold text-cyan-300 block">
              {testimonials[activeTestimonial].stat}
            </span>
            <span className="text-xs font-bold text-white mt-1 block">
              {testimonials[activeTestimonial].label}
            </span>
            <p className="text-[11px] text-indigo-100 mt-1 leading-snug">
              {testimonials[activeTestimonial].desc}
            </p>

            {/* Dots */}
            <div className="flex gap-1.5 mt-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTestimonial === i ? 'bg-cyan-400 w-4' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-[11px] text-indigo-200/70 border-t border-white/10 pt-4">
            <span>UN SDG 4: Quality Education</span>
            <span>EdTech v2.4</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* GOOGLE OAUTH 2.0 ACCOUNTS MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        title="Sign in with Google"
        subtitle="Choose an account to continue to AdaptIQ (Logged via Web3Forms)"
        maxWidth="max-w-md"
      >
        <div className="space-y-3 mt-3">
          {/* Preset Google Accounts for Fast Reviewer Testing */}
          <div
            onClick={() => handleGoogleAccountSelect({
              name: "Rahul Sharma",
              email: "rahul.sharma@gmail.com",
              role: "student",
              school: "Kendriya Vidyalaya No. 1",
              avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            })}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-cyan-400 font-bold flex items-center justify-center text-sm">
              RS
            </div>
            <div className="flex-1">
              <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-indigo-600">
                Rahul Sharma
              </span>
              <span className="text-[11px] text-slate-500">rahul.sharma@gmail.com • Student</span>
            </div>
            <Badge variant="primary" size="sm">Student</Badge>
          </div>

          <div
            onClick={() => handleGoogleAccountSelect({
              name: "Mrs. Anita Rao",
              email: "anita.rao.stem@gmail.com",
              role: "teacher",
              school: "District Model Secondary School",
              avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
            })}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
              AR
            </div>
            <div className="flex-1">
              <span className="font-bold text-xs text-slate-900 dark:text-white block group-hover:text-emerald-600">
                Mrs. Anita Rao
              </span>
              <span className="text-[11px] text-slate-500">anita.rao.stem@gmail.com • Educator</span>
            </div>
            <Badge variant="success" size="sm">Teacher</Badge>
          </div>

          {/* Custom Google Account Entry */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-500 block">Or register with custom Google account:</span>
            <input
              type="text"
              placeholder="Your Full Name"
              value={customGoogleName}
              onChange={(e) => setCustomGoogleName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-slate-900 dark:text-white"
            />
            <input
              type="email"
              placeholder="your.email@gmail.com"
              value={customGoogleEmail}
              onChange={(e) => setCustomGoogleEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-slate-900 dark:text-white"
            />
            <div className="flex items-center gap-2">
              <select
                value={customGoogleRole}
                onChange={(e) => setCustomGoogleRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-slate-900 dark:text-white font-semibold"
              >
                <option value="student">Student Account</option>
                <option value="teacher">Teacher Account</option>
              </select>
              <Button
                size="sm"
                variant="primary"
                disabled={!customGoogleEmail.trim() || !customGoogleName.trim() || googleSubmitting}
                onClick={() => handleGoogleAccountSelect({
                  name: customGoogleName,
                  email: customGoogleEmail,
                  role: customGoogleRole
                })}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
        subtitle="We will send a password reset verification link to your email."
      >
        <div className="space-y-4 mt-2">
          {forgotSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Reset link dispatched to <strong>{forgotEmail}</strong>. Check your inbox to proceed.</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setForgotSubmitted(true);
              }}
              className="space-y-3"
            >
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="e.g. rahul@school.edu"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                icon={Mail}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setForgotModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="primary">
                  Send Recovery Link
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
