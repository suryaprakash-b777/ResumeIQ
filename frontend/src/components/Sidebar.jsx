import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Code2,
  Briefcase,
  BarChart3,
  MessageSquareCode,
  History,
  Sparkles,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Text Analyzer', path: '/analyzer/text', icon: FileText },
  { name: 'Image Analyzer', path: '/analyzer/image', icon: ImageIcon },
  { name: 'Code Analyzer', path: '/analyzer/code', icon: Code2 },
  { name: 'Resume Analyzer', path: '/analyzer/resume', icon: Briefcase },
  { name: 'Data Analyzer', path: '/analyzer/data', icon: BarChart3 },
  { name: 'General AI Analyzer', path: '/analyzer/general', icon: MessageSquareCode },
  { name: 'History', path: '/history', icon: History }
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white dark:bg-[#1E293B] border-r border-[#E8ECF4] dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:top-16 lg:z-30`}
      >
        {/* Top Header on Mobile Only */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8ECF4] dark:border-slate-800 lg:hidden">
          <span className="font-bold text-base text-[#17243D] dark:text-white">
            Navigation Menu
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7C879B] hover:text-[#17243D] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="py-5 px-3 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 font-semibold shadow-xs'
                      : 'text-[#7C879B] dark:text-slate-400 hover:text-[#17243D] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-[#3867F5] dark:text-blue-400' : 'text-[#7C879B] dark:text-slate-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Prominent Badge */}
        <div className="p-4 border-t border-[#E8ECF4] dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100/60 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#3867F5] dark:text-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#17243D] dark:text-white">
                Smarter Analysis
              </span>
            </div>
            <p className="text-[11px] text-[#7C879B] dark:text-slate-400 leading-relaxed">
              Better Insights powered by multimodal Gemini intelligence.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

