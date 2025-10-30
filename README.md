# 🐛 BugReportEase

**Smart Bug Report Generator for QA Testers**

A modern, responsive web application that helps QA testers create professional bug reports and export them as PDF or DOCX files with ease.

![BugReportEase](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)

---

## ✨ Features

### Core Functionality
- 📝 **Comprehensive Bug Report Form** - Well-organized sections for all bug details
- 📄 **PDF Export** - Generate professional PDF reports with PDFKit
- � **Password Protection** - Secure your PDFs with password encryption (NEW!)
- �📘 **DOCX Export** - Create Word documents for easy sharing
- 🖼️ **File Uploads** - Attach screenshots, screen recordings, and log files
- 👁️ **Live Preview** - See formatted report before exporting
- 💾 **Auto-Save Draft** - Never lose your work with automatic localStorage saving
- 📚 **Recent Reports** - Quick access to your last 5 bug reports

### Bonus Features
- 🌙 **Dark Mode** - Eye-friendly theme toggle
- 🔄 **Auto-Fill** - Automatically detects device name and browser information
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, minimalist design with Tailwind CSS
- ⚡ **Fast & Lightweight** - No heavy frameworks, pure JavaScript

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Navigate to the project directory:**
   ```powershell
   cd C:\BugReportEase
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start the server:**
   ```powershell
   npm start
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
BugReportEase/
├── backend/
│   ├── server.js          # Express server with PDF/DOCX generation
│   └── uploads/           # Temporary file storage (auto-created)
├── frontend/
│   ├── index.html         # Main HTML interface
│   └── app.js             # Frontend JavaScript logic
├── package.json           # Node.js dependencies
└── README.md              # Documentation
```

---

## 🎯 How to Use

### 1. Fill Out the Form

#### **Device Information**
- Device Name (auto-detected)
- Browser/App (auto-detected)

#### **Bug Details**
- Application causing the problem
- When it occurred (date/time picker)
- Location (URL or screen name)

#### **Problem Description**
- Detailed description of the issue
- Steps to reproduce (numbered list)
- How to restore/workaround (optional)

#### **Attachments**
- Upload screenshots/screen recordings
- Upload log files
- Check "Log not available" if applicable

#### **Security & Protection (Optional)**
- Set a password to protect your PDF
- Leave empty for unprotected PDFs
- See [PASSWORD_PROTECTION_GUIDE.md](PASSWORD_PROTECTION_GUIDE.md) for details

### 2. Preview Your Report

Click **"Preview Report"** to see a formatted version before exporting.

### 3. Generate Export

- Click **"Generate PDF"** to download as PDF
- Click **"Generate DOCX"** to download as Word document

### 4. Manage Reports

- Your last 5 reports are saved automatically
- Click **"Load"** to restore a previous report
- Click **"Delete"** to remove from history

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Multer** - File upload handling
- **PDFKit** - PDF generation
- **docx** - DOCX generation
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - Functionality
- **Font Awesome** - Icons

---

## ⚙️ API Endpoints

### Generate PDF
```
POST /api/generate-pdf
Content-Type: multipart/form-data

Fields:
- deviceName, browser, appName, timing, location
- problemDescription, stepsToReproduce, howToRestore
- screenshots[] (files)
- logFiles[] (files)
- logNotAvailable (boolean)

Response: PDF file download
```

### Generate DOCX
```
POST /api/generate-docx
Content-Type: multipart/form-data

Fields: Same as PDF endpoint
Response: DOCX file download
```

---

## 🎨 Features in Detail

### Auto-Fill Device Information
Automatically detects:
- Device type (iPhone, iPad, Android, Mac, Windows, Linux)
- Browser name and version (Chrome, Safari, Firefox, Edge)

### Dark Mode
- Toggle between light and dark themes
- Preference saved to localStorage
- Smooth transitions

### Local Storage Features
- **Auto-save draft** - Saves form data every second
- **Recent reports** - Stores last 5 bug reports
- **Dark mode preference** - Remembers your theme choice

### File Upload
- Multiple file upload support
- Preview file names and sizes
- Remove individual files before upload
- Support for images, videos, and log files

---

## 🔧 Development

### Run in Development Mode
```powershell
npm run dev
```
(Requires nodemon to be installed)

### Install Nodemon
```powershell
npm install -g nodemon
```

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "multer": "^1.4.5-lts.1",
  "pdfkit": "^0.13.0",
  "pdf-lib": "^1.17.1",
  "docx": "^8.5.0",
  "cors": "^2.8.5"
}
```

---

## 🐛 Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check if Node.js is installed: `node --version`
- Reinstall dependencies: `npm install`

### PDF/DOCX generation fails
- Ensure server is running on `http://localhost:3000`
- Check browser console for errors
- Verify all required fields are filled

### Files won't upload
- Check file size (max 50MB per file)
- Ensure correct file formats
- Check server logs for errors

---

## 🎯 Future Enhancements

- [ ] Email bug reports directly from the app
- [ ] Integration with JIRA, GitHub Issues, etc.
- [ ] Custom templates for different projects
- [ ] Bulk report generation
- [ ] Team collaboration features
- [ ] Analytics dashboard

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

**Created with ❤️ by Rajveer Singh**

---

## 🙏 Acknowledgments

- Tailwind CSS for the beautiful styling system
- Font Awesome for the icon library
- PDFKit and docx libraries for document generation

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check the browser console for errors
4. Verify server logs

---

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Happy Bug Hunting! 🐛🔍**
