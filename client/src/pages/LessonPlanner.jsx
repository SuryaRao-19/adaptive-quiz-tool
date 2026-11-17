import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  BookOpen, 
  ChevronRight, 
  Plus, 
  Link as LinkIcon, 
  Download, 
  Check, 
  Sparkles,
  School,
  ExternalLink
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LessonPlanner = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin' || role === 'school_admin';

  const [lessons, setLessons] = useState([
    {
      id: 'lsn-01',
      title: 'Transposition Method for Linear Equations',
      subject: 'Mathematics',
      grade: 7,
      chapter: 'Simple Equations (Chapter 3)',
      topic: 'Solving Multi-Step Equations by Transposition',
      learningObjective: 'Isolate variables using inverse operations across equality boundaries without arithmetic error.',
      teachingDate: '2026-11-18',
      durationMinutes: 45,
      status: 'In Progress',
      resources: [
        { type: 'PDF Worksheet', title: 'CBSE Transposition Drill Sheet (20 Items)', size: '1.2 MB' },
        { type: 'Reference Doc', title: 'NCERT Class VII Chapter 3 Exemplar Solutions', size: '2.4 MB' }
      ],
      homework: 'Complete Exercises 3.2 problems 1 through 8. Practice inverse signs on the number line.',
      teacherNotes: 'Focus heavily on negative coefficient transposition: -3x = 12 implies x = -4.'
    },
    {
      id: 'lsn-02',
      title: 'Rational Numbers on a Number Line',
      subject: 'Mathematics',
      grade: 7,
      chapter: 'Rational Numbers (Chapter 1)',
      topic: 'Equivalence and Density of Rational Numbers',
      learningObjective: 'Locate positive and negative rational fractions symmetrically on a continuous real number line.',
      teachingDate: '2026-11-14',
      durationMinutes: 40,
      status: 'Completed',
      resources: [
        { type: 'Worksheet', title: 'Number Line Density Worksheet', size: '840 KB' }
      ],
      homework: 'Mark 5/7 and -3/4 on the coordinate line. Self-check using AdaptIQ solutions.',
      teacherNotes: 'Students demonstrated 88% accuracy on integer signs.'
    },
    {
      id: 'lsn-03',
      title: 'Autotrophic Plant Nutrition & Stomatal Regulation',
      subject: 'Science',
      grade: 7,
      chapter: 'Nutrition in Plants (Chapter 1)',
      topic: 'Photosynthesis Mechanism & Light Reactions',
      learningObjective: 'Explain light-dependent chlorophyll reactions and gas exchange through guard-cell stomata.',
      teachingDate: '2026-11-20',
      durationMinutes: 45,
      status: 'Upcoming',
      resources: [
        { type: 'Lab Guide', title: 'Stomatal Peel Iodine Test Protocol', size: '3.1 MB' }
      ],
      homework: 'Draw and label the stomatal pore structure in the science journal.',
      teacherNotes: 'Lab demonstration scheduled for 10:15 AM in Biology Lab.'
    }
  ]);

  const [selectedLesson, setSelectedLesson] = useState(lessons[0]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              LMS 4.0 Academic Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Greenwood Public School &bull; Grade 7 Middle Wing
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-3">
            <Layers className="w-8 h-8 text-indigo-400" />
            {isTeacher ? 'Lesson Planner & Syllabus Manager' : 'Class VII Lesson Schedule'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Structured daily lesson plans, pedagogy outcomes, curriculum alignment, homework guidelines, and verified learning materials.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => navigate('/courses')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-cyan-300" />
            Course Overview
          </Button>
          <Button
            onClick={() => navigate('/library')}
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-2 shadow-md"
          >
            <FileText className="w-4 h-4" />
            Resource Library
          </Button>
        </div>
      </div>

      {/* Grid: Lesson Schedule Timeline + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Items */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Scheduled Lessons ({lessons.length})</span>
            <Badge variant="subtle" className="text-[10px]">November 2026</Badge>
          </h2>

          {lessons.map((lesson) => {
            const isSelected = selectedLesson?.id === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="primary" className="text-[10px] font-mono">{lesson.subject}</Badge>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    lesson.status === 'Completed' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : lesson.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {lesson.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-2">
                  {lesson.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {lesson.chapter}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {lesson.teachingDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {lesson.durationMinutes} mins
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Lesson Detail */}
        <div className="lg:col-span-2">
          {selectedLesson && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{selectedLesson.subject}</Badge>
                    <span className="text-xs text-slate-400">{selectedLesson.chapter}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedLesson.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Topic: <strong className="text-slate-700 dark:text-slate-200">{selectedLesson.topic}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>{selectedLesson.durationMinutes} Minutes</span>
                  <span className="text-slate-300">|</span>
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{selectedLesson.teachingDate}</span>
                </div>
              </div>

              {/* Learning Objective Box */}
              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  CBSE Learning Objective
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedLesson.learningObjective}
                </p>
              </div>

              {/* Required Resources */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Attached Educational Resources ({selectedLesson.resources.length})</span>
                  <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer" onClick={() => navigate('/library')}>
                    Open Library &rarr;
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLesson.resources.map((res, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {res.title}
                          </p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {res.type} &bull; {res.size}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="p-1.5 text-slate-500 hover:text-indigo-600">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework & Practice Section */}
              <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1">
                  Assigned Homework & Practice Task
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {selectedLesson.homework}
                </p>
              </div>

              {/* Teacher Pedagogy Notes */}
              {selectedLesson.teacherNotes && (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <strong>Pedagogical Notes:</strong> {selectedLesson.teacherNotes}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/practice')}
                  className="text-xs"
                >
                  Launch Topic Practice
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/test')}
                  className="text-xs bg-indigo-600 text-white"
                >
                  Diagnostic Assessment
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default LessonPlanner;
