import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { submitBugReport } from '../../services/web3forms';
import { getSafeDeviceInfo } from '../../utils/supportValidation';
import { Button } from '../ui/Button';
import { PrivacyNotice } from './PrivacyNotice';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Bug,
  Laptop,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const BugReportForm = ({ onSuccess, onCancel, defaultTitle = '' }) => {
  const { user } = useContext(AuthContext);
  const detectedDevice = useMemo(() => getSafeDeviceInfo(), []);

  const [formData, setFormData] = useState({
    name: user?.name || user?.fullName || '',
    email: user?.email || '',
    bugTitle: defaultTitle || '',
    description: '',
    stepsToReproduce: '',
    expectedBehaviour: '',
    actualBehaviour: '',
    includeDeviceInfo: true,
    botcheck: ''
  });

  const [showDeviceDetails, setShowDeviceDetails] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ success: false, message: '', errorType: '' });

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email' && value.trim()) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(value.trim())) error = 'Please enter a valid email address.';
    } else if (field === 'bugTitle') {
      if (!value.trim()) error = 'Bug title is required.';
      else if (value.trim().length < 5) error = 'Bug title must be at least 5 characters.';
      else if (value.trim().length > 120) error = 'Bug title cannot exceed 120 characters.';
    } else if (field === 'description') {
      if (!value.trim()) error = 'Description is required.';
      else if (value.trim().length < 10) error = 'Description must be at least 10 characters.';
      else if (value.trim().length > 1500) error = 'Description cannot exceed 1500 characters.';
    } else if (field === 'stepsToReproduce') {
      if (!value.trim()) error = 'Steps to reproduce are required.';
      else if (value.trim().length < 10) error = 'Please provide detailed step instructions.';
      else if (value.trim().length > 1500) error = 'Steps cannot exceed 1500 characters.';
    } else if (field === 'expectedBehaviour') {
      if (!value.trim()) error = 'Expected behaviour is required.';
      else if (value.trim().length > 800) error = 'Expected behaviour cannot exceed 800 characters.';
    } else if (field === 'actualBehaviour') {
      if (!value.trim()) error = 'Actual behaviour is required.';
      else if (value.trim().length > 800) error = 'Actual behaviour cannot exceed 800 characters.';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalVal }));

    if (errors[name]) {
      const err = validateField(name, finalVal);
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

    const requiredFields = ['bugTitle', 'description', 'stepsToReproduce', 'expectedBehaviour', 'actualBehaviour'];
    const newErrors = {};
    requiredFields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });
    if (formData.email) {
      const emailErr = validateField('email', formData.email);
      if (emailErr) newErrors.email = emailErr;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({ success: false, message: 'Please complete all required bug report details.', errorType: 'VALIDATION' });
      return;
    }

    setSubmitting(true);
    setStatus({ success: false, message: '', errorType: '' });

    try {
      const res = await submitBugReport({
        name: formData.name,
        email: formData.email,
        bugTitle: formData.bugTitle,
        description: formData.description,
        stepsToReproduce: formData.stepsToReproduce,
        expectedBehaviour: formData.expectedBehaviour,
        actualBehaviour: formData.actualBehaviour,
        includeDeviceInfo: formData.includeDeviceInfo,
        botcheck: formData.botcheck
      });

      setSubmitting(false);

      if (res.success) {
        setStatus({
          success: true,
          message: res.message || 'Bug report recorded! Our technical team has been notified.',
          errorType: ''
        });
        setFormData({
          name: user?.name || user?.fullName || '',
          email: user?.email || '',
          bugTitle: '',
          description: '',
          stepsToReproduce: '',
          expectedBehaviour: '',
          actualBehaviour: '',
          includeDeviceInfo: true,
          botcheck: ''
        });
        setErrors({});
        if (onSuccess) onSuccess(res);
      } else {
        setStatus({
          success: false,
          message: res.message || 'Failed to submit bug report. Check your network or access key.',
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
        message: 'An unexpected error occurred while transmitting the report.',
        errorType: 'CLIENT_EXCEPTION'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Honeypot Spam Protection Field */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="bug-botcheck">Ignore this field</label>
        <input
          id="bug-botcheck"
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
                Tip: Configure <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold">VITE_WEB3FORMS_ACCESS_KEY</code> in client/.env.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bug Title */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="bug-title"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Bug Title <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.bugTitle.length}/120
          </span>
        </div>
        <input
          id="bug-title"
          type="text"
          name="bugTitle"
          required
          disabled={submitting}
          value={formData.bugTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., KaTeX equation overflow in Level 2 practice quiz"
          maxLength={120}
          aria-invalid={Boolean(errors.bugTitle)}
          aria-describedby={errors.bugTitle ? 'bug-title-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
            errors.bugTitle
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {errors.bugTitle && (
          <p id="bug-title-error" className="text-[11px] text-rose-500 font-semibold mt-1">
            {errors.bugTitle}
          </p>
        )}
      </div>

      {/* Bug Description */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="bug-description"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Description <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.description.length}/1500
          </span>
        </div>
        <textarea
          id="bug-description"
          name="description"
          rows={3}
          required
          disabled={submitting}
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Concise overview of what happened..."
          maxLength={1500}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'bug-desc-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
            errors.description
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {errors.description && (
          <p id="bug-desc-error" className="text-[11px] text-rose-500 font-semibold mt-1">
            {errors.description}
          </p>
        )}
      </div>

      {/* Steps to Reproduce */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="bug-steps"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Steps to Reproduce <span className="text-rose-500">*</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {formData.stepsToReproduce.length}/1500
          </span>
        </div>
        <textarea
          id="bug-steps"
          name="stepsToReproduce"
          rows={3}
          required
          disabled={submitting}
          value={formData.stepsToReproduce}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="1. Go to Practice Mode&#10;2. Select Grade 8 Math&#10;3. Tap Next Question on low battery..."
          maxLength={1500}
          aria-invalid={Boolean(errors.stepsToReproduce)}
          aria-describedby={errors.stepsToReproduce ? 'bug-steps-error' : undefined}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
            errors.stepsToReproduce
              ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
              : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
          }`}
        />
        {errors.stepsToReproduce && (
          <p id="bug-steps-error" className="text-[11px] text-rose-500 font-semibold mt-1">
            {errors.stepsToReproduce}
          </p>
        )}
      </div>

      {/* Expected vs Actual Behaviour */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label
            htmlFor="bug-expected"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Expected Behaviour <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="bug-expected"
            name="expectedBehaviour"
            rows={2}
            required
            disabled={submitting}
            value={formData.expectedBehaviour}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="What should have happened"
            maxLength={800}
            className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
              errors.expectedBehaviour
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
            }`}
          />
          {errors.expectedBehaviour && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.expectedBehaviour}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="bug-actual"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Actual Behaviour <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="bug-actual"
            name="actualBehaviour"
            rows={2}
            required
            disabled={submitting}
            value={formData.actualBehaviour}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="What actually occurred"
            maxLength={800}
            className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none transition-all ${
              errors.actualBehaviour
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
            }`}
          />
          {errors.actualBehaviour && (
            <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.actualBehaviour}</p>
          )}
        </div>
      </div>

      {/* Disclosed Device Info Section (Opt-in / Consent) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="includeDeviceInfo"
              checked={formData.includeDeviceInfo}
              onChange={handleChange}
              disabled={submitting}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Include non-sensitive browser & device diagnostics
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowDeviceDetails(!showDeviceDetails)}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{showDeviceDetails ? 'Hide details' : 'Preview'}</span>
            {showDeviceDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          Helps engineers reproduce rendering and performance bugs faster. Only screen size, browser type, and current route are collected. No tokens, passwords, or personal files are ever accessed.
        </p>

        {showDeviceDetails && formData.includeDeviceInfo && (
          <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
            <div>Browser: {detectedDevice.browser}</div>
            <div>Platform: {detectedDevice.platform}</div>
            <div>Screen: {detectedDevice.screenResolution} ({detectedDevice.viewportSize} viewport)</div>
            <div>Path: {detectedDevice.currentRoute}</div>
            <div>Network: {detectedDevice.onlineStatus}</div>
          </div>
        )}
      </div>

      {/* Optional Reporter Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <div>
          <label
            htmlFor="bug-name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Reporter Identifier <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="bug-name"
            type="text"
            name="name"
            disabled={submitting}
            value={formData.name}
            onChange={handleChange}
            placeholder="Anonymous Reporter / School Name"
            maxLength={80}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="bug-email"
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1"
          >
            Email for Follow-up <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="bug-email"
            type="email"
            name="email"
            disabled={submitting}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Optional engineer response address"
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
          {submitting ? 'Submitting...' : 'Submit Bug Report'}
        </Button>
      </div>
    </form>
  );
};
