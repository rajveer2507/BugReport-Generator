// ==========================================
// BugReportEase - Frontend JavaScript
// Created by Rajveer Singh
// ==========================================

// DOM Elements
const form = document.getElementById('bugReportForm');
const previewBtn = document.getElementById('previewBtn');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const generateDocxBtn = document.getElementById('generateDocxBtn');
const clearBtn = document.getElementById('clearBtn');
const previewModal = document.getElementById('previewModal');
const closePreview = document.getElementById('closePreview');
const darkModeToggle = document.getElementById('darkModeToggle');
const screenshotsInput = document.getElementById('screenshots');
const logFilesInput = document.getElementById('logFiles');
const screenshotList = document.getElementById('screenshotList');
const logFileList = document.getElementById('logFileList');
const recentReportsSection = document.getElementById('recentReports');
const recentReportsList = document.getElementById('recentReportsList');

// ==========================================
// Initialize App
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initializeDarkMode();
  autoFillDeviceInfo();
  loadRecentReports();
  setupEventListeners();
  setCurrentDateTime();
});

// ==========================================
// Dark Mode Functionality
// ==========================================

function initializeDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
  darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// ==========================================
// Auto-fill Device Information
// ==========================================

function autoFillDeviceInfo() {
  const userAgent = navigator.userAgent;
  const deviceInput = document.getElementById('deviceName');
  const browserInput = document.getElementById('browser');

  // Auto-detect device type
  let deviceName = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    if (/iPhone/i.test(userAgent)) deviceName = 'iPhone';
    else if (/iPad/i.test(userAgent)) deviceName = 'iPad';
    else if (/Android/i.test(userAgent)) deviceName = 'Android Device';
    else deviceName = 'Mobile Device';
  } else if (/Macintosh/i.test(userAgent)) {
    deviceName = 'Mac';
  } else if (/Windows/i.test(userAgent)) {
    deviceName = 'Windows PC';
  } else if (/Linux/i.test(userAgent)) {
    deviceName = 'Linux PC';
  }

  // Auto-detect browser
  let browserName = 'Unknown Browser';
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) {
    const version = userAgent.match(/Chrome\/(\d+)/);
    browserName = `Chrome ${version ? version[1] : ''}`;
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    const version = userAgent.match(/Version\/(\d+)/);
    browserName = `Safari ${version ? version[1] : ''}`;
  } else if (/Firefox/i.test(userAgent)) {
    const version = userAgent.match(/Firefox\/(\d+)/);
    browserName = `Firefox ${version ? version[1] : ''}`;
  } else if (/Edge|Edg/i.test(userAgent)) {
    const version = userAgent.match(/Edg\/(\d+)/);
    browserName = `Edge ${version ? version[1] : ''}`;
  }

  // Set placeholder or value
  deviceInput.placeholder = `e.g., ${deviceName}`;
  browserInput.placeholder = `e.g., ${browserName}`;
}

// ==========================================
// Set Current Date/Time
// ==========================================

function setCurrentDateTime() {
  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('timing').value = localDateTime;
}

// ==========================================
// File Upload Handlers
// ==========================================

screenshotsInput.addEventListener('change', (e) => {
  displayFileList(e.target.files, screenshotList, 'screenshot');
});

logFilesInput.addEventListener('change', (e) => {
  displayFileList(e.target.files, logFileList, 'logfile');
});

