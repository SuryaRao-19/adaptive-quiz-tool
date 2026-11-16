import React, { useState, useEffect, useContext } from 'react';
import { 
  Inbox, 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  User, 
  Tag, 
  ChevronRight,
  Shield,
  LifeBuoy,
  Plus
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AuthContext } from '../../context/AuthContext';

const STATUS_CONFIG = {
  'New': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300', dot: 'bg-blue-500' },
  'Open': { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300', dot: 'bg-amber-500' },
  'In Progress': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300', dot: 'bg-purple-500' },
  'Waiting for Response': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-300', dot: 'bg-orange-500' },
  'Resolved': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300', dot: 'bg-emerald-500' }
};

export const SupportInbox = ({ defaultStaffName = '' }) => {
  const { user } = useContext(AuthContext);
  const staffName = defaultStaffName || user?.name || user?.fullName || 'Educator';
  const staffRole = user?.role || 'teacher';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reply State
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('Resolved');
  const [replying, setReplying] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
        if (!selectedTicketId && data.data.length > 0) {
          setSelectedTicketId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0] || null;

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setReplying(true);
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responderName: staffName,
          responderRole: staffRole,
          message: replyText.trim(),
          newStatus: replyStatus
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTickets(prev => prev.map(t => t.id === data.data.id ? data.data : t));
        setReplyText('');
        showNotice(`Response posted. Ticket marked as "${replyStatus}".`);
      } else {
        showNotice(data.message || 'Failed to post reply.');
      }
    } catch (err) {
      showNotice('Network error posting response.');
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTickets(prev => prev.map(t => t.id === data.data.id ? data.data : t));
        showNotice(`Status updated to "${newStatus}".`);
      }
    } catch (err) {
      showNotice('Failed to update status.');
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = t.subject?.toLowerCase().includes(q);
      const matchSender = t.senderName?.toLowerCase().includes(q);
      const matchNumber = t.ticketNumber?.toLowerCase().includes(q);
      const matchMsg = t.message?.toLowerCase().includes(q);
      if (!matchSubject && !matchSender && !matchNumber && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Inbox className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">Institutional Support & Helpdesk Inbox</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Database-Backed
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage student inquiries, curriculum questions, technical reports, and school feedback.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={RefreshCw}
            onClick={fetchTickets}
            disabled={loading}
            className="text-xs font-bold border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Refresh
          </Button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {actionNotice}
        </div>
      )}

      {/* Main Grid: Left Ticket List, Right Conversation Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Ticket List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filters */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, student, subject..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses ({tickets.length})</option>
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Response">Waiting for Response</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="CURRICULUM">Curriculum</option>
                <option value="TECHNICAL">Technical & Bugs</option>
                <option value="GENERAL">General</option>
                <option value="FEEDBACK">Feedback</option>
              </select>
            </div>
          </div>

          {/* Ticket Items Scroll Area */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <LifeBuoy className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No tickets found</p>
                <p className="text-[11px] text-slate-400 mt-1">Adjust filters or search query.</p>
              </Card>
            ) : (
              filteredTickets.map(t => {
                const isSelected = selectedTicket?.id === t.id;
                const statusStyle = STATUS_CONFIG[t.status] || STATUS_CONFIG['Open'];
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400">
                          {t.ticketNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {t.category}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.color}`}>
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {t.subject}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                        {t.senderName} ({t.senderRole})
                      </span>
                      <span className="text-[10px]">
                        {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Ticket Detail & Thread (7 cols) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              {/* Header Info */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[selectedTicket.status]?.color || ''}`}>
                      {selectedTicket.status}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Priority: {selectedTicket.priority}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Change Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={e => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="New">New</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for Response">Waiting for Response</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedTicket.subject}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{selectedTicket.senderName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-semibold">
                      {selectedTicket.senderRole}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">{selectedTicket.senderEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Assigned: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedTicket.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Original Message Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Original Inquiry / Description
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                  {selectedTicket.message}
                </p>
                <div className="text-[10px] text-slate-400 font-mono text-right">
                  Logged on {new Date(selectedTicket.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Response Thread */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Staff Responses & Audit Trail ({selectedTicket.responses?.length || 0})
                </h4>

                {(!selectedTicket.responses || selectedTicket.responses.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No responses posted yet. Send a response below.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {selectedTicket.responses.map((resp, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-indigo-900 dark:text-indigo-300">
                            {resp.responderName} ({resp.responderRole})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(resp.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                          {resp.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Post Staff Response
                  </label>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 text-[11px]">Status upon reply:</span>
                    <select
                      value={replyStatus}
                      onChange={e => setReplyStatus(e.target.value)}
                      className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Resolved">Resolved</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting for Response">Waiting for Response</option>
                      <option value="Open">Open</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type official guidance, clarification or resolution note for the student/reporter..."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={Send}
                    loading={replying}
                    disabled={replying || !replyText.trim()}
                    className="font-bold text-xs"
                  >
                    Send Response
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Select a support ticket</h3>
              <p className="text-xs text-slate-400 mt-1">Choose an inquiry from the left panel to review and reply.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
