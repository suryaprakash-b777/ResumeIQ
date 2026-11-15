import React, { useState } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  X,
  Sparkles,
  Palette,
  Eye,
  Layers,
  Compass,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import ScoreCard from '../components/ScoreCard';
import { imageAPI } from '../services/api';
import { formatFileSize } from '../utils/formatters';

export default function ImageAnalyzer() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      setResult(null);
    }
  };

  const handleRemove = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload an image first.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await imageAPI.analyzeImage(formData);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Visual analysis completed!');
      }
    } catch (err) {
      toast.error(err.message || 'Image analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            Module 02
          </span>
          <span className="text-xs text-[#7C879B] dark:text-slate-400">• Multimodal Vision & Scene AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
          Image Analyzer
        </h1>
        <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
          Upload any photo, chart, or screenshot to identify subjects, detect objects, extract color palettes, and deduce AI insights.
        </p>
      </div>

      {/* Two-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: UPLOAD & PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          <ResultCard title="Image Upload" icon={ImageIcon}>
            <div className="space-y-4">
              {!previewUrl ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[#E8ECF4] dark:border-slate-700 hover:border-[#3867F5]/50 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-8 text-center cursor-pointer transition-all"
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload-input"
                  />
                  <label htmlFor="image-upload-input" className="cursor-pointer block">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#17243D] dark:text-white mb-1">
                      Choose an image or drag & drop
                    </h4>
                    <p className="text-xs text-[#7C879B] dark:text-slate-400 mb-3">
                      JPG, PNG, or WEBP up to 5MB
                    </p>
                    <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold text-[#17243D] dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
                      Browse Files
                    </span>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-[#E8ECF4] dark:border-slate-700 bg-slate-950 max-h-72 flex items-center justify-center group">
                    <img
                      src={previewUrl}
                      alt="Uploaded preview"
                      className="max-h-72 w-auto object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={handleRemove}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors shadow-md"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7C879B] dark:text-slate-400 px-1">
                    <span className="truncate max-w-[200px] font-medium text-[#17243D] dark:text-white">
                      {file?.name}
                    </span>
                    <span>{formatFileSize(file?.size)}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Visual Geometry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Image</span>
                  </>
                )}
              </button>
            </div>
          </ResultCard>
        </div>

        {/* RIGHT PANEL: ANALYSIS RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#17243D] dark:text-white">
                No Visual Data Analyzed Yet
              </h3>
              <p className="text-xs text-[#7C879B] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Upload a visual file to receive Gemini multimodal object classification, scene descriptions, and color grading.
              </p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreCard
                  title="Scene Type"
                  score={result.sceneType || 'Digital Image'}
                  icon={Compass}
                  description="Environmental classification"
                />

                <ScoreCard
                  title="Objects Detected"
                  score={result.detectedObjects?.length || 0}
                  icon={Eye}
                  description="Distinct entities localized"
                />

                <ScoreCard
                  title="Primary Subjects"
                  score={result.mainSubjects?.length || 0}
                  icon={Layers}
                  description="Focal points of the image"
                />
              </div>

              {/* Description Card */}
              <ResultCard title="Detailed Scene Understanding" icon={Eye}>
                <p className="text-sm text-[#17243D] dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-medium">
                  {result.description}
                </p>
              </ResultCard>

              {/* Objects & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard title="Detected Objects" icon={Layers}>
                  <div className="space-y-2">
                    {result.detectedObjects && result.detectedObjects.length > 0 ? (
                      result.detectedObjects.map((obj, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                        >
                          <span className="font-semibold text-[#17243D] dark:text-white">
                            {obj.name}
                          </span>
                          <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-md">
                            {obj.confidence}% match
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7C879B]">No discrete objects cataloged.</p>
                    )}
                  </div>
                </ResultCard>

                <ResultCard title="Colors & Visual Elements" icon={Palette}>
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 block">
                      Prominent Palette Tones
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(result.colors || []).map((c, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-[#17243D] dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    {result.mainSubjects && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 block mb-1">
                          Main Subjects
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.mainSubjects.map((s) => (
                            <span key={s} className="px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ResultCard>
              </div>

              {/* AI Insights & Deductions */}
              {result.insights && result.insights.length > 0 && (
                <ResultCard title="AI Strategic Insights" icon={Sparkles}>
                  <ul className="space-y-2 text-xs text-[#17243D] dark:text-slate-300">
                    {result.insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </ResultCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

