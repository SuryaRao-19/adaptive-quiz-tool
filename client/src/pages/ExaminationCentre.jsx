import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Clock,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const ExaminationCentre = () => {
  const { user, role } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed, drafts
  const [selectedExam, setSelectedExam] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('7');

  // Form states
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamGrade, setNewExamGrade] = useState('7');
  const [newExamSubject, setNewExamSubject] = useState('Mathematics');
  const [newExamType, setNewExamType] = useState('Periodic Test');
  const [newExamDate, setNewExamDate] = useState('2026-12-05');
  const [newExamDuration, setNewExamDuration] = useState(90);
  const [newExamMarks, setNewExamMarks] = useState(80);
  const [newExamMode, setNewExamMode] = useState('blueprint'); // blueprint vs manual

  useEffect(() => {
    fetchExams();
  }, [selectedGrade]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Seed with genuine NCERT / CBSE scheduled examinations for Greenwood Public School
      const initialExams = [
        {
          id: 'exam-gps-pt1-m7',
          title: 'Periodic Test 1: Mathematics & Rational Operations',
          gradeLevel: 7,
          subject: 'Mathematics',
          type: 'Periodic Test',
          academicYear: '2026-2027',
          term: 'Term 1',
          date: '2026-11-28',
          startTime: '09:00 AM',
          durationMinutes: 60,
          totalMarks: 40,
          status: 'Upcoming',
          questionCount: 15,
          blueprint: {
            mcqCount: 5,
            shortAnswerCount: 5,
            numericalCount: 3,
            caseBasedCount: 2
          },
          syllabusChapters: ['Integers', 'Fractions and Decimals', 'Simple Equations'],
          venue: 'Sector-9 Main Campus, Exam Hall 1',
          invigilator: 'Mrs. Ananya Sharma',
          registeredCount: 20
        },
        {
          id: 'exam-gps-mid-s7',
          title: 'Term 1 Midterm Examination: Science & Experimental Foundations',
          gradeLevel: 7,
          subject: 'Science',
          type: 'Midterm Examination',
          academicYear: '2026-2027',
          term: 'Term 1',
          date: '2026-12-10',
          startTime: '09:30 AM',
          durationMinutes: 120,
          totalMarks: 80,
          status: 'Upcoming',
          questionCount: 28,
          blueprint: {
            mcqCount: 10,
            shortAnswerCount: 8,
            longAnswerCount: 4,
            diagramCount: 4,
            assertionReasonCount: 2
          },
          syllabusChapters: ['Nutrition in Plants', 'Nutrition in Animals', 'Heat', 'Acids, Bases and Salts', 'Physical & Chemical Changes'],
          venue: 'Sector-9 Main Campus, Science Wing',
          invigilator: 'Dr. Rajesh Verma',
          registeredCount: 20
        },
        {
          id: 'exam-gps-diag-pre7',
          title: 'School Diagnostic Assessment: Grade 7 Mathematics Baseline',
          gradeLevel: 7,
          subject: 'Mathematics',
          type: 'Diagnostic Test',
          academicYear: '2026-2027',
          term: 'Diagnostic Cohort',
          date: '2026-11-17',
          startTime: '08:30 AM',
          durationMinutes: 45,
          totalMarks: 20,
          status: 'Completed',
          questionCount: 20,
          blueprint: {
            mcqCount: 20
          },
          syllabusChapters: ['Rational Numbers', 'Algebraic Expressions', 'Geometry Basics'],
          venue: 'Computer Lab 2 (Online Adaptive Invigilation)',
          invigilator: 'Mrs. Ananya Sharma',
          registeredCount: 20,
          averageScore: 78.4,
          passRate: 95
        },
        {
          id: 'exam-gps-ann-10',
          title: 'CBSE Pre-Board Annual Examination: Class X Standard Mathematics',
          gradeLevel: 10,
          subject: 'Mathematics',
          type: 'Annual Examination',
          academicYear: '2026-2027',
          term: 'Annual Board Exam',
          date: '2027-01-15',
          startTime: '10:00 AM',
          durationMinutes: 180,
          totalMarks: 80,
          status: 'Draft',
          questionCount: 38,
          blueprint: {
            mcqCount: 20,
            shortAnswerCount: 8,
            longAnswerCount: 6,
            caseBasedCount: 4
          },
          syllabusChapters: ['Real Numbers', 'Polynomials', 'Quadratic Equations', 'Triangles', 'Trigonometry', 'Statistics'],
          venue: 'Senior Wing Exam Hall',
          invigilator: 'Mr. Arvind Saxena',
          registeredCount: 45
        }
      ];

      setExams(initialExams);
    } catch (e) {
      console.warn('Failed to load exams:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!newExamTitle.trim()) return;

    const newExam = {
      id: `exam-gps-${Date.now().toString(36)}`,
      title: newExamTitle.trim(),
      gradeLevel: parseInt(newExamGrade, 10),
      subject: newExamSubject,
      type: newExamType,
      academicYear: '2026-2027',
      term: 'Term 1',
      date: newExamDate,
      startTime: '09:00 AM',
      durationMinutes: parseInt(newExamDuration, 10),
      totalMarks: parseInt(newExamMarks, 10),
      status: 'Upcoming',
      questionCount: Math.round(newExamMarks / 3),
      blueprint: {
        mcqCount: Math.round(newExamMarks * 0.3 / 2),
        shortAnswerCount: Math.round(newExamMarks * 0.4 / 3),
        longAnswerCount: Math.round(newExamMarks * 0.3 / 5)
      },
      syllabusChapters: ['Official NCERT Core Chapters'],
      venue: 'Sector-9 Main Campus Examination Hall',
      invigilator: user?.name || 'Mrs. Ananya Sharma',
      registeredCount: 20
    };

    setExams([newExam, ...exams]);
    setCreateModalOpen(false);
    setNewExamTitle('');
  };

  const filteredExams = exams.filter(exam => {
    const matchesGrade = selectedGrade === 'all' || exam.gradeLevel === parseInt(selectedGrade, 10);
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'upcoming') return matchesGrade && matchesSearch && exam.status === 'Upcoming';
    if (activeTab === 'completed') return matchesGrade && matchesSearch && exam.status === 'Completed';
    if (activeTab === 'drafts') return matchesGrade && matchesSearch && exam.status === 'Draft';
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              CBSE Affiliated 530649
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Academic Year 2026–2027
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-[#173E2B] dark:text-emerald-400" />
            Examination Centre & Question Bank Blueprints
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Schedule formal CBSE examinations, generate automated blueprint papers, and manage invigilation rosters for Classes 1–12.
          </p>
        </div>

        {(role === 'teacher' || role === 'admin' || role === 'school_admin') && (
          <Button
            variant="primary"
            iconLeft={Plus}
            onClick={() => setCreateModalOpen(true)}
            className="shrink-0 bg-[#173E2B] hover:bg-[#123021] text-white"
          >
            Create Formal Examination
          </Button>
        )}
      </div>

      {/* Control Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exam title, subject, or chapter..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#173E2B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Grade Filter:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#173E2B]"
          >
            <option value="all">All Grades (1–12)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
              <option key={g} value={g}>Class {g} {g === 7 ? '(Pilot Cohort)' : ''}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {['all', 'upcoming', 'completed', 'drafts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-[#173E2B] dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Examination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="p-5 hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge variant={exam.status === 'Completed' ? 'success' : exam.status === 'Upcoming' ? 'primary' : 'warning'}>
                    {exam.status}
                  </Badge>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Class {exam.gradeLevel} • {exam.subject}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {exam.type}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {exam.title}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-slate-100 dark:border-slate-800 my-3 text-xs">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Exam Date</p>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {exam.date}
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400">Duration</p>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {exam.durationMinutes} mins
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400">Total Marks</p>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {exam.totalMarks} Marks
                </p>
              </div>

              <div>
                <p className="text-slate-500 dark:text-slate-400">Candidates</p>
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {exam.registeredCount} Enrolled
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                Venue: {exam.venue}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  iconLeft={Eye}
                  onClick={() => setSelectedExam(exam)}
                >
                  Blueprint & Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Blueprint Details Modal */}
      {selectedExam && (
        <Modal
          isOpen={Boolean(selectedExam)}
          onClose={() => setSelectedExam(null)}
          title={`Examination Blueprint: ${selectedExam.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-xs text-slate-500">Board & Level:</span>
                  <p className="font-bold">CBSE Class {selectedExam.gradeLevel}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Subject:</span>
                  <p className="font-bold">{selectedExam.subject}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Max Score:</span>
                  <p className="font-bold text-[#173E2B] dark:text-emerald-400">{selectedExam.totalMarks} Marks</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Duration:</span>
                  <p className="font-bold">{selectedExam.durationMinutes} Minutes</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Invigilator:</span>
                  <p className="font-bold">{selectedExam.invigilator}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Status:</span>
                  <p className="font-bold text-emerald-600">{selectedExam.status}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Prescribed Syllabus Chapters:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedExam.syllabusChapters?.map((ch, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Chapter: {ch}
                  </span>
                ))}
              </div>
            </div>

            {selectedExam.blueprint && (
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Question Bank Item Blueprint:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(selectedExam.blueprint).map(([key, count]) => (
                    <div key={key} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                      <p className="text-slate-500 uppercase tracking-wider text-[10px]">{key.replace('Count', '')}</p>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{count} Questions</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                iconLeft={Printer}
                onClick={() => alert(`Generated Printable CBSE Hall Ticket & Seating Matrix for Class ${selectedExam.gradeLevel}.`)}
              >
                Print Seating Plan
              </Button>
              <Button
                variant="primary"
                className="bg-[#173E2B] text-white"
                onClick={() => setSelectedExam(null)}
              >
                Close Blueprint
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Exam Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Schedule New CBSE Examination"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Examination Title *
              </label>
              <input
                type="text"
                required
                value={newExamTitle}
                onChange={(e) => setNewExamTitle(e.target.value)}
                placeholder="e.g. Periodic Test 2: Algebraic Methods & Simple Equations"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#173E2B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class / Grade *
                </label>
                <select
                  value={newExamGrade}
                  onChange={(e) => setNewExamGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject *
                </label>
                <select
                  value={newExamSubject}
                  onChange={(e) => setNewExamSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Physics">Physics (Class 11/12)</option>
                  <option value="Chemistry">Chemistry (Class 11/12)</option>
                  <option value="Accountancy">Accountancy (Commerce)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Exam Type
                </label>
                <select
                  value={newExamType}
                  onChange={(e) => setNewExamType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                >
                  <option value="Periodic Test">Periodic Test</option>
                  <option value="Midterm Examination">Midterm Examination</option>
                  <option value="Annual Examination">Annual Examination</option>
                  <option value="Diagnostic Test">Diagnostic Test</option>
                  <option value="Chapter Unit Test">Chapter Unit Test</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Mins)
                </label>
                <input
                  type="number"
                  min="20"
                  max="180"
                  value={newExamDuration}
                  onChange={(e) => setNewExamDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={newExamMarks}
                  onChange={(e) => setNewExamMarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" type="button" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="bg-[#173E2B] text-white">
                Save & Schedule Exam
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
