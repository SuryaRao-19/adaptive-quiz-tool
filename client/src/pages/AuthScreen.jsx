import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { 
  School, 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Users
} from 'lucide-react';
import axios from 'axios';

export const AuthScreen = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active Tab: 'student' | 'staff'
  const [activeTab, setActiveTab] = useState('student');

  // Student Mode: 'login' | 'activate'
  const [studentMode, setStudentMode] = useState('login');

  // Student Form
  const [studentGrade, setStudentGrade] = useState(7);
  const [studentRoll, setStudentRoll] = useState('GPS-07-001');
  const [studentPassword, setStudentPassword] = useState('Student@123');
  const [activationCode, setActivationCode] = useState('GPS-ACT-7001');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Staff Form
  const [staffEmail, setStaffEmail] = useState('sharma.math@greenwoodgurgaon.com');
  const [staffPassword, setStaffPassword] = useState('teacher123');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Student Login Submit
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/student-login', {
        grade: parseInt(studentGrade, 10),
        rollNumber: studentRoll.trim(),
        password: studentPassword
      });

      if (res.data.success && res.data.token) {
        login(res.data.token, res.data.user);
        setSuccessMsg(`Welcome, ${res.data.user.name}! Redirecting to student dashboard...`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.requireActivation) {
        setStudentMode('activate');
        setErrorMsg('First-time activation required. Please enter your school activation code to set a password.');
      } else {
        setErrorMsg(resp?.message || 'Invalid Grade, Roll Number, or Password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Activation Submit
  const handleStudentActivate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/student-activate', {
        grade: parseInt(studentGrade, 10),
        rollNumber: studentRoll.trim(),
        activationCode: activationCode.trim(),
        newPassword
      });

      if (res.data.success && res.data.token) {
        login(res.data.token, res.data.user);
        setSuccessMsg('Account activated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Activation failed. Please check your activation code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Staff Login Submit
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/staff-login', {
        email: staffEmail.trim(),
        password: staffPassword
      });

      if (res.data.success && res.data.token) {
        login(res.data.token, res.data.user);
        setSuccessMsg(`Authenticated as ${res.data.user.name}. Redirecting...`);
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid institutional email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Greenwood Public School
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Sector-9, Gurugram &bull; CBSE Affiliation No: 530649 &bull; School Code: 40643
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <Card className="p-6 sm:p-8 shadow-elevated border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Main Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('student'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('staff'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Staff & Principal</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: STUDENT PORTAL */}
          {activeTab === 'student' && (
            <div>
              {studentMode === 'login' ? (
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Class / Grade *
                    </label>
                    <select
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[42px]"
                    >
                      <option value={7}>Grade 7 (Middle Wing — Pilot Cohort 7-A)</option>
                      <option value={3}>Grade 3 (Primary Wing)</option>
                      <option value={10}>Grade 10 (Secondary Wing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student Roll Number *
                    </label>
                    <Input
                      placeholder="e.g. APS-07-001"
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Password *
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your student password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full py-2.5 font-bold text-xs"
                    iconRight={ArrowRight}
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Student Portal'}
                  </Button>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>First time logging in?</span>
                    <button
                      type="button"
                      onClick={() => { setStudentMode('activate'); setErrorMsg(''); }}
                      className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline"
                    >
                      Activate Student Account &rarr;
                    </button>
                  </div>

                  {/* 1-Click Demo Helper */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">Demo Pilot Accounts:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setStudentGrade(7); setStudentRoll('APS-07-001'); setStudentPassword('Student@123'); }}
                        className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold border border-indigo-200"
                      >
                        Aarav Patel (Gr 7)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setStudentGrade(7); setStudentRoll('APS-07-002'); setStudentPassword('Student@123'); }}
                        className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold border border-indigo-200"
                      >
                        Priya Sharma (Gr 7)
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleStudentActivate} className="space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                    <span className="font-bold block mb-0.5">First-Time Account Activation</span>
                    <span>Enter your grade, roll number, and school activation code to choose your permanent password.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Grade *
                      </label>
                      <select
                        value={studentGrade}
                        onChange={(e) => setStudentGrade(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value={7}>Grade 7</option>
                        <option value={3}>Grade 3</option>
                        <option value={10}>Grade 10</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Roll Number *
                      </label>
                      <Input
                        placeholder="APS-07-003"
                        value={studentRoll}
                        onChange={(e) => setStudentRoll(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      School Activation Code *
                    </label>
                    <Input
                      placeholder="e.g. APS-ACT-7003"
                      value={activationCode}
                      onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Create Password (min. 6 characters) *
                    </label>
                    <Input
                      type="password"
                      placeholder="Choose a strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <Input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full py-2.5 font-bold text-xs"
                  >
                    {loading ? 'Activating Account...' : 'Activate Account & Sign In'}
                  </Button>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                    <button
                      type="button"
                      onClick={() => { setStudentMode('login'); setErrorMsg(''); }}
                      className="font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      &larr; Back to Student Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: STAFF & PRINCIPAL PORTAL */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="e.g. sharma.math@greenwoodgurgaon.com"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <Input
                  type="password"
                  placeholder="Enter your educator password"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-2.5 font-bold text-xs"
                iconRight={ArrowRight}
              >
                {loading ? 'Signing In...' : 'Sign In as Educator / Principal'}
              </Button>

              {/* Quick Fill Demo Credentials */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                <span className="font-bold text-slate-500 uppercase tracking-wider block">Demo Institutional Accounts:</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setStaffEmail('sharma.math@greenwoodgurgaon.com'); setStaffPassword('teacher123'); }}
                    className="p-1.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold border border-indigo-200 text-left"
                  >
                    Mrs. Ananya Sharma (Grade 7 Math Head)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStaffEmail('principal@greenwoodgurgaon.com'); setStaffPassword('admin123'); }}
                    className="p-1.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 text-left"
                  >
                    Dr. K. S. Raman (Principal & Director)
                  </button>
                </div>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
