import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  FileText, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  User, 
  Award, 
  MessageSquare,
  Sparkles,
  School
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AssignmentManager = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin' || role === 'school_admin';

  const [assignments, setAssignments] = useState([
    {
      id: 'asg-01',
      title: 'Worksheet 3.2: Linear Transposition & Equations',
      subject: 'Mathematics',
      grade: 7,
      classroom: 'Grade 7-A (GPS7M)',
      teacher: 'Mrs. Ananya Sharma',
      dueDate: '2026-11-22',
      maxMarks: 25,
      status: 'Active',
      submissionType: 'File Upload & Text',
      instructions: 'Solve questions 1 through 10 from the attached NCERT Exemplar worksheet. Show all transposition balancing steps clearly.',
      attachment: 'Worksheet_3.2_Linear_Equations.pdf',
      submittedCount: 16,
      totalStudents: 20,
      studentSubmission: {
        status: 'Submitted',
        submittedAt: '2026-11-17 14:30',
        textAnswer: 'Attached PDF contains solved questions 1 to 10 with verified checks for each root.',
        marksAwarded: 24,
        feedback: 'Outstanding step-by-step transposition Aarav! Excellent precision on handling negative coefficients.',
        graded: true
      }
    },
    {
      id: 'asg-02',
      title: 'Lab Report: Stomatal Pore & Photosynthesis Observation',
      subject: 'Science',
      grade: 7,
      classroom: 'Grade 7-A (GPS7M)',
      teacher: 'Dr. Rajesh Verma',
      dueDate: '2026-11-25',
      maxMarks: 20,
      status: 'Active',
      submissionType: 'PDF Document',
      instructions: 'Upload scanned laboratory observation drawings showing open vs closed guard cells under 40x magnification.',
      attachment: 'Lab_Report_Template_Grade7_Science.pdf',
      submittedCount: 12,
      totalStudents: 20,
      studentSubmission: {
        status: 'Pending Submission',
        submittedAt: null,
        textAnswer: '',
        marksAwarded: null,
        feedback: null,
        graded: false
      }
    },
    {
      id: 'asg-03',
      title: 'Creative Writing: Three Questions Character Sketch',
      subject: 'English',
      grade: 7,
      classroom: 'Grade 7-A (GPS7M)',
      teacher: 'Mr. David Paul',
      dueDate: '2026-11-15',
      maxMarks: 15,
      status: 'Closed',
      submissionType: 'Text & File',
      instructions: 'Write a 200-word analytical character sketch of the King from Tolstoy’s Three Questions.',
      attachment: 'Character_Sketch_Rubric.pdf',
      submittedCount: 20,
      totalStudents: 20,
      studentSubmission: {
        status: 'Submitted',
        submittedAt: '2026-11-14 11:20',
        textAnswer: 'The King demonstrates profound humility and moral curiosity when seeking wisdom from the hermit...',
        marksAwarded: 14,
        feedback: 'Very thoughtful textual citations and clear prose structure.',
        graded: true
      }
    }
  ]);

  const [selectedAsg, setSelectedAsg] = useState(assignments[0]);
  const [submissionText, setSubmissionText] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitWork = (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;

    setAssignments(prev => prev.map(a => {
      if (a.id === selectedAsg.id) {
        return {
          ...a,
          studentSubmission: {
            status: 'Submitted',
            submittedAt: new Date().toLocaleString(),
            textAnswer: submissionText,
            marksAwarded: null,
            feedback: 'Submitted successfully. Awaiting teacher grading.',
            graded: false
          }
        };
      }
      return a;
    }));

    setSelectedAsg(prev => ({
      ...prev,
      studentSubmission: {
        status: 'Submitted',
        submittedAt: new Date().toLocaleString(),
        textAnswer: submissionText,
        marksAwarded: null,
        feedback: 'Submitted successfully. Awaiting teacher grading.',
        graded: false
      }
    }));

    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              LMS 4.0 Assignment Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Greenwood Public School &bull; Grade 7 Middle Wing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-indigo-400" />
            {isTeacher ? 'Assignment Management & Review' : 'Assignments & Homework'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Track homework submissions, submit worksheets, view marks allocations, and read teacher feedback.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isTeacher && (
            <Button
              onClick={() => navigate('/teacher/grading')}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-cyan-300" />
              Grading Centre
            </Button>
          )}
          <Button
            onClick={() => navigate('/courses')}
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-2 shadow-md"
          >
            <Calendar className="w-4 h-4" />
            My Courses
          </Button>
        </div>
      </div>

      {/* Grid: Assignments List + Detailed Work Submission Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assignment Cards */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Class Assignments ({assignments.length})</span>
            <Badge variant="subtle" className="text-[10px]">Session 2026–27</Badge>
          </h2>

          {assignments.map((asg) => {
            const isSelected = selectedAsg?.id === asg.id;
            return (
              <div
                key={asg.id}
                onClick={() => setSelectedAsg(asg)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="primary" className="text-[10px] font-mono">{asg.subject}</Badge>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    asg.studentSubmission?.status === 'Submitted'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {isTeacher ? `${asg.submittedCount}/${asg.totalStudents} Submissions` : asg.studentSubmission?.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  Due: <strong className="text-slate-700 dark:text-slate-200">{asg.dueDate}</strong> &bull; Max: {asg.maxMarks} marks
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{asg.classroom}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{asg.teacher}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Submission & Review Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAsg && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{selectedAsg.subject}</Badge>
                    <span className="text-xs text-slate-400">{selectedAsg.classroom}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedAsg.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assigned Educator: <strong className="text-slate-700 dark:text-slate-200">{selectedAsg.teacher}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {selectedAsg.maxMarks} Marks
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Due: {selectedAsg.dueDate}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Assignment Instructions
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedAsg.instructions}
                </p>
              </div>

              {/* Attached Worksheet */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-500 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedAsg.attachment}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Official CBSE Class VII Worksheet File (PDF)
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </div>

              {/* Student Submission / Grading Status Box */}
              {selectedAsg.studentSubmission?.status === 'Submitted' ? (
                <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      Work Submitted Successfully
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {selectedAsg.studentSubmission.submittedAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{selectedAsg.studentSubmission.textAnswer}"
                  </p>

                  {selectedAsg.studentSubmission.graded && (
                    <div className="mt-2 pt-3 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-400 block">
                          Teacher Feedback:
                        </span>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                          {selectedAsg.studentSubmission.feedback}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {selectedAsg.studentSubmission.marksAwarded} / {selectedAsg.maxMarks}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Submission Form */
                <form onSubmit={handleSubmitWork} className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Submit Your Work
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Text Answer / Submission Notes:
                    </label>
                    <textarea
                      rows={4}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Type your answer, methodology explanation, or write notes regarding your uploaded work..."
                      className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2 bg-slate-50/50 dark:bg-slate-800/30">
                    <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Upload Document or Solution Image (PDF, PNG, JPG up to 15MB)
                    </p>
                    <input type="file" className="text-xs text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700" />
                  </div>

                  {submitSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Assignment submitted successfully to {selectedAsg.teacher}!
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="text-xs bg-indigo-600 text-white"
                    >
                      Turn In Assignment
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default AssignmentManager;
