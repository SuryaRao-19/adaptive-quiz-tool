import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Users, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  FileText, 
  BrainCircuit, 
  School,
  Sparkles,
  BarChart2,
  Calendar
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CourseManagement = () => {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin' || role === 'school_admin';

  // Demo courses rooted in Greenwood Public School CBSE Class VII Pilot
  const [courses, setCourses] = useState([
    {
      id: 'crs-g7-math',
      title: 'Class VII Mathematics (CBSE Core)',
      code: 'MATH-G7-2026',
      subject: 'Mathematics',
      grade: 7,
      section: '7-A (Pilot Cohort)',
      teacher: 'Mrs. Ananya Sharma',
      progress: 68,
      totalLessons: 18,
      completedLessons: 12,
      chaptersCount: 6,
      studentsCount: 20,
      description: 'Comprehensive rational numbers, linear transposition equations, algebraic expressions, and geometric mensuration.',
      chapters: [
        { number: 1, title: 'Integers and Rational Numbers', lessons: 4, status: 'Completed' },
        { number: 2, title: 'Fractions and Decimals', lessons: 3, status: 'Completed' },
        { number: 3, title: 'Simple Equations & Linear Transposition', lessons: 4, status: 'In Progress' },
        { number: 4, title: 'Lines and Angles', lessons: 3, status: 'Upcoming' },
        { number: 5, title: 'The Triangle and Its Properties', lessons: 4, status: 'Upcoming' }
      ]
    },
    {
      id: 'crs-g7-sci',
      title: 'Class VII Science & Experiential STEM',
      code: 'SCI-G7-2026',
      subject: 'Science',
      grade: 7,
      section: '7-A (Pilot Cohort)',
      teacher: 'Dr. Rajesh Verma',
      progress: 54,
      totalLessons: 16,
      completedLessons: 9,
      chaptersCount: 5,
      studentsCount: 20,
      description: 'Plant nutrition, heat & thermodynamic measurement, acids/bases, physical changes, and cellular respiration.',
      chapters: [
        { number: 1, title: 'Nutrition in Plants & Photosynthesis', lessons: 3, status: 'Completed' },
        { number: 2, title: 'Nutrition in Animals & Digestion', lessons: 3, status: 'Completed' },
        { number: 3, title: 'Heat Transfer and Thermometry', lessons: 4, status: 'In Progress' },
        { number: 4, title: 'Acids, Bases, and Salts', lessons: 3, status: 'Upcoming' }
      ]
    },
    {
      id: 'crs-g7-eng',
      title: 'Class VII English Language & Literature',
      code: 'ENG-G7-2026',
      subject: 'English',
      grade: 7,
      section: '7-A (Pilot Cohort)',
      teacher: 'Mr. David Paul',
      progress: 75,
      totalLessons: 14,
      completedLessons: 10,
      chaptersCount: 4,
      studentsCount: 20,
      description: 'Honeycomb prose, grammar mechanics, formal letter writing, and analytical reading comprehension.',
      chapters: [
        { number: 1, title: 'Three Questions & The Squirrel', lessons: 3, status: 'Completed' },
        { number: 2, title: 'A Gift of Chappals', lessons: 3, status: 'Completed' },
        { number: 3, title: 'Tenses and Modals Mastery', lessons: 4, status: 'In Progress' }
      ]
    }
  ]);

  const [selectedCourse, setSelectedCourse] = useState(courses[0]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              LMS 4.0 Course Directory
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Greenwood Public School &bull; CBSE Class VII Pilot
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-400" />
            {isTeacher ? 'My Teaching Courses' : isAdmin ? 'School Course Catalog' : 'My Enrolled Courses'}
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Centralized curriculum syllabus, structured chapters, mapped learning objectives, and completion tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={() => navigate('/practice')}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4 text-cyan-300" />
            Adaptive Practice
          </Button>
          <Button
            onClick={() => navigate('/test')}
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs flex items-center gap-2 shadow-md"
          >
            <Clock className="w-4 h-4" />
            Test Centre
          </Button>
        </div>
      </div>

      {/* Grid Layout: Courses List + Course Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Courses Card Column */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Enrolled Cohorts ({courses.length})</span>
            <Badge variant="subtle" className="text-[10px]">Academic 2026–27</Badge>
          </h2>

          {courses.map((course) => {
            const isSelected = selectedCourse?.id === course.id;
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-xs font-mono text-indigo-600 dark:text-indigo-400">
                    {course.code}
                  </span>
                  <Badge variant={course.progress >= 70 ? 'success' : 'primary'} className="text-[10px]">
                    {course.progress}% Completed
                  </Badge>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {course.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {course.section}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    {course.chaptersCount} Chapters
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Course Syllabus & Learning Path */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCourse && (
            <Card className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs">{selectedCourse.subject}</Badge>
                    <span className="text-xs text-slate-400 font-mono">{selectedCourse.code}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedCourse.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assigned Educator: <strong className="text-slate-700 dark:text-slate-200">{selectedCourse.teacher}</strong> &bull; Cohort: {selectedCourse.section}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {selectedCourse.completedLessons} / {selectedCourse.totalLessons}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Lessons Completed
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="my-5">
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                  <span>Syllabus Pacing</span>
                  <span>{selectedCourse.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${selectedCourse.progress}%` }}
                  />
                </div>
              </div>

              {/* Chapters & Units List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Curriculum Units & Chapters
                </h3>
                {selectedCourse.chapters.map((ch) => (
                  <div 
                    key={ch.number}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {ch.number}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Chapter {ch.number}: {ch.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ch.lessons} Structured Lessons &bull; Interactive Checkpoints
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ch.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : ch.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {ch.status}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => navigate('/lesson-planner')}
                        className="text-xs p-1"
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3 justify-end">
                <Button
                  onClick={() => navigate('/lesson-planner')}
                  variant="outline"
                  className="text-xs"
                >
                  View Lesson Planner
                </Button>
                <Button
                  onClick={() => navigate('/practice')}
                  variant="primary"
                  className="text-xs bg-indigo-600 text-white"
                >
                  Start Chapter Practice
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
export default CourseManagement;
