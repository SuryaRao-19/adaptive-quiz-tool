import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { submitFeedback } from '../../services/web3forms';
import { FEEDBACK_CATEGORIES } from '../../utils/supportValidation';
import { Button } from '../ui/Button';
import { PrivacyNotice } from './PrivacyNotice';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquarePlus,
  Tag,
  Compass
} from 'lucide-react';

export const FeedbackForm = ({ onSuccess, onCancel, defaultPage = '' }) => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    category: 'General feedback',
    message: '',
    pageReference: defaultPage || '',
    botcheck: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '', errorType: '' });

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email' && value.trim()) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(value.trim())) error = 'Please enter a valid email address.';
    } else if (field === 'category') {
      if (!FEEDBACK_CATEGORIES.includes(value)) error = 'Please select a valid feedback category.';
    } else if (field === 'message') {
      if (!value.trim()) error = 'Feedback message is required.';
      else if (value.trim().length < 10) error = 'Feedback must be at least 10 characters.';
      else if (value.trim().length > 2000) error = 'Feedback cannot exceed 2000 characters.';
    } else if (field === 'pageReference') {
      if (value.trim().length > 100) error = 'Reference cannot exceed 100 characters.';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const newErrors = {};
    ['category', 'message'].forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });
    if (formData.email) {
      const emailErr = validateField('email', formData.email);
      if (emailErr) newErrors.email = emailErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({ success: false, message: 'Please review the form errors before submitting.', errorType: 'VALIDATION' });
      return;
    }

    setSubmitting(true);
    setStatus({ success: false, message: '', errorType: '' });

    try {
      const res = await submitFeedback({
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message,
        pageReference: formData.pageReference,
        botcheck: formData.botcheck
      });

      setSubmitting(false);

      if (res.success) {
        setStatus({
          success: true,
          message: res.message || 'Thank you! Your feedback helps us build a more effective learning tool.',
          errorType: ''
        });
        setFormData({
          name: user?.name || user?.fullName || '',
          email: user?.email || '',
          category: 'General feedback',
          message: '',
          pageReference: '',
          botcheck: ''
        });
        setErrors({});
        if (onSuccess) onSuccess(res);
      } else {
        setStatus({
          success: false,
          message: res.message || 'Unable to submit feedback. Please check your configuration or network.',
          errorType: res.errorType || 'API_ERROR'
        });
        if (res.errors) {
          setErrors(res.errors);
        }
      }
    } catch (err) {
      setSubmitting(false);
      setStatus({
        success: false,
        message: 'An unexpected connection error occurred.',
        errorType: 'CLIENT_EXCEPTION'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Honeypot Spam Protection Field */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="feedback-botcheck">Ignore this field</label>
        <input
          id="feedback-botcheck"
          type="text"
          name="botcheck"
          value={formData.botcheck}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Status Alerts */}
      {status.message && (
        <div
          role="alert"
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 transition-all ${
            status.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {status.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p>{status.message}</p>
            {status.errorType === 'MISSING_ACCESS_KEY' && (
              <p className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
                Tip: Add <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold">VITE_WEB3FORMS_ACCESS_KEY</code> to your environment file.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label
          htmlFor="feedback-category"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
        >
          Feedback Category <span className="text-rose-500">*</span>
        </label>
        <select
          id="feedback-category"
          name="category"
          required
          disabled={submitting}
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          {FEEDBACK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.category}</p>
        )}
      </div>

      {/* Optional Page or Feature Reference */}
      <div>
        <label
          htmlFor="feedback-pageReference"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
        >
          Page or Feature Reference <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>
        <input
          id="feedback-pageReference"
          type="text"
          name="pageReference"
          disabled={submitting}
          value={formData.pageReference}
          onChange={handleChange}
          placeholder="e.g., Practice Mode, Diagnostic Pre-Test, AI Tutor, Analytics"
          maxLength={100}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Message Area */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="feedback-message"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Feedback Message <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.message.length}/2000
          </span>
        </div>
        <textarea
          id="feedback-message"
          name="message"
          rows={4}
          required
          disabled={submitting}
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Share your thoughts on learning clarity, interface layout, speed, accessibility, or ideas..."
          maxLength={2000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'feedback-message-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
            errors.message
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {errors.message && (
          <p id="feedback-message-error" className="text-[11px] text-rose-500 font-semibold mt-1">
            {errors.message}
          </p>
        )}
      </div>

      {/* Optional Name and Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label
            htmlFor="feedback-name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="feedback-name"
            type="text"
            name="name"
            disabled={submitting}
            value={formData.name}
            onChange={handleChange}
            placeholder="Anonymous Educator / Learner"
            maxLength={80}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="feedback-email"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Contact Email <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            name="email"
            disabled={submitting}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="To receive follow-up notes"
            maxLength={100}
            className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
              errors.email
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <PrivacyNotice compact />

      {/* Action Controls */}
      <div className="flex items-center justify-end gap-2.5 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={Send}
          loading={submitting}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Send Feedback'}
        </Button>
      </div>
    </form>
  );
};