function displayFileList(files, listElement, type) {
  listElement.innerHTML = '';
  if (files.length === 0) return;

  const fileArray = Array.from(files);
  fileArray.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'flex items-center justify-between bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-lg mb-2';
    fileItem.innerHTML = `
      <div class="flex items-center gap-2">
        <i class="fas fa-${type === 'screenshot' ? 'image' : 'file-code'} text-blue-600"></i>
        <span class="text-sm text-gray-700 dark:text-gray-300">${file.name}</span>
        <span class="text-xs text-gray-500">(${formatFileSize(file.size)})</span>
      </div>
      <button type="button" onclick="removeFile('${type}', ${index})" class="text-red-500 hover:text-red-700">
        <i class="fas fa-times"></i>
      </button>
    `;
    listElement.appendChild(fileItem);
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function removeFile(type, index) {
  const input = type === 'screenshot' ? screenshotsInput : logFilesInput;
  const dt = new DataTransfer();
  const files = Array.from(input.files);
  
  files.forEach((file, i) => {
    if (i !== index) dt.items.add(file);
  });
  
  input.files = dt.files;
  
  if (type === 'screenshot') {
    displayFileList(input.files, screenshotList, 'screenshot');
  } else {
    displayFileList(input.files, logFileList, 'logfile');
  }
}

// ==========================================
// Form Data Collection
// ==========================================

function getFormData() {
  return {
    deviceName: document.getElementById('deviceName').value,
    browser: document.getElementById('browser').value,
    appName: document.getElementById('appName').value,
    timing: document.getElementById('timing').value,
    location: document.getElementById('location').value,
    problemDescription: document.getElementById('problemDescription').value,
    stepsToReproduce: document.getElementById('stepsToReproduce').value,
    howToRestore: document.getElementById('howToRestore').value,
    logNotAvailable: document.getElementById('logNotAvailable').checked
  };
}

// ==========================================
// Preview Functionality
// ==========================================

previewBtn.addEventListener('click', () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = getFormData();
  const previewContent = document.getElementById('previewContent');
  
  previewContent.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="text-center border-b pb-4">
        <h3 class="text-2xl font-bold text-blue-600 dark:text-blue-400">Bug Report</h3>
        <p class="text-gray-500 text-sm mt-1">Generated ${new Date().toLocaleString()}</p>
      </div>

      <!-- Device Information -->
      <div>
        <h4 class="text-xl font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
          <i class="fas fa-laptop"></i> Device Information
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
          <p><strong>Device:</strong> ${data.deviceName}</p>
          <p><strong>Browser/App:</strong> ${data.browser}</p>
        </div>
      </div>

      <!-- Bug Details -->
      <div>
        <h4 class="text-xl font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
          <i class="fas fa-info-circle"></i> Bug Details
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
          <p><strong>Application:</strong> ${data.appName}</p>
          <p><strong>Timing:</strong> ${new Date(data.timing).toLocaleString()}</p>
          <p><strong>Location:</strong> ${data.location}</p>
        </div>
      </div>

      <!-- Problem Description -->
      <div>
        <h4 class="text-xl font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
          <i class="fas fa-exclamation-triangle"></i> Problem Description
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="whitespace-pre-wrap">${data.problemDescription}</p>
        </div>
      </div>

      <!-- Steps to Reproduce -->
      <div>
        <h4 class="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
          <i class="fas fa-list-ol"></i> Steps to Reproduce
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="whitespace-pre-wrap">${data.stepsToReproduce}</p>
        </div>
      </div>

      <!-- How to Restore -->
      ${data.howToRestore ? `
      <div>
        <h4 class="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
          <i class="fas fa-undo"></i> How to Restore
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p class="whitespace-pre-wrap">${data.howToRestore}</p>
        </div>
      </div>
      ` : ''}

      <!-- Attachments -->
      <div>
        <h4 class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
          <i class="fas fa-paperclip"></i> Attachments
        </h4>
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
          ${screenshotsInput.files.length > 0 ? `
            <p><strong>Screenshots:</strong> ${screenshotsInput.files.length} file(s)</p>
            <ul class="list-disc list-inside ml-4 text-sm">
              ${Array.from(screenshotsInput.files).map(f => `<li>${f.name}</li>`).join('')}
            </ul>
          ` : '<p><em>No screenshots attached</em></p>'}
          
          ${logFilesInput.files.length > 0 ? `
            <p class="mt-2"><strong>Log Files:</strong> ${logFilesInput.files.length} file(s)</p>
            <ul class="list-disc list-inside ml-4 text-sm">
              ${Array.from(logFilesInput.files).map(f => `<li>${f.name}</li>`).join('')}
            </ul>
          ` : data.logNotAvailable ? '<p class="text-red-600 mt-2">⚠ Log files are not available</p>' : ''}
        </div>
      </div>
    </div>
  `;
  
  previewModal.classList.remove('hidden');
  previewModal.classList.add('flex');
});

closePreview.addEventListener('click', () => {
  previewModal.classList.add('hidden');
  previewModal.classList.remove('flex');
});

previewModal.addEventListener('click', (e) => {
  if (e.target === previewModal) {
    previewModal.classList.add('hidden');
    previewModal.classList.remove('flex');
  }
});

// ==========================================
// Generate PDF
// ==========================================

generatePdfBtn.addEventListener('click', async () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  generatePdfBtn.disabled = true;
  generatePdfBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

  try {
    const formData = new FormData(form);
    
    // Append files
    Array.from(screenshotsInput.files).forEach(file => {
      formData.append('screenshots', file);
    });
    Array.from(logFilesInput.files).forEach(file => {
      formData.append('logFiles', file);
    });

    const response = await fetch('http://localhost:3000/api/generate-pdf', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Failed to generate PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-report-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    saveToRecentReports();
    showNotification('PDF generated successfully!', 'success');

  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to generate PDF. Make sure the server is running.', 'error');
  } finally {
    generatePdfBtn.disabled = false;
    generatePdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Generate PDF';
  }
});

// ==========================================
// Generate DOCX
// ==========================================

generateDocxBtn.addEventListener('click', async () => {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  generateDocxBtn.disabled = true;
  generateDocxBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

  try {
    const formData = new FormData(form);
    
    // Append files
    Array.from(screenshotsInput.files).forEach(file => {
      formData.append('screenshots', file);
    });
    Array.from(logFilesInput.files).forEach(file => {
      formData.append('logFiles', file);
    });

    const response = await fetch('http://localhost:3000/api/generate-docx', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Failed to generate DOCX');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-report-${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    saveToRecentReports();
    showNotification('DOCX generated successfully!', 'success');

  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to generate DOCX. Make sure the server is running.', 'error');
  } finally {
    generateDocxBtn.disabled = false;
    generateDocxBtn.innerHTML = '<i class="fas fa-file-word"></i> Generate DOCX';
  }
});

// ==========================================
// Local Storage - Recent Reports
// ==========================================

function saveToRecentReports() {
  const data = getFormData();
  data.timestamp = new Date().toISOString();
  
  let reports = JSON.parse(localStorage.getItem('recentReports') || '[]');
  reports.unshift(data);
  
  // Keep only last 5 reports
  if (reports.length > 5) reports = reports.slice(0, 5);
  
  localStorage.setItem('recentReports', JSON.stringify(reports));
  loadRecentReports();
}

function loadRecentReports() {
  const reports = JSON.parse(localStorage.getItem('recentReports') || '[]');
  
  if (reports.length === 0) {
    recentReportsSection.style.display = 'none';
    return;
  }

  recentReportsSection.style.display = 'block';
  recentReportsList.innerHTML = '';

  reports.forEach((report, index) => {
    const reportCard = document.createElement('div');
    reportCard.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:shadow-md transition-all cursor-pointer';
    reportCard.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h4 class="font-bold text-gray-900 dark:text-gray-100">${report.appName}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${report.problemDescription.substring(0, 100)}...</p>
          <p class="text-xs text-gray-500 mt-2">
            <i class="fas fa-clock"></i> ${new Date(report.timestamp).toLocaleString()}
          </p>
        </div>
        <div class="flex gap-2">
          <button onclick="loadReport(${index})" class="text-blue-600 hover:text-blue-800 px-3 py-1">
            <i class="fas fa-redo"></i> Load
          </button>
          <button onclick="deleteReport(${index})" class="text-red-600 hover:text-red-800 px-3 py-1">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    recentReportsList.appendChild(reportCard);
  });
}

function loadReport(index) {
  const reports = JSON.parse(localStorage.getItem('recentReports') || '[]');
  const report = reports[index];
  
  if (!report) return;

  document.getElementById('deviceName').value = report.deviceName;
  document.getElementById('browser').value = report.browser;
  document.getElementById('appName').value = report.appName;
  document.getElementById('timing').value = report.timing;
  document.getElementById('location').value = report.location;
  document.getElementById('problemDescription').value = report.problemDescription;
  document.getElementById('stepsToReproduce').value = report.stepsToReproduce;
  document.getElementById('howToRestore').value = report.howToRestore;
  document.getElementById('logNotAvailable').checked = report.logNotAvailable;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  showNotification('Report loaded successfully!', 'success');
}

function deleteReport(index) {
  if (!confirm('Are you sure you want to delete this report?')) return;
  
  let reports = JSON.parse(localStorage.getItem('recentReports') || '[]');
  reports.splice(index, 1);
  localStorage.setItem('recentReports', JSON.stringify(reports));
  loadRecentReports();
  showNotification('Report deleted!', 'success');
}

// ==========================================
// Clear Form
// ==========================================

clearBtn.addEventListener('click', () => {
  if (!confirm('Are you sure you want to clear all fields?')) return;
  
  form.reset();
  screenshotList.innerHTML = '';
  logFileList.innerHTML = '';
  setCurrentDateTime();
  showNotification('Form cleared!', 'success');
});

// ==========================================
// Notification System
// ==========================================

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white font-semibold animate-slide-in`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ==========================================
// Event Listeners Setup
// ==========================================

function setupEventListeners() {
  // Prevent form submission
  form.addEventListener('submit', (e) => e.preventDefault());
  
  // Auto-save on input (debounced)
  let saveTimeout;
  form.addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem('bugReportDraft', JSON.stringify(getFormData()));
    }, 1000);
  });

  // Load draft on page load
  const draft = localStorage.getItem('bugReportDraft');
  if (draft) {
    try {
      const data = JSON.parse(draft);
      Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = data[key];
          } else {
            element.value = data[key];
          }
        }
      });
    } catch (e) {
      console.error('Failed to load draft:', e);
    }
  }
}

// ==========================================
// Service Worker for PWA (Optional Enhancement)
// ==========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment below to enable PWA functionality
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}
