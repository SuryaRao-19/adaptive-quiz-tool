import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ContactUsForm } from '../components/support/ContactUsForm';
import { FeedbackForm } from '../components/support/FeedbackForm';
import { BugReportForm } from '../components/support/BugReportForm';
import { isWeb3FormsConfigured } from '../services/web3forms';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  Mail,
  MessageSquare,
  Bug,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

export const ContactSupportPage = () => {
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'contact';

  const [activeTab, setActiveTab] = useState(
    ['contact', 'feedback', 'bug'].includes(requestedTab) ? requestedTab : 'contact'
  );

  const configured = isWeb3FormsConfigured();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation & header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to AdaptIQ Home</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>UN SDG 4 Support Desk</span>
            </Badge>
          </div>
        </div>

        {/* Hero title block */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How can we help your learning journey?
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Connect directly with the AdaptIQ academic and technical team. Whether you have school partnership inquiries, feature ideas, or bug reports, we are here to assist.
          </p>
        </div>

        {/* Notice if Web3Forms key is missing */}
        {!configured && (
          <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300 max-w-3xl mx-auto">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Web3Forms Access Key Required for Live Mailbox Delivery</p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Submissions will be processed once <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-bold">VITE_WEB3FORMS_ACCESS_KEY</code> is configured in <code className="font-mono">client/.env</code>.
                Get your key at{' '}
                <a
                  href="https://web3forms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-0.5"
                >
                  web3forms.com <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>
          </div>
        )}

        {/* Main interactive workflow card */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-elevated p-6 sm:p-8 space-y-6">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'contact'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact Us</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bug')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'bug'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bug className="w-4 h-4" />
              <span>Report Bug</span>
            </button>
          </div>

          {/* Active Tab Form */}
          <div className="pt-2">
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    General Enquiries & Partnerships
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    For school pilots, teacher onboarding, curriculum alignment, or media questions.
                  </p>
                </div>
                <ContactUsForm />
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    User Feedback & Product Suggestions
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Help us shape the future of adaptive learning for mathematics and science.
                  </p>
                </div>
                <FeedbackForm />
              </div>
            )}

            {activeTab === 'bug' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit a Technical Bug Report
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Found an equation display issue, offline sync anomaly, or button error? Let us know.
                  </p>
                </div>
                <BugReportForm />
              </div>
            )}
          </div>
        </div>

        {/* Informative FAQ / Context Cards */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Card className="p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-cyan-400 font-bold text-xs">
              <Mail className="w-4 h-4" />
              <span>Email Delivery</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by Web3Forms serverless delivery API with encrypted in-flight transmission.
            </p>
          </Card>

          <Card className="p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-cyan-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Protection</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Strictly adheres to student privacy. Passwords, PINs, and quiz scores are never collected.
            </p>
          </Card>

          <Card className="p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-cyan-400 font-bold text-xs">
              <BookOpen className="w-4 h-4" />
              <span>UN SDG 4 Focus</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dedicated to closing foundational learning gaps for government school learners.
            </p>
          </Card>
        </div>

      </div>
    </div>
  );
};
