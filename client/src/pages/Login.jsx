import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { Button } from '../components/Button';

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ rollNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rollNumber || !formData.password) {
      setError('Please enter both your Roll Number and PIN.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser(formData);
      login(data.token, data.user);
      if (data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/select');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your Roll Number and PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-900 rounded-full mb-3 text-2xl font-bold">
            ✦
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student & Teacher Login</h1>
          <p className="text-slate-600 mt-2 text-sm">
            Sign in with your School Roll Number and 4-digit PIN.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Roll Number / ID
            </label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. STUDENT01 or G7-01"
              autoCapitalize="characters"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              PIN / Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="4-digit PIN (e.g. 1234)"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-base"
              required
            />
          </div>

          <Button type="submit" disabled={loading} fullWidth variant="primary" className="mt-4">
            {loading ? 'Signing in...' : 'Sign In →'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          First time here?{' '}
          <Link to="/register" className="font-semibold text-blue-900 hover:underline">
            Register as a Student
          </Link>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 text-center border border-slate-200">
          Demo student: <span className="font-mono font-bold text-slate-700">STUDENT01</span> / PIN: <span className="font-mono font-bold text-slate-700">1234</span><br/>
          Demo teacher: <span className="font-mono font-bold text-slate-700">TEACHER01</span> / PIN: <span className="font-mono font-bold text-slate-700">admin123</span>
        </div>
      </div>
    </div>
  );
};
