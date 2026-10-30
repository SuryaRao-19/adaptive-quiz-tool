import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { submitContactUs } from '../../services/web3forms';
import { Button } from '../ui/Button';
import { PrivacyNotice } from './PrivacyNotice';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Mail,
  User,
  MessageSquare
} from 'lucide-react';

export const ContactUsForm = ({ onSuccess, onCancel }) => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    subject: '',
    message: '',
    botcheck: '' // Honeypot field
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '', errorType: '' });

  const validateField = (field, value) => {
    let error = '';
    if (field === 'name') {
      if (!value.trim()) error = 'Name is required.';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters.';
      else if (value.trim().length > 80) error = 'Name cannot exceed 80 characters.';
    } else if (field === 'email') {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!value.trim()) error = 'Email is required.';
      else if (!emailRegex.test(value.trim())) error = 'Please enter a valid email address.';
    } else if (field === 'subject') {
      if (!value.trim()) error = 'Subject is required.';
      else if (value.trim().length < 4) error = 'Subject must be at least 4 characters.';
      else if (value.trim().length > 120) error = 'Subject cannot exceed 120 characters.';
    } else if (field === 'message') {
      if (!value.trim()) error = 'Message is required.';
      else if (value.trim().length < 10) error = 'Message must be at least 10 characters.';
      else if (value.trim().length > 2000) error = 'Message cannot exceed 2000 characters.';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time inline validation cleanup
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

    // Validate all fields
    const newErrors = {};
    ['name', 'email', 'subject', 'message'].forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({ success: false, message: 'Please correct the highlighted fields.', errorType: 'VALIDATION' });
      return;
    }

    setSubmitting(true);
    setStatus({ success: false, message: '', errorType: '' });

    try {
      const res = await submitContactUs({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        botcheck: formData.botcheck
      });

      setSubmitting(false);

      if (res.success) {
        setStatus({
          success: true,
          message: res.message || 'Thank you! Your message has been delivered to the AdaptIQ support team.',
          errorType: ''
        });
        setFormData({
          name: user?.name || user?.fullName || '',
          email: user?.email || '',
          subject: '',
          message: '',
          botcheck: ''
        });
        setErrors({});
        if (onSuccess) onSuccess(res);
      } else {
        setStatus({
          success: false,
          message: res.message || 'Failed to send message. Please verify configuration or try again.',
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
        message: 'An unexpected error occurred. Please check your internet connection.',
        errorType: 'CLIENT_EXCEPTION'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Honeypot Spam Field - Completely hidden from human users */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="contact-botcheck">Leave this field blank</label>
        <input
          id="contact-botcheck"
          type="text"
          name="botcheck"
          value={formData.botcheck}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Status Banners */}
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

      {/* Name and Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Your Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="contact-name"
              type="text"
              name="name"
              required
              disabled={submitting}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full Name"
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contact-name-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
                errors.name
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors.name && (
            <p id="contact-name-error" className="text-[11px] text-rose-500 font-semibold mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="contact-email"
              type="email"
              name="email"
              required
              disabled={submitting}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="educator@school.org"
              maxLength={100}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'contact-email-error' : undefined}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
              }`}
            />
          </div>
          {errors.email && (
            <p id="contact-email-error" className="text-[11px] text-rose-500 font-semibold mt-1">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Subject */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="contact-subject"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Subject <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.subject.length}/120
          </span>
        </div>
        <input
          id="contact-subject"
          type="text"
          name="subject"
          required
          disabled={submitting}
          value={formData.subject}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., School Pilot Inquiry, Curriculum Partnership"
          maxLength={120}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
            errors.subject
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {errors.subject && (
          <p id="contact-subject-error" className="text-[11px] text-rose-500 font-semibold mt-1">
            {errors.subject}
          </p>
        )}
      </div>

      {/* Message */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="contact-message"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Message <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.message.length}/2000
          </span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          disabled={submitting}
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Please describe your enquiry, classroom requirements, or questions..."
          maxLength={2000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
            errors.message
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {errors.message && (
          <p id="contact-message-error" className="text-[11px] text-rose-500 font-semibold mt-1">
            {errors.message}
          </p>
        )}
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
          {submitting ? 'Submitting...' : 'Send Enquiry'}
        </Button>
      </div>
    </form>
  );
};
