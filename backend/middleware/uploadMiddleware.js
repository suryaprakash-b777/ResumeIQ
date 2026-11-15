/**
 * Secure Multer File Upload Middleware
 * Validates file MIME types, file extensions, and size limits.
 */
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage with sanitized unique timestamped filenames
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${sanitizedOriginal}`);
  }
});

// Memory storage for immediate buffer processing (images, memory analysis)
const memoryStorage = multer.memoryStorage();

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB default

// Resume filter: PDF & DOCX
function resumeFileFilter(req, file, cb) {
  const allowedExts = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF and DOCX documents are accepted for resume analysis.'), false);
  }
}

// Text filter: TXT & PDF
function textFileFilter(req, file, cb) {
  const allowedExts = ['.txt', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.includes('text') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only TXT and PDF documents are supported for text analysis.'), false);
  }
}

// Image filter: JPG, JPEG, PNG, WEBP
function imageFileFilter(req, file, cb) {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP images are supported.'), false);
  }
}

// Data filter: CSV, XLSX, XLS, JSON
function dataFileFilter(req, file, cb) {
  const allowedExts = ['.csv', '.xlsx', '.xls', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.includes('csv') || file.mimetype.includes('spreadsheet') || file.mimetype.includes('json')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only CSV, Excel (XLSX/XLS), and JSON datasets are accepted.'), false);
  }
}

// Code filter: any common code format
function codeFileFilter(req, file, cb) {
  const allowedExts = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.php', '.go', '.txt', '.json', '.html', '.css'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.includes('text')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Please upload a plain text source code file.'), false);
  }
}

const uploadResume = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: resumeFileFilter
});

const uploadTextDoc = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: textFileFilter
});

const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter
});

const uploadData = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: dataFileFilter
});

const uploadCode = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: codeFileFilter
});

module.exports = {
  uploadResume,
  uploadTextDoc,
  uploadImage,
  uploadData,
  uploadCode
};

