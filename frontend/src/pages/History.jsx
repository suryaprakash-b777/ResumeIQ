import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  Eye,
  X,
  FileText,
  Calendar,
  Briefcase,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import ResultCard from '../components/ResultCard';
import EmptyState from '../components/EmptyState';
import { historyAPI } from '../services/api';
import { formatDate, getScoreColor } from '../utils/formatters';

export default function History() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDetailsLoading, setItemDetailsLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [selectedType]);

  // If URL has ?view=id, open it automatically
  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId && items.length > 0) {
      viewDetails(viewId);
    }
  }, [searchParams, items]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await historyAPI.getAll({
        type: selectedType === 'all' ? undefined : selectedType
      });
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      toast.error('Failed to load history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      setItemDetailsLoading(true);
      const res = await historyAPI.getById(id);
      if (res.success && res.data) {
        setSelectedItem(res.data);
      }
    } catch (err) {
      toast.error('Could not load record details: ' + err.message);
    } finally {
      setItemDetailsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      await historyAPI.deleteItem(itemToDelete.id);
      setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
      if (selectedItem?.id === itemToDelete.id) {
        setSelectedItem(null);
      }
      toast.success('Record deleted from history');
    } catch (err) {
      toast.error(err.message || 'Failed to delete record');
    } finally {
      setItemToDelete(null);
    }
  };

  // Filter and sort items
  const filteredItems = items
    .filter(i => {
      const matchSearch =
        (i.inputFileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.targetRole || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.analyzerType || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'score-desc') return (b.atsScore || 0) - (a.atsScore || 0);
      return 0;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400">
            Audit Vault
          </span>
          <span className="text-xs text-[#7C879B] dark:text-slate-400">• Persistent Records</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
          Analysis History & Reports
        </h1>
        <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
          Review, filter, inspect, and export past analysis sessions across all modules.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7C879B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by file name or role..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-[#17243D] dark:text-white focus:outline-none focus:border-[#3867F5]"
          />
        </div>

        {/* Filter by Module */}
        <div className="flex items-center gap-2.5">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-[#17243D] dark:text-white focus:outline-none focus:border-[#3867F5]"
          >
            <option value="all">All Modules</option>
            <option value="resume">Resume Analyzer</option>
            <option value="text">Text Analyzer</option>
            <option value="image">Image Analyzer</option>
            <option value="code">Code Analyzer</option>
            <option value="data">Data Analyzer</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-[#17243D] dark:text-white focus:outline-none focus:border-[#3867F5]"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest ATS Score</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card p-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-[#3867F5] animate-spin" />
            <p className="text-xs text-[#7C879B]">Loading historical archives...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No Records Found"
            description="No past analyses match your search criteria. Try modifying your filter or run a new evaluation."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8ECF4] dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400">
                  <th className="pb-3 pl-2">Date</th>
                  <th className="pb-3">Input File / Label</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">Target Context</th>
                  <th className="pb-3 text-center">Score</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF4]/60 dark:divide-slate-800/60">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2 text-xs text-[#7C879B] dark:text-slate-400 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="py-3.5 font-medium text-[#17243D] dark:text-white max-w-[200px] truncate">
                      {item.inputFileName || 'Session Item'}
                    </td>

                    <td className="py-3.5 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400 capitalize">
                        {item.analyzerType}
                      </span>
                    </td>

                    <td className="py-3.5 text-xs text-[#7C879B] dark:text-slate-400 whitespace-nowrap">
                      {item.targetRole || 'General Assessment'}
                    </td>

                    <td className="py-3.5 text-center">
                      {typeof item.atsScore === 'number' ? (
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(item.atsScore)}`}>
                          {item.atsScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewDetails(item.id)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="View analysis details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Inspector Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E8ECF4] dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#E8ECF4] dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#17243D] dark:text-white">
                  {selectedItem.inputFileName || 'Analysis Record'}
                </h3>
                <p className="text-xs text-[#7C879B] dark:text-slate-400">
                  {selectedItem.analyzerType.toUpperCase()} • Created on {formatDate(selectedItem.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg text-[#7C879B] hover:text-[#17243D]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#17243D] dark:text-slate-200">
              {selectedItem.atsScore !== null && (
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#17243D] dark:text-white block">
                      ATS Score: {selectedItem.atsScore}%
                    </span>
                    <span className="text-[#7C879B] text-[11px]">
                      Job Match Score: {selectedItem.jobMatchScore || 0}%
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#3867F5] text-white">
                    {selectedItem.targetRole || 'Developer'}
                  </span>
                </div>
              )}

              {selectedItem.geminiSummary && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#7C879B] text-[10px] block mb-1">
                    Summary Assessment
                  </span>
                  <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 leading-relaxed">
                    {selectedItem.geminiSummary}
                  </p>
                </div>
              )}

              {/* Matched & Missing Skills for Resumes */}
              {selectedItem.matchedSkills && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#7C879B] text-[10px] block mb-1">
                    Matched Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedItem.matchedSkills || []).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.missingSkills && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#7C879B] text-[10px] block mb-1">
                    Missing Target Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedItem.missingSkills || []).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic Raw Result Viewer */}
              {selectedItem.result && (
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#7C879B] text-[10px] block mb-1">
                    Analysis Payload
                  </span>
                  <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60">
                    {JSON.stringify(selectedItem.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E8ECF4] dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17243D] dark:text-white">
                Delete Analysis Record?
              </h3>
              <p className="text-xs text-[#7C879B] dark:text-slate-400 mt-1">
                Are you sure you want to permanently delete "{itemToDelete.inputFileName || 'this record'}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-[#17243D] dark:text-white hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

