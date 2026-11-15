import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  Award,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Code,
  Target,
  RefreshCw,
  Mail,
  Phone,
  Linkedin,
  Github
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

import UploadCard from '../components/UploadCard';
import ScoreCard from '../components/ScoreCard';
import SkillTag from '../components/SkillTag';
import { CircularProgress, HorizontalProgressBar } from '../components/ProgressChart';
import LoadingSteps from '../components/LoadingSteps';
import ResultCard from '../components/ResultCard';
import { resumeAPI } from '../services/api';
import { getScoreBadge, formatDate } from '../utils/formatters';

const DEFAULT_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Mobile App Developer',
  'Java Developer',
  'Python Developer'
];

const RESUME_LOADING_STEPS = [
  'Extracting resume text from document',
  'Identifying skills, experience & contact details',
  'Calculating weighted ATS category score & keyword gaps',
  'Generating AI recommendations & career matching',
  'Synthesizing 8-week personalized learning roadmap'
];

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState(null);
  const [resumeRawText, setResumeRawText] = useState('');
  const [previewProfile, setPreviewProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Fetch role templates on mount
  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await resumeAPI.getRoles();
        if (res.success && res.data) {
          setRoles(res.data.map(r => r.title));
        }
      } catch {
        // Fallback to DEFAULT_ROLES
      }
    }
    loadRoles();
  }, []);

  // Handle file selection and preliminary upload/parse
  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await resumeAPI.upload(formData);
      if (res.success && res.data) {
        setUploadedResumeId(res.data.resumeId);
        setResumeRawText(res.data.rawText || '');
        setPreviewProfile(res.data.preview);
        toast.success('Resume parsed successfully! Ready for analysis.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload resume document.');
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setUploadedResumeId(null);
    setResumeRawText('');
    setPreviewProfile(null);
    setAnalysis(null);
  };

  // Run full analysis
  const handleAnalyze = async () => {
    if (!file && !uploadedResumeId && !resumeRawText) {
      toast.error('Please upload a resume file first.');
      return;
    }

    try {
      setLoading(true);

      let currentResumeId = uploadedResumeId;
      let currentRawText = resumeRawText;

      // If for any reason upload hadn't completed or was pending, upload now
      if (!currentResumeId && !currentRawText && file) {
        const formData = new FormData();
        formData.append('resume', file);
        const upRes = await resumeAPI.upload(formData);
        if (upRes.success && upRes.data) {
          currentResumeId = upRes.data.resumeId;
          currentRawText = upRes.data.rawText;
          setUploadedResumeId(currentResumeId);
          setResumeRawText(currentRawText);
          setPreviewProfile(upRes.data.preview);
        }
      }

      const res = await resumeAPI.analyze({
        resumeId: currentResumeId,
        directText: currentRawText,
        targetRole,
        jobDescription,
        fileName: file ? file.name : 'Resume.pdf'
      });

      if (res.success && res.data) {
        setAnalysis(res.data);
        if (res.data.parsedProfile) {
          setPreviewProfile(res.data.parsedProfile);
        }
        toast.success('Resume evaluation generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Analysis encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate and Download PDF Report using jsPDF
  const handleDownloadPdf = () => {
    if (!analysis) return;
    setIsDownloadingPdf(true);

    try {
      const doc = new jsPDF();
      const primaryColor = [56, 103, 245]; // #3867F5

      // Header Banner
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('ResumeIQ — Comprehensive Analysis Report', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Candidate: ${previewProfile?.name || 'Applicant'} | Target Role: ${targetRole} | Date: ${formatDate(new Date())}`, 14, 27);

      let currentY = 45;

      // Executive Summary
      doc.setTextColor(23, 36, 61);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary & Scores', 14, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`ATS Score: ${analysis.atsScore}/100 (${getScoreBadge(analysis.atsScore).label})`, 14, currentY);
      doc.text(`Job Match Score: ${analysis.jobMatchScore}/100`, 90, currentY);
      currentY += 10;

      // Score Breakdown Table
      const breakdown = analysis.scoreBreakdown || {};
      const breakdownRows = [
        ['Skills Relevance (30%)', `${breakdown.skillsRelevance || 0}/100`],
        ['Experience & Projects (20%)', `${breakdown.experienceProjects || 0}/100`],
        ['Education & Certifications (15%)', `${breakdown.educationCertifications || 0}/100`],
        ['Resume Structure (15%)', `${breakdown.resumeStructure || 0}/100`],
        ['Keyword Compatibility (20%)', `${breakdown.keywordCompatibility || 0}/100`]
      ];

      doc.autoTable({
        startY: currentY,
        head: [['ATS Evaluation Category', 'Score']],
        body: breakdownRows,
        theme: 'striped',
        headStyles: { fillColor: primaryColor }
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // Skills Matched & Missing
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Skill Alignment Analysis', 14, currentY);
      currentY += 8;

      const matchedStr = (analysis.matchedSkills || []).slice(0, 10).join(', ') || 'N/A';
      const missingStr = (analysis.missingSkills || []).slice(0, 10).join(', ') || 'None';

      doc.autoTable({
        startY: currentY,
        head: [['Category', 'Identified Skills']],
        body: [
          ['Matched Skills', matchedStr],
          ['Missing Target Skills', missingStr]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      currentY = doc.lastAutoTable.finalY + 12;

      // Check if page overflow
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // Strengths & Improvement Suggestions
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations & Roadmap', 14, currentY);
      currentY += 8;

      const recRows = (analysis.improvementSuggestions || []).map((sug, idx) => [
        `Suggestion ${idx + 1}`,
        sug
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['#', 'Actionable Improvement']],
        body: recRows,
        theme: 'striped',
        headStyles: { fillColor: primaryColor }
      });

      // Save PDF
      doc.save(`ResumeIQ-Report-${previewProfile?.name?.replace(/\s+/g, '_') || 'Candidate'}.pdf`);
      toast.success('Analysis report downloaded as PDF!');
    } catch (err) {
      toast.error('Failed to export PDF: ' + err.message);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const atsScore = analysis?.atsScore ?? (previewProfile ? 74 : 0);
  const jobMatchScore = analysis?.jobMatchScore ?? (previewProfile ? 68 : 0);
  const scoreBadge = getScoreBadge(atsScore);
  const breakdown = analysis?.scoreBreakdown || {
    skillsRelevance: 75,
    experienceProjects: 70,
    educationCertifications: 80,
    resumeStructure: 85,
    keywordCompatibility: 70
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8ECF4] dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-[#3867F5] dark:text-blue-400">
              Module 04
            </span>
            <span className="text-xs text-[#7C879B] dark:text-slate-400">• Intelligent Career Matching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
            Resume Analyzer & ATS Scorer
          </h1>
          <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
            Upload your resume, compare against target roles, and unlock personalized 8-week career roadmaps.
          </p>
        </div>

        {analysis && (
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E8ECF4] dark:border-slate-700 hover:border-[#3867F5] text-[#17243D] dark:text-white font-semibold text-xs shadow-sm hover:shadow transition-all"
          >
            <Download className="w-4 h-4 text-[#3867F5]" />
            <span>{isDownloadingPdf ? 'Exporting PDF...' : 'Download Report (PDF)'}</span>
          </button>
        )}
      </div>

      {/* Two-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ====================================================
            LEFT PANEL: UPLOAD & PREVIEW
        ==================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <ResultCard title="Resume Input" icon={Briefcase}>
            <div className="space-y-5">
              <UploadCard
                file={file}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                title="Drop your resume here"
                subtitle="Accepts PDF or Word DOCX files up to 5MB"
                supportedFormatsText="PDF, DOCX"
                disabled={loading}
              />

              {/* Target Role Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                  Select Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-sm focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Job Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7C879B] dark:text-slate-400 mb-1.5">
                  Paste Job Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste specific job requirements or responsibilities to perform precision keyword matching..."
                  disabled={loading}
                  className="w-full p-3 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17243D] dark:text-white text-xs focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20 transition-all resize-none placeholder:text-[#7C879B]/60"
                />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Candidate Profile...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyse Resume</span>
                  </>
                )}
              </button>
            </div>
          </ResultCard>

          {/* Candidate Extracted Preview Card */}
          {previewProfile && (
            <ResultCard title="Candidate Extracted Profile" icon={FileText} badge="Auto-Detected">
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-base text-[#17243D] dark:text-white">
                    {previewProfile.name || 'Candidate'}
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[#7C879B] dark:text-slate-400">
                    {previewProfile.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        {previewProfile.email}
                      </span>
                    )}
                    {previewProfile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {previewProfile.phone}
                      </span>
                    )}
                    {previewProfile.linkedin && (
                      <span className="flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5 text-sky-500" />
                        {previewProfile.linkedin}
                      </span>
                    )}
                    {previewProfile.github && (
                      <span className="flex items-center gap-1">
                        <Github className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                        {previewProfile.github}
                      </span>
                    )}
                  </div>
                </div>

                {previewProfile.summary && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-[#17243D] dark:text-slate-300 italic leading-relaxed">
                      "{previewProfile.summary}"
                    </p>
                  </div>
                )}

                {/* Extracted Education snippet */}
                {previewProfile.education && previewProfile.education.length > 0 && (
                  <div>
                    <span className="font-semibold text-[#17243D] dark:text-white uppercase tracking-wider text-[10px] block mb-1">
                      Education Background
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#7C879B] dark:text-slate-400">
                      {previewProfile.education.slice(0, 3).map((edu, i) => (
                        <li key={i}>{typeof edu === 'string' ? edu : edu.degree || edu.institution}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Experience snippet */}
                {previewProfile.experience && previewProfile.experience.length > 0 && (
                  <div>
                    <span className="font-semibold text-[#17243D] dark:text-white uppercase tracking-wider text-[10px] block mb-1">
                      Professional Experience
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[#7C879B] dark:text-slate-400">
                      {previewProfile.experience.slice(0, 3).map((exp, i) => (
                        <li key={i}>{typeof exp === 'string' ? exp : `${exp.role || 'Role'} at ${exp.company || 'Company'}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ResultCard>
          )}
        </div>

        {/* ====================================================
            RIGHT PANEL: SCORES, BREAKDOWN, ROADMAP
        ==================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <LoadingSteps
              title="Analyzing Resume & Matching Role"
              steps={RESUME_LOADING_STEPS}
            />
          ) : !analysis ? (
            /* Pre-analysis placeholder cards */
            <div className="p-10 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#17243D] dark:text-white">
                Awaiting Resume Submission
              </h3>
              <p className="text-sm text-[#7C879B] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Upload your resume on the left and click <strong>"Analyse Resume"</strong> to unlock real-time ATS scoring, skill-gap detection, role matching, and a personalized 8-week curriculum.
              </p>
            </div>
          ) : (
            /* Full Analysis Results */
            <>
              {/* Top 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreCard
                  title="Resume ATS Score"
                  score={atsScore}
                  suffix="%"
                  label={scoreBadge.label}
                  icon={Award}
                  description="5-Factor Weighted Score"
                />

                <ScoreCard
                  title="Skills Matched"
                  score={analysis.matchedSkills?.length || 0}
                  suffix={` / ${(analysis.matchedSkills?.length || 0) + (analysis.missingSkills?.length || 0)}`}
                  icon={CheckCircle2}
                  label={`${jobMatchScore}% Match`}
                  description={`Target: ${targetRole}`}
                />

                <ScoreCard
                  title="Role Compatibility"
                  score={`${jobMatchScore}%`}
                  icon={Target}
                  label={jobMatchScore >= 70 ? 'High' : 'Moderate'}
                  description="Keyword & skill alignment"
                />
              </div>

              {/* ATS Score & Category Breakdown Card */}
              <ResultCard title="ATS Compatibility Breakdown" icon={Layers}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex justify-center border-b md:border-b-0 md:border-r border-[#E8ECF4] dark:border-slate-800 pb-4 md:pb-0 md:pr-4">
                    <CircularProgress
                      value={atsScore}
                      color={scoreBadge.color}
                      subtitle={scoreBadge.label}
                      title="Overall Compatibility"
                    />
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <HorizontalProgressBar
                      label="Skills Relevance"
                      value={breakdown.skillsRelevance}
                      weight={30}
                      color="bg-blue-600"
                    />
                    <HorizontalProgressBar
                      label="Experience & Projects"
                      value={breakdown.experienceProjects}
                      weight={20}
                      color="bg-indigo-600"
                    />
                    <HorizontalProgressBar
                      label="Education & Certifications"
                      value={breakdown.educationCertifications}
                      weight={15}
                      color="bg-emerald-600"
                    />
                    <HorizontalProgressBar
                      label="Resume Structure"
                      value={breakdown.resumeStructure}
                      weight={15}
                      color="bg-sky-600"
                    />
                    <HorizontalProgressBar
                      label="Keyword Compatibility"
                      value={breakdown.keywordCompatibility}
                      weight={20}
                      color="bg-amber-600"
                    />
                  </div>
                </div>
              </ResultCard>

              {/* Skill Gap Analysis: Matched vs Missing */}
              <ResultCard title="Skill-Gap Matrix" icon={Target}>
                <div className="space-y-4">
                  {/* Matched Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Matched Target Skills ({analysis.matchedSkills?.length || 0})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchedSkills && analysis.matchedSkills.length > 0 ? (
                        analysis.matchedSkills.map((s) => (
                          <SkillTag key={s} name={s} variant="matched" />
                        ))
                      ) : (
                        <p className="text-xs text-[#7C879B] italic">No direct target skills matched.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="pt-3 border-t border-[#E8ECF4] dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Missing Skills to Acquire ({analysis.missingSkills?.length || 0})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                        analysis.missingSkills.map((s) => (
                          <SkillTag key={s} name={s} variant="missing" />
                        ))
                      ) : (
                        <p className="text-xs text-emerald-600 font-medium">All target skills present!</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
                    <div className="pt-3 border-t border-[#E8ECF4] dark:border-slate-800">
                      <span className="text-xs font-bold text-[#7C879B] dark:text-slate-400 block mb-2">
                        Missing Industry Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.missingKeywords.map((k) => (
                          <SkillTag key={k} name={k} variant="neutral" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Role Fit Explanation */}
                  {analysis.roleFitExplanation && (
                    <div className="mt-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-xs text-[#17243D] dark:text-slate-200 leading-relaxed">
                      <strong>AI Career Assessment:</strong> {analysis.roleFitExplanation}
                    </div>
                  )}
                </div>
              </ResultCard>

              {/* Gemini Recommendations & Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResultCard title="Candidate Strengths" icon={CheckCircle2}>
                  <ul className="space-y-2 text-xs text-[#17243D] dark:text-slate-300">
                    {(analysis.strengths || []).map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </ResultCard>

                <ResultCard title="Improvement Suggestions" icon={Sparkles}>
                  <ul className="space-y-2 text-xs text-[#17243D] dark:text-slate-300">
                    {(analysis.improvementSuggestions || []).map((sug, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3867F5] mt-1.5 shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </ResultCard>
              </div>

              {/* 8-Week Personalized Learning Roadmap */}
              {analysis.roadmap?.weeklyRoadmap && (
                <ResultCard
                  title="8-Week Personalized Career Roadmap"
                  subtitle="Bridge your missing competencies with targeted weekly mini-projects and guides"
                  icon={Calendar}
                >
                  <div className="space-y-4">
                    {analysis.roadmap.weeklyRoadmap.map((wk) => (
                      <div
                        key={wk.week}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-[#E8ECF4] dark:border-slate-800 transition-all hover:border-[#3867F5]/40"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#3867F5] text-white">
                            Week {wk.week}
                          </span>
                          <span className="text-xs font-semibold text-[#17243D] dark:text-white">
                            {wk.focus}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-[#7C879B] dark:text-slate-400 uppercase tracking-wider block mb-1">
                              Skills To Master
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {wk.skillsToLearn?.map((s) => (
                                <span key={s} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-medium border border-slate-200 dark:border-slate-700">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-[#7C879B] dark:text-slate-400 uppercase tracking-wider block mb-1">
                              Weekly Mini Project
                            </span>
                            <p className="text-[#17243D] dark:text-slate-300 font-medium">
                              {wk.miniProject}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* Interview Preparation Topics & Portfolio Project Ideas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.roadmap?.interviewTopics && (
                  <ResultCard title="Interview Prep Focus" icon={BookOpen}>
                    <ul className="space-y-2 text-xs text-[#17243D] dark:text-slate-300">
                      {analysis.roadmap.interviewTopics.map((topic, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {analysis.roadmap?.portfolioProjectIdeas && (
                  <ResultCard title="Recommended Portfolio Projects" icon={Code}>
                    <div className="space-y-3 text-xs">
                      {analysis.roadmap.portfolioProjectIdeas.map((proj, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-[#17243D] dark:text-white">
                            {proj.title}
                          </p>
                          <p className="text-[#7C879B] dark:text-slate-400 text-[11px] mt-0.5">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

