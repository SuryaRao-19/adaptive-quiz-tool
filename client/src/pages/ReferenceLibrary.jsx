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
  Plus
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AuthContext } from '../context/AuthContext';
import { getResources, addResource as apiAddResource } from '../services/libraryService';
import { MOCK_LIBRARY_RESOURCES } from '../services/mockData';

export const ReferenceLibrary = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedResourceId = searchParams.get('id');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
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
  const [newType, setNewType] = useState('Step-by-Step Guide');
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
  const activeResource = resourcesList.find(r => r.id === selectedResourceId || r._id === selectedResourceId);

  // Filter resources
  const filteredResources = resourcesList.filter((res) => {
    const matchesSearch = (res.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (res.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (res.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || res.subject === selectedSubject;
    const matchesType = selectedType === 'All' || res.type === selectedType;
    const matchesTopic = selectedTopic === 'All' || res.topic === selectedTopic;
    return matchesSearch && matchesSubject && matchesType && matchesTopic;
  });

  // Unique topics for filter
  const allTopics = ['All', ...new Set(resourcesList.map(r => r.topic).filter(Boolean))];

  // ==========================================
  // VIEW 1: RESOURCE DETAIL VIEW
  // ==========================================
  if (activeResource) {
    const resourceId = activeResource.id || activeResource._id;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => setSearchParams({})}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reference Library
        </button>

        {/* Hero Resource Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="primary" size="sm">{activeResource.subject}</Badge>
            <Badge variant="default" size="sm">{activeResource.topic}</Badge>
            <Badge variant={activeResource.type === 'Step-by-Step Guide' ? 'primary' : activeResource.type === 'Formula Sheet' ? 'warning' : 'success'} size="sm">
              {activeResource.type}
            </Badge>
            <span className="text-xs font-medium text-slate-400 ml-auto flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" /> {activeResource.readTime || '5 min read'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            {activeResource.title}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            {activeResource.summary}
          </p>

          {/* Dynamic Content Renderer based on Content Type */}
          {activeResource.type === 'Step-by-Step Guide' && (
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-cyan-50/70 dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary,#4F46E5)] text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{activeResource.title}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Curriculum Verified Worked Example & Socratic Walkthrough</span>
                </div>
              </div>
              <Badge variant="primary" size="sm">Step-by-Step Guide</Badge>
            </div>
          )}

          {activeResource.type === 'Formula Sheet' && Array.isArray(activeResource.formulas) && (
            <div className="mb-8 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-2">
                Essential Formula Rules:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeResource.formulas.map((f, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-indigo-700 block mb-1">{f.name}</span>
                    <code className="font-mono font-bold text-slate-900 text-sm block bg-white p-2 rounded-lg border border-slate-200/80 mb-1.5">
                      {f.rule}
                    </code>
                    <span className="text-slate-500">{f.tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeResource.body && (
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 whitespace-pre-line font-sans">
              {activeResource.body}
            </div>
          )}

          {/* Related Practice CTA */}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Curriculum Reference Library
            </h1>
            <Badge variant="cyan" size="sm">Search & Learn</Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Bite-sized articles, step-by-step guides, and formula sheets aligned with secondary Math & Science.
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

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:flex-1">
            <Input
              placeholder="Search concepts, formulas, step-by-step guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Math', 'Science'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedSubject === s ? 'bg-white text-indigo-700 shadow-subtle' : 'text-slate-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Content Type Filter */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Article', 'Step-by-Step Guide', 'Formula Sheet'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  selectedType === t ? 'bg-white text-indigo-700 shadow-subtle' : 'text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
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
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid or Empty State */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No resources match your search</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting different subjects or topics, or add new reference materials.
          </p>
          {(role === 'teacher' || role === 'admin') && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              iconLeft={Plus}
              onClick={() => setAddModalOpen(true)}
            >
              Add First Resource
            </Button>
          )}
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredResources.map((res) => {
            const rId = res.id || res._id;
            return (
              <motion.div
                key={rId}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card
                  hoverEffect
                  onClick={() => setSearchParams({ id: rId })}
                  className="p-6 h-full flex flex-col justify-between cursor-pointer border border-slate-200 dark:border-slate-800 shadow-card"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shadow-subtle">
                        {res.thumbnail || '📖'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={res.type === 'Step-by-Step Guide' ? 'primary' : res.type === 'Formula Sheet' ? 'warning' : 'success'} size="sm">
                          {res.type}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">{res.readTime || '5 min'}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                      {res.subject} • {res.topic}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2 leading-snug">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {res.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-cyan-400">
                    <span>View Resource</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Curriculum Reference Resource"
      >
        <form onSubmit={handleAddResourceSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Master Quadratic Formula"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Math">Math</option>
                <option value="Science">Science</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Algebra"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-2 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Step-by-Step Guide">Step Guide</option>
                <option value="Formula Sheet">Formula Sheet</option>
                <option value="Article">Article</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 px-2 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Foundational">Foundational</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Read Time</label>
              <Input
                value={newReadTime}
                onChange={(e) => setNewReadTime(e.target.value)}
                placeholder="5 min read"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Summary (1-2 sentences)</label>
            <Input
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Brief overview explaining what students learn..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Content / Body</label>
            <textarea
              rows={5}
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              placeholder="Write the full lesson text, worked solution steps, or formula rules..."
              required
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Publishing...' : 'Publish to Library'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
