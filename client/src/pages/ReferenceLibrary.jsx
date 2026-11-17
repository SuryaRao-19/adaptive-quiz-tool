import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  BookOpen, 
  FileText, 
  ArrowRight, 
  Clock, 
  BrainCircuit, 
  Sparkles, 
  ArrowLeft, 
  Share2, 
  CheckCircle2, 
  Plus, 
  MessageSquareText, 
  FileCheck, 
  Download, 
  School, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AuthContext } from '../context/AuthContext';
import { getResources, addResource as apiAddResource } from '../services/libraryService';
import { MOCK_LIBRARY_RESOURCES } from '../services/mockData';
import { speechHelper } from '../utils/speechSynthesis';

export const ReferenceLibrary = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedResourceId = searchParams.get('id');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('All'); // All, Primary, Middle, Secondary, Senior Secondary
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Resource list
  const [resourcesList, setResourcesList] = useState(MOCK_LIBRARY_RESOURCES);

  // Add Resource Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Math');
  const [newTopic, setNewTopic] = useState('');
  const [newType, setNewType] = useState('Concept Guide');
  const [newDifficulty, setNewDifficulty] = useState('Foundational');
  const [newReadTime, setNewReadTime] = useState('5 min read');
  const [newSummary, setNewSummary] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    getResources({
      subject: selectedSubject,
      topic: selectedTopic,
      search: searchQuery
    }).then((res) => {
      if (res && res.success && Array.isArray(res.resources) && res.resources.length > 0) {
        setResourcesList(res.resources);
      }
    }).catch(() => {});
  }, [selectedSubject, selectedTopic, searchQuery]);

  const handleAddResourceSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTopic.trim() || !newSummary.trim() || !newBody.trim()) {
      triggerToast('Please fill in title, topic, summary, and content.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiAddResource({
        title: newTitle.trim(),
        subject: newSubject,
        topic: newTopic.trim(),
        type: newType,
        difficulty: newDifficulty,
        readTime: newReadTime,
        summary: newSummary.trim(),
        body: newBody.trim()
      });

      if (res && res.success && res.resource) {
        setResourcesList(prev => [res.resource, ...prev]);
        setAddModalOpen(false);
        setNewTitle('');
        setNewTopic('');
        setNewSummary('');
        setNewBody('');
        triggerToast('Reference Resource published to Library!');
      } else {
        triggerToast(res?.message || 'Failed to publish resource.');
      }
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Error saving resource.');
    } finally {
      setSubmitting(false);
    }
  };

  // Selected Resource Detail
  const activeResource = (resourcesList || []).find(r => r && (r.id === selectedResourceId || r._id === selectedResourceId));

  // Filter resources
  const filteredResources = (resourcesList || []).filter((res) => {
    if (!res) return false;
    const textTarget = `${res.title || ''} ${res.summary || ''} ${res.topic || ''} ${res.body || ''}`.toLowerCase();
    const matchesSearch = textTarget.includes((searchQuery || '').toLowerCase());
    const matchesWing = selectedWing === 'All' || (res.gradeWing || '').includes(selectedWing) || (selectedWing === 'Middle' && (res.grade === 7 || res.gradeLevel === 7));
    const matchesSubject = selectedSubject === 'All' || res.subject === selectedSubject || ((selectedSubject === 'Math' || selectedSubject === 'Mathematics') && (res.subject === 'Math' || res.subject === 'Mathematics')) || (selectedSubject === 'STEM' && (res.subject === 'Math' || res.subject === 'Mathematics' || res.subject === 'Science'));
    const matchesType = selectedType === 'All' || res.type === selectedType;
    const matchesTopic = selectedTopic === 'All' || res.topic === selectedTopic;
    return matchesSearch && matchesWing && matchesSubject && matchesType && matchesTopic;
  });

  const allTopics = ['All', ...new Set((resourcesList || []).map(r => r?.topic).filter(Boolean))];

  // ==========================================
  // VIEW 1: RESOURCE DETAIL VIEW
  // ==========================================
  if (activeResource) {
    const resourceId = activeResource.id || activeResource._id;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
        <button
          onClick={() => setSearchParams({})}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reference Library
        </button>

        {/* Hero Resource Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-card p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="primary" size="sm">{activeResource.subject}</Badge>
            <Badge variant="default" size="sm">{activeResource.topic}</Badge>
            {activeResource.gradeWing && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {activeResource.gradeWing}
              </span>
            )}
            <Badge variant="success" size="sm">
              {activeResource.type}
            </Badge>
            <span className="text-xs font-medium text-slate-400 ml-auto flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> {activeResource.readTime || '5 min read'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {activeResource.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            {activeResource.summary}
          </p>

          {/* Audio Overview & Speech Synthesis Ribbon */}
          <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-indigo-600 dark:text-cyan-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Listen to {activeResource.topic} Overview
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Hear text-to-speech reading of core pedagogical rules, formulas, and definitions.
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon={Volume2}
              onClick={() => {
                try {
                  const text = `${activeResource.title || ''}. Topic: ${activeResource.topic || ''}. Summary: ${activeResource.summary || activeResource.description || ''}.`;
                  speechHelper.speak(text);
                } catch (_) {}
              }}
            >
              Read Aloud
            </Button>
          </div>

          {/* Formulas View if present */}
          {activeResource.formulas && Array.isArray(activeResource.formulas) && activeResource.formulas.length > 0 && (
            <div className="mb-8 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Essential Formula Rules:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeResource.formulas.map((f, i) => {
                  const formulaName = typeof f === 'object' ? (f.name || f.title || `Rule ${i + 1}`) : `Rule ${i + 1}`;
                  const formulaRule = typeof f === 'object' ? (f.rule || f.formula || String(f)) : String(f);
                  const formulaTip = typeof f === 'object' ? (f.tip || f.description || '') : '';
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="font-bold text-indigo-700 dark:text-cyan-400 block mb-1">{formulaName}</span>
                      <code className="font-mono font-bold text-slate-900 dark:text-white text-sm block bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/80 dark:border-slate-800 mb-1.5">
                        {formulaRule}
                      </code>
                      {formulaTip && <span className="text-slate-500 dark:text-slate-400">{formulaTip}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Body Content */}
          {activeResource.body && (
            <div className="prose prose-slate max-w-none text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-8 bg-slate-50/50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 whitespace-pre-line font-sans">
              {activeResource.body}
            </div>
          )}

          {/* Practice Action */}
          <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-sm">
            <div>
              <span className="text-xs uppercase font-bold text-cyan-300 tracking-wider">
                Solidify Your Understanding
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">
                Ready to practice {activeResource.topic}?
              </h4>
              <p className="text-xs text-indigo-200">
                Launch adaptive practice questions calibrated to this topic.
              </p>
            </div>
            <Button
              variant="glow"
              iconRight={ArrowRight}
              onClick={() => navigate(`/practice?subject=${activeResource.subject}&topic=${encodeURIComponent(activeResource.topic)}`)}
            >
              Start {activeResource.topic} Practice →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: SEARCHABLE RESOURCE GRID
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Curriculum Reference Library
            </h1>
            <Badge variant="cyan" size="sm">Grades 1–12</Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Bite-sized concept guides, formula sheets, NCERT solutions, and official Greenwood Public School CBSE curriculum documents.
          </p>
        </div>

        {(role === 'teacher' || role === 'admin') && (
          <Button
            variant="primary"
            iconLeft={Plus}
            onClick={() => setAddModalOpen(true)}
          >
            + Add Resource
          </Button>
        )}
      </div>

      {/* Grade Wing Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
          Grade Wing:
        </span>
        {[
          { id: 'All', label: 'All Grades (1–12)' },
          { id: 'Primary', label: 'Primary Wing (1–5)' },
          { id: 'Middle', label: 'Middle Wing (6–8)' },
          { id: 'Secondary', label: 'Secondary Wing (9–10)' },
          { id: 'Senior Secondary', label: 'Senior Secondary (11–12)' }
        ].map(wing => (
          <button
            key={wing.id}
            onClick={() => setSelectedWing(wing.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedWing === wing.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-subtle'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {wing.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1">
            <Input
              placeholder="Search concepts, formulas, NCERT topics, or curriculum documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            {['All', 'Math', 'Science', 'English', 'Physics'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedSubject === s ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-subtle' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Content Type Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            {['All', 'Concept Guide', 'Formula Sheet', 'Curriculum Documents', 'NCERT Solutions'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  selectedType === t ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-subtle' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-1 flex-shrink-0">
            Topics:
          </span>
          {allTopics.map((top) => (
            <button
              key={top}
              onClick={() => setSelectedTopic(top)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-all ${
                selectedTopic === top
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No resources match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting different subjects or topics, or add new reference materials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const rId = res.id || res._id;
            return (
              <Card
                key={rId}
                hoverEffect
                className="p-6 h-full flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-card bg-white dark:bg-slate-900"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-subtle">
                      {res.thumbnail || '📖'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant={res.type === 'Curriculum Documents' ? 'warning' : 'primary'} size="sm">
                        {res.type}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400">{res.readTime || '5 min'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                    <span>{res.subject}</span>
                    {res.gradeWing && <span>• {res.gradeWing}</span>}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2 leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {res.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={BrainCircuit}
                    onClick={() => {
                      navigate(`/practice?topic=${encodeURIComponent(res.topic)}&subject=${encodeURIComponent(res.subject || 'Mathematics')}`);
                    }}
                    className="text-xs"
                  >
                    Practice Topic
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSearchParams({ id: rId })}
                    className="text-xs"
                  >
                    Read Guide →
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Curriculum Reference Resource"
      >
        <form onSubmit={handleAddResourceSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resource Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Master Quadratic Formula"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Math">Math</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Concept Guide">Concept Guide</option>
                <option value="Formula Sheet">Formula Sheet</option>
                <option value="Chapter Revision Notes">Chapter Revision Notes</option>
                <option value="Curriculum Documents">Curriculum Documents</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic</label>
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Fractions"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Summary</label>
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Brief summary..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Content (Markdown supported)</label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Full guide content..."
              rows={5}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish to Library'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
