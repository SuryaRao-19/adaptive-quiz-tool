import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  School, 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Filter, 
  Pin, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';

export const AnnouncementHub = () => {
  const { user, role } = useContext(AuthContext);
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin' || role === 'school_admin';
  const isParent = role === 'parent';

  const [filterType, setFilterType] = useState('ALL'); // ALL, SCHOOL, CLASS, ACADEMIC

  const announcements = [
    {
      id: 'anc-01',
      title: 'CBSE Class VII Mathematics Diagnostic Assessment Schedule',
      category: 'ACADEMIC',
      target: 'Grade 7-A & 7-B Students & Parents',
      author: 'Mrs. Ananya Sharma (Grade 7 Math Head)',
      date: '2026-11-17',
      priority: 'HIGH',
      isPinned: true,
      content: 'The Term-1 Midterm Diagnostic Assessment in Mathematics will commence tomorrow on the Greenwood Digital Learning Platform. Students should review Linear Transposition and Rational Number operations in Practice Mode. Time duration: 20 minutes.',
      tags: ['Diagnostic', 'Class VII', 'Mathematics']
    },
    {
      id: 'anc-02',
      title: 'Institutional Campus Operations & Timings Notice',
      category: 'SCHOOL',
      target: 'All Parents & Faculty (Both Campuses)',
      author: 'Dr. K. S. Raman (Principal & Director)',
      date: '2026-11-15',
      priority: 'NORMAL',
      isPinned: true,
      content: 'Senior Wing (Sector-9) operates Monday through Saturday from 07:30 AM to 03:00 PM. Junior & Kindergarten Wing (1589, Housing Board Colony Rd, Sector 10A) operates from 08:30 AM to 12:30 PM. Parents are requested to adhere to drop-off gates.',
      tags: ['Campus Operations', 'Sector-9', 'Sector-10A']
    },
    {
      id: 'anc-03',
      title: 'Science Lab Safety Protocol & Microscope Drill',
      category: 'CLASS',
      target: 'Grade 7-A Cohort',
      author: 'Dr. Rajesh Verma (Senior Science Faculty)',
      date: '2026-11-14',
      priority: 'NORMAL',
      isPinned: false,
      content: 'All students are instructed to bring their science observation logbooks for the Stomatal Regulation lab session. Lab coats must be worn inside the STEM laboratory.',
      tags: ['Science', 'Lab Protocol']
    },
    {
      id: 'anc-04',
      title: 'Annual Parent-Teacher Consultation Meeting (PTM-2)',
      category: 'SCHOOL',
      target: 'Parents of Middle Wing (Grades 6–8)',
      author: 'Academic Administration',
      date: '2026-11-10',
      priority: 'HIGH',
      isPinned: false,
      content: 'PTM-2 is scheduled for Saturday, 28th November 2026. Individual consultation slots for reviewing AdaptIQ diagnostic telemetry and BKT mastery curves will be shared via Parent Portal.',
      tags: ['PTM', 'Parent Connect', 'Mastery']
    }
  ];

  const filteredAnnouncements = announcements.filter(a => {
    if (filterType === 'ALL') return true;
    return a.category === filterType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Communication Centre
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Greenwood Public School &bull; Official Circulars
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-400" />
            School Circulars & Announcements
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Official institutional notices, academic notifications, class circulars, and teacher-parent communications.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'SCHOOL', 'CLASS', 'ACADEMIC'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === type 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
            >
              {type === 'ALL' ? 'All Notices' : `${type.charAt(0) + type.slice(1).toLowerCase()} Circulars`}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {filteredAnnouncements.map((anc) => (
          <Card 
            key={anc.id} 
            className={`p-6 bg-white dark:bg-slate-900 border transition-all ${
              anc.isPinned 
                ? 'border-indigo-300 dark:border-indigo-800 shadow-sm' 
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 flex-wrap">
                {anc.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                <Badge variant={anc.category === 'SCHOOL' ? 'primary' : anc.category === 'ACADEMIC' ? 'accent' : 'subtle'} className="text-[10px]">
                  {anc.category}
                </Badge>
                {anc.priority === 'HIGH' && (
                  <Badge variant="danger" className="text-[10px]">High Priority</Badge>
                )}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Target: <strong>{anc.target}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{anc.date}</span>
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {anc.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {anc.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Issued by: <strong className="text-slate-700 dark:text-slate-200">{anc.author}</strong>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {anc.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default AnnouncementHub;
