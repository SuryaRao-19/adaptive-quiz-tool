import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { ContactUsForm } from './support/ContactUsForm';
import { FeedbackForm } from './support/FeedbackForm';
import { BugReportForm } from './support/BugReportForm';
import { isWeb3FormsConfigured } from '../services/web3forms';
import {
  Mail,
  MessageSquare,
  Bug,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ContactSupportModal = ({
  isOpen,
  onClose,
  initialTab = 'contact', // 'contact' | 'feedback' | 'bug'
  defaultFeedbackPage = '',
  defaultBugTitle = ''
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setConfigured(isWeb3FormsConfigured());
    }
  }, [isOpen, initialTab]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Greenwood Public School Help & Support"
      subtitle="Integrated Academic Helpdesk • Connected to Teacher & Admin Portals"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">

        {/* Tab Navigation Pill Group */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'contact'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Contact Us</span>
            <span className="sm:hidden">Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'feedback'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">User Feedback</span>
            <span className="sm:hidden">Feedback</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bug')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'bug'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Bug</span>
            <span className="sm:hidden">Bug</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="pt-1 max-h-[68vh] overflow-y-auto px-0.5">
          {activeTab === 'contact' && (
            <ContactUsForm
              onSuccess={() => {
                setTimeout(onClose, 2400);
              }}
              onCancel={onClose}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackForm
              defaultPage={defaultFeedbackPage}
              onSuccess={() => {
                setTimeout(onClose, 2400);
              }}
              onCancel={onClose}
            />
          )}

          {activeTab === 'bug' && (
            <BugReportForm
              defaultTitle={defaultBugTitle}
              onSuccess={() => {
                setTimeout(onClose, 2400);
              }}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
