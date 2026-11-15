import React, { useState } from 'react';
import {
  BarChart3,
  UploadCloud,
  FileSpreadsheet,
  X,
  Sparkles,
  PieChart as PieIcon,
  TrendingUp,
  Table,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Database
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import ScoreCard from '../components/ScoreCard';
import { dataAPI } from '../services/api';
import { formatFileSize } from '../utils/formatters';

const CHART_COLORS = ['#3867F5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

// Sample default CSV dataset for testing immediately
const SAMPLE_CSV = `Product,Category,Sales,Quantity,Region
MacBook Pro,Electronics,2499,12,North
iPad Air,Electronics,799,25,East
Standing Desk,Furniture,550,18,West
Ergonomic Chair,Furniture,350,30,South
Mechanical Keyboard,Accessories,150,65,North
Noise Cancelling Headset,Accessories,299,40,West
UltraWide Monitor,Electronics,899,15,East
USB-C Dock,Accessories,180,50,South
LED Desk Lamp,Furniture,85,45,North
Wireless Mouse,Accessories,75,80,East`;

export default function DataAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewColumns, setPreviewColumns] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (selected) => {
    setFile(selected);
    setResult(null);

    // Quick client-side preview for CSV
    if (selected.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(Boolean);
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim());
          setPreviewColumns(headers);
          const rows = lines.slice(1, 6).map(l => {
            const vals = l.split(',');
            const rowObj = {};
            headers.forEach((h, idx) => {
              rowObj[h] = vals[idx]?.trim() || '';
            });
            return rowObj;
          });
          setPreviewRows(rows);
        }
      };
      reader.readAsText(selected);
    } else {
      setPreviewColumns(['File selected']);
      setPreviewRows([{ 'File': selected.name, 'Size': formatFileSize(selected.size) }]);
    }
    toast.success(`Loaded dataset: ${selected.name}`);
  };

  const handleLoadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const sampleFile = new File([blob], 'sales_hardware_sample.csv', { type: 'text/csv' });
    processSelectedFile(sampleFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewRows([]);
    setPreviewColumns([]);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a dataset first.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await dataAPI.analyzeData(formData);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.previewRows && res.data.previewRows.length > 0) {
          setPreviewRows(res.data.previewRows);
          setPreviewColumns(Object.keys(res.data.previewRows[0] || {}));
        }
        toast.success('Dataset statistics & charts generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Data analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
            Module 05
          </span>
          <span className="text-xs text-[#7C879B] dark:text-slate-400">• Descriptive Statistics & Visual Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
          Data Analyzer
        </h1>
        <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
          Upload CSV, Excel XLSX, or JSON datasets to compute means, distributions, duplicate rates, and auto-generated charts.
        </p>
      </div>

      {/* Two-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: DATA INPUT & PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          <ResultCard
            title="Dataset Input"
            icon={FileSpreadsheet}
            action={
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-[#3867F5] dark:text-blue-400 hover:underline"
              >
                Load Sample CSV
              </button>
            }
          >
            <div className="space-y-4">
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[#E8ECF4] dark:border-slate-700 hover:border-[#3867F5]/50 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-8 text-center cursor-pointer transition-all"
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="data-file-input"
                  />
                  <label htmlFor="data-file-input" className="cursor-pointer block">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#17243D] dark:text-white mb-1">
                      Upload CSV, Excel, or JSON
                    </h4>
                    <p className="text-xs text-[#7C879B] dark:text-slate-400 mb-3">
                      Structured tabular data up to 5MB
                    </p>
                    <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold text-[#17243D] dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                      Browse Files
                    </span>
                  </label>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-[#E8ECF4] dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#17243D] dark:text-white truncate max-w-[180px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-[#7C879B]">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemove}
                    className="p-1 rounded-lg text-[#7C879B] hover:text-rose-600"
                    title="Remove dataset"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* First 5 Rows Preview Table */}
              {previewRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 block">
                    Dataset Preview (First {previewRows.length} Rows)
                  </span>
                  <div className="overflow-x-auto rounded-xl border border-[#E8ECF4] dark:border-slate-800">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[#E8ECF4] dark:border-slate-800">
                        <tr>
                          {previewColumns.map((col) => (
                            <th key={col} className="p-2 font-semibold text-[#7C879B] dark:text-slate-400 whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8ECF4]/60 dark:divide-slate-800">
                        {previewRows.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            {previewColumns.map((col) => (
                              <td key={col} className="p-2 text-[#17243D] dark:text-slate-300 whitespace-nowrap">
                                {String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Aggregating Statistical Metrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Data</span>
                  </>
                )}
              </button>
            </div>
          </ResultCard>
        </div>

        {/* RIGHT PANEL: VISUALIZATIONS & METRICS */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#17243D] dark:text-white">
                No Dataset Computed Yet
              </h3>
              <p className="text-xs text-[#7C879B] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Upload a tabular data file or load the sample CSV to view distribution doughnut charts, sequential trend lines, and mathematical metrics.
              </p>
            </div>
          ) : (
            <>
              {/* Top 4 Statistic Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <ScoreCard
                  title="Total Records"
                  score={result.meta?.totalRecords || 0}
                  icon={Database}
                  description="Row count"
                />

                <ScoreCard
                  title="Numeric Features"
                  score={result.meta?.numericColumnsCount || 0}
                  icon={Sliders}
                  description="Quantitative columns"
                />

                <ScoreCard
                  title="Categorical"
                  score={result.meta?.categoricalColumnsCount || 0}
                  icon={PieIcon}
                  description="Group attributes"
                />

                <ScoreCard
                  title="Duplicates"
                  score={result.meta?.duplicateRows || 0}
                  icon={Table}
                  label={result.meta?.duplicateRows === 0 ? 'Zero' : 'Detected'}
                />
              </div>

              {/* Doughnut Chart & Top 5 Bar Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Distribution Doughnut Chart */}
                <ResultCard title="Category Distribution" icon={PieIcon}>
                  <div className="h-56 w-full flex items-center justify-center">
                    {result.charts?.categoryDistribution && result.charts.categoryDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={result.charts.categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {result.charts.categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: '1px solid #E8ECF4',
                              fontSize: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-[#7C879B]">No distribution series generated.</p>
                    )}
                  </div>
                </ResultCard>

                {/* Top 5 Values Bar Chart */}
                <ResultCard title="Top 5 Ranking Features" icon={BarChart3}>
                  <div className="h-56 w-full">
                    {result.charts?.top5BarData && result.charts.top5BarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.charts.top5BarData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF4" opacity={0.5} />
                          <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: '1px solid #E8ECF4',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="records" fill="#3867F5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-xs text-[#7C879B]">No ranking metrics found.</p>
                    )}
                  </div>
                </ResultCard>
              </div>

              {/* Trend Analysis Line Chart */}
              {result.charts?.trendData && result.charts.trendData.length > 0 && (
                <ResultCard
                  title={`Sequential Value Trend (${result.charts?.metricNames?.trendCol || 'Metric'})`}
                  icon={TrendingUp}
                >
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.charts.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8ECF4" opacity={0.5} />
                        <XAxis dataKey="index" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #E8ECF4',
                            fontSize: '12px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10B981"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#10B981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ResultCard>
              )}

              {/* Statistical Summary Table */}
              {result.columnStats && (
                <ResultCard title="Feature Statistical Table (Mean, Median, Min, Max)" icon={Table}>
                  <div className="overflow-x-auto rounded-xl border border-[#E8ECF4] dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-[#E8ECF4] dark:border-slate-800 text-[10px] uppercase font-bold text-[#7C879B]">
                        <tr>
                          <th className="p-2.5">Feature</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Mean</th>
                          <th className="p-2.5">Median</th>
                          <th className="p-2.5">Min / Max</th>
                          <th className="p-2.5">Nulls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8ECF4]/60 dark:divide-slate-800">
                        {Object.entries(result.columnStats).slice(0, 8).map(([col, stats]) => (
                          <tr key={col} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-2.5 font-bold text-[#17243D] dark:text-white">
                              {col}
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {stats.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-mono text-[#17243D] dark:text-slate-300">
                              {stats.mean !== undefined ? stats.mean : '-'}
                            </td>
                            <td className="p-2.5 font-mono text-[#17243D] dark:text-slate-300">
                              {stats.median !== undefined ? stats.median : '-'}
                            </td>
                            <td className="p-2.5 font-mono text-[#17243D] dark:text-slate-300">
                              {stats.min !== undefined ? `${stats.min} .. ${stats.max}` : `${stats.unique} unique`}
                            </td>
                            <td className="p-2.5 text-[#7C879B]">
                              {stats.missing}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResultCard>
              )}

              {/* Automated Strategic Data Insights */}
              {result.insights && (
                <ResultCard title="Automated Strategic Observations" icon={Sparkles}>
                  <div className="space-y-3 text-xs">
                    <p className="font-medium bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 text-[#17243D] dark:text-slate-200 leading-relaxed">
                      {result.insights.executiveSummary}
                    </p>

                    <div className="space-y-1.5 pt-1">
                      {result.insights.keyObservations?.map((obs, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[#7C879B] dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{obs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ResultCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

