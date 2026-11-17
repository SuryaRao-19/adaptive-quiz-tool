import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  School, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Award, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';

export const AcademicCalendar = () => {
  const { user, role } = useContext(AuthContext);
  const [filterType, setFilterType] = useState('ALL'); // ALL, EXAM, HOLIDAY, ASSIGNMENT, EVENT

  const events = [
    {
      id: 'evt-01',
      title: 'Class VII Mathematics Diagnostic Assessment',
      type: 'EXAM',
      startDate: '2026-11-18',
      endDate: '2026-11-18',
      time: '09:00 AM – 09:30 AM',
      location: 'Live Test Centre (Digital Lab)',
      cohort: 'Grade 7-A & 7-B',
      description: 'Adaptive diagnostic covering Rational Numbers and Simple Equations.'
    },
    {
      id: 'evt-02',
      title: 'Worksheet 3.2 Transposition Submission Deadline',
      type: 'ASSIGNMENT',
      startDate: '2026-11-22',
      endDate: '2026-11-22',
      time: '11:59 PM',
      location: 'AdaptIQ LMS Submissions',
      cohort: 'Grade 7-A',
      description: 'NCERT Exemplar problems 1-10 with balancing verification steps.'
    },
    {
      id: 'evt-03',
      title: 'Guru Nanak Jayanti (Gazetted School Holiday)',
      type: 'HOLIDAY',
      startDate: '2026-11-24',
      endDate: '2026-11-24',
      time: 'All Day',
      location: 'Both Campuses Closed',
      cohort: 'All Classes (Pre-Nursery through Grade 12)',
      description: 'Official school closed for festive observation.'
    },
    {
      id: 'evt-04',
      title: 'Term-1 Parent-Teacher Consultation Meeting (PTM-2)',
      type: 'EVENT',
      startDate: '2026-11-28',
      endDate: '2026-11-28',
      time: '08:30 AM – 01:30 PM',
      location: 'Sector-9 Main Campus & Virtual Portal',
      cohort: 'Middle Wing (Grades 6–8)',
      description: 'Review of student learning curves, BKT mastery rates, and remedial trajectories.'
    },
    {
      id: 'evt-05',
      title: 'Inter-House STEM & Robotics Olympiad',
      type: 'EVENT',
      startDate: '2026-12-05',
      endDate: '2026-12-06',
      time: '10:00 AM – 02:30 PM',
      location: 'Senior Wing Auditorium',
      cohort: 'Grades 6–10',
      description: 'Tagore, Gandhi, Nehru, and Subhash Houses compete in algorithmic problem solving.'
    },
    {
      id: 'evt-06',
      title: 'Term-1 Summative Term Examination Window',
      type: 'EXAM',
      startDate: '2026-12-14',
      endDate: '2026-12-22',
      time: '08:30 AM – 11:30 AM',
      location: 'Examination Halls',
      cohort: 'Grades 1 through 12',
      description: 'Formal CBSE-aligned half-yearly written and objective evaluations.'
    }
  ];

  const filteredEvents = events.filter(e => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              LMS 4.0 Calendar
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Greenwood Public School &bull; Academic Session 2026–2027
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-indigo-400" />
            Institutional Academic Calendar
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Verified schedule of school examinations, assignment submission checkpoints, gazetted holidays, and parent-teacher consultations.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Milestones' },
            { id: 'EXAM', label: 'Examinations' },
            { id: 'ASSIGNMENT', label: 'Deadlines' },
            { id: 'HOLIDAY', label: 'Holidays' },
            { id: 'EVENT', label: 'School Events' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === tab.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((evt) => {
          const isExam = evt.type === 'EXAM';
          const isHoliday = evt.type === 'HOLIDAY';
          const isDeadline = evt.type === 'ASSIGNMENT';

          return (
            <Card 
              key={evt.id} 
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isExam 
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                      : isHoliday
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'
                      : isDeadline
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200'
                  }`}>
                    {evt.type}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {evt.startDate}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{evt.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{evt.cohort}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default AcademicCalendar;
