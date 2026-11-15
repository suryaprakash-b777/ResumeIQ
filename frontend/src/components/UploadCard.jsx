import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';

export default function UploadCard({
  accept = '.pdf,.docx',
  maxSizeMB = 5,
  title = 'Upload Resume',
  subtitle = 'Drag and drop your file here, or browse',
  supportedFormatsText = 'PDF, DOCX (Max 5MB)',
  file,
  onFileSelect,
  onFileRemove,
  disabled = false
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f) => {
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }
    onFileSelect(f);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#3867F5] bg-blue-50/60 dark:bg-blue-950/20'
              : 'border-[#E8ECF4] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-[#3867F5]/50'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-[#17243D] dark:text-white mb-1">
            {title}
          </h4>
          <p className="text-sm text-[#7C879B] dark:text-slate-400 mb-3">
            {subtitle}
          </p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-[#7C879B] dark:text-slate-300 border border-[#E8ECF4] dark:border-slate-700">
            {supportedFormatsText}
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-[#E8ECF4] dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#3867F5] dark:text-blue-400 flex items-center justify-center shrink-0">
              <File className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#17243D] dark:text-white truncate">
                  {file.name}
                </p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs text-[#7C879B] dark:text-slate-400">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFileRemove}
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#7C879B] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Remove file"
            aria-label="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

