import React, { useState, useContext } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { AuthContext } from '../context/AuthContext';
import { submitContactFeedback } from '../services/web3forms';
import { Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export const ContactSupportModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [category, setCategory] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setStatus({ success: false, message: '' });

    const res = await submitContactFeedback({
      name: user?.name || user?.fullName || 'AdaptIQ User',
      email: email.trim(),
      category,
      message: message.trim()
    });

    setSubmitting(false);

    if (res.success) {
      setStatus({ success: true, message: 'Thank you! Your feedback has been sent to our academic support team.' });
      setMessage('');
      setTimeout(() => {
        setStatus({ success: false, message: '' });
        onClose();
      }, 2000);
    } else {
      setStatus({ success: false, message: 'Message recorded locally. (Web3Forms access key not active or network offline)' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact Support & Feedback"
      subtitle="UN SDG 4 Aligned Learning Support"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {status.message && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            status.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {status.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
            <span>{status.message}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="Feedback">Product Feedback & Feature Request</option>
            <option value="Question Bug">Curriculum / Question Issue</option>
            <option value="AI Tutor">AI Tutor Response Feedback</option>
            <option value="General Support">General Support Request</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Your Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@school.edu"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Message
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe what happened or how we can improve your learning experience..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Send} disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
