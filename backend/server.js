const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Not specified';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Generate PDF endpoint
app.post('/api/generate-pdf', upload.fields([
  { name: 'screenshots', maxCount: 10 },
  { name: 'logFiles', maxCount: 5 }
]), (req, res) => {
  try {
    const data = req.body;
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bug-report.pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Helper function for section headers
    const addSection = (title, content) => {
      doc.fontSize(14).fillColor('#1f2937').font('Helvetica-Bold').text(title);
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor('#4b5563').font('Helvetica').text(content || 'Not provided');
      doc.moveDown(1);
    };

    // Title
    doc.fontSize(24).fillColor('#2563eb').text('BugReportEase', { align: 'center' });
    doc.fontSize(18).fillColor('#1e40af').text('Bug Report', { align: 'center' });
    doc.moveDown(1.5);

    // Device Information
    doc.fontSize(16).fillColor('#059669').text('Device Information', { underline: true });
    doc.moveDown(0.5);
    addSection('Device Name:', data.deviceName);
    addSection('Browser/App:', data.browser);

    // Bug Details
    doc.fontSize(16).fillColor('#059669').text('Bug Details', { underline: true });
    doc.moveDown(0.5);
    addSection('Application:', data.appName);
    addSection('Timing:', formatDate(data.timing));
    addSection('Location:', data.location);

    // Problem Description
    doc.fontSize(16).fillColor('#059669').text('Problem Description', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#4b5563').font('Helvetica').text(data.problemDescription || 'Not provided', {
      align: 'left',
      width: 500
    });
    doc.moveDown(1);

    // Steps to Reproduce
    doc.fontSize(16).fillColor('#059669').text('Steps to Reproduce', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#4b5563').text(data.stepsToReproduce || 'Not provided', {
      align: 'left',
      width: 500
    });
    doc.moveDown(1);

    // Restoration Steps
    doc.fontSize(16).fillColor('#059669').text('How to Restore', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#4b5563').text(data.howToRestore || 'Not provided', {
      align: 'left',
      width: 500
    });
    doc.moveDown(1);

    // Attachments
    doc.fontSize(16).fillColor('#059669').text('Attachments', { underline: true });
    doc.moveDown(0.5);
    
    let hasAttachments = false;
    
    if (req.files) {
      const screenshots = req.files.screenshots || [];
      const logFiles = req.files.logFiles || [];

      if (screenshots.length > 0) {
        hasAttachments = true;
        doc.fontSize(12).fillColor('#1f2937').font('Helvetica-Bold').text('Screenshots/Recordings:');
        doc.moveDown(0.3);
        screenshots.forEach((file, index) => {
          doc.fontSize(10).fillColor('#4b5563').font('Helvetica').text(`   ${index + 1}. ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);
          doc.moveDown(0.2);
        });
        doc.moveDown(0.5);
      }

      if (logFiles.length > 0) {
        hasAttachments = true;
        doc.fontSize(12).fillColor('#1f2937').font('Helvetica-Bold').text('Log Files:');
        doc.moveDown(0.3);
        logFiles.forEach((file, index) => {
          doc.fontSize(10).fillColor('#4b5563').font('Helvetica').text(`   ${index + 1}. ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);
          doc.moveDown(0.2);
        });
        doc.moveDown(0.5);
      }
    }

    if (data.logNotAvailable === 'true') {
      hasAttachments = true;
      doc.fontSize(11).fillColor('#dc2626').font('Helvetica-Bold').text('⚠ Log files are not available');
      doc.moveDown(0.5);
    }
    
    if (!hasAttachments) {
      doc.fontSize(10).fillColor('#6b7280').font('Helvetica-Oblique').text('No attachments provided');
    }
    
    doc.moveDown(1);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#9ca3af').text(
      `Generated on ${new Date().toLocaleString()} | Created by Rajveer Singh`,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();

    // Clean up uploaded files after PDF generation
    setTimeout(() => {
      if (req.files) {
        const allFiles = [...(req.files.screenshots || []), ...(req.files.logFiles || [])];
        allFiles.forEach(file => {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    }, 5000);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// Generate DOCX endpoint
app.post('/api/generate-docx', upload.fields([
  { name: 'screenshots', maxCount: 10 },
  { name: 'logFiles', maxCount: 5 }
]), async (req, res) => {
  try {
    const data = req.body;

    // Create document sections
    const sections = [];

    // Title
    sections.push(
      new Paragraph({
        text: 'BugReportEase',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: 'Bug Report',
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Helper function to add sections
    const addSection = (title, content) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: title, bold: true, size: 24 })
          ],
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: content || 'Not provided',
          spacing: { after: 200 }
        })
      );
    };

    // Device Information
    sections.push(
      new Paragraph({
        text: 'Device Information',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 }
      })
    );
    addSection('Device Name:', data.deviceName);
    addSection('Browser/App:', data.browser);

    // Bug Details
    sections.push(
      new Paragraph({
        text: 'Bug Details',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 }
      })
    );
    addSection('Application:', data.appName);
    addSection('Timing:', formatDate(data.timing));
    addSection('Location:', data.location);

    // Problem Description
    sections.push(
      new Paragraph({
        text: 'Problem Description',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 }
      })
    );
    sections.push(
      new Paragraph({
        text: data.problemDescription || 'Not provided',
        spacing: { after: 200 }
      })
    );

    // Steps to Reproduce
    sections.push(
      new Paragraph({
        text: 'Steps to Reproduce',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 }
      })
    );
    sections.push(
      new Paragraph({
        text: data.stepsToReproduce || 'Not provided',
        spacing: { after: 200 }
      })
    );

    // Restoration Steps
    sections.push(
      new Paragraph({
        text: 'How to Restore',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 }
      })
    );
    sections.push(
      new Paragraph({
        text: data.howToRestore || 'Not provided',
        spacing: { after: 200 }
      })
    );

    // Attachments
    sections.push(
      new Paragraph({
        text: 'Attachments',
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 200 }
      })
    );
    
    let hasAttachments = false;
    
    if (req.files) {
      const screenshots = req.files.screenshots || [];
      const logFiles = req.files.logFiles || [];

      if (screenshots.length > 0) {
        hasAttachments = true;
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: 'Screenshots/Recordings:', bold: true, size: 24 })],
            spacing: { after: 100 }
          })
        );
        screenshots.forEach((file, index) => {
          sections.push(
            new Paragraph({
              text: `   ${index + 1}. ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`,
              spacing: { after: 50 }
            })
          );
        });
        sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }

      if (logFiles.length > 0) {
        hasAttachments = true;
        sections.push(
          new Paragraph({
            children: [new TextRun({ text: 'Log Files:', bold: true, size: 24 })],
            spacing: { before: 100, after: 100 }
          })
        );
        logFiles.forEach((file, index) => {
          sections.push(
            new Paragraph({
              text: `   ${index + 1}. ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`,
              spacing: { after: 50 }
            })
          );
        });
        sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      }
    }

    if (data.logNotAvailable === 'true') {
      hasAttachments = true;
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: '⚠ Log files are not available', bold: true, color: 'DC2626' })],
          spacing: { before: 200, after: 200 }
        })
      );
    }
    
    if (!hasAttachments) {
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: 'No attachments provided', italics: true, color: '6B7280' })],
          spacing: { after: 200 }
        })
      );
    }

    // Footer
    sections.push(
      new Paragraph({
        text: `Generated on ${new Date().toLocaleString()} | Created by Rajveer Singh`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=bug-report.docx');
    res.send(buffer);

    // Clean up uploaded files
    setTimeout(() => {
      if (req.files) {
        const allFiles = [...(req.files.screenshots || []), ...(req.files.logFiles || [])];
        allFiles.forEach(file => {
          fs.unlink(file.path, err => {
            if (err) console.error('Error deleting file:', err);
          });
        });
      }
    }, 5000);

  } catch (error) {
    console.error('DOCX Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate DOCX', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BugReportEase server running on http://localhost:${PORT}`);
  console.log(`📝 Open your browser and navigate to the URL above`);
});
