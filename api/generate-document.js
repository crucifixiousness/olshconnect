const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const authenticateToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    throw new Error('No token provided');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = authenticateToken(req);
    const { req_id } = req.query;

    if (!req_id) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    // Fetch request and student details
    const result = await pool.query(`
      SELECT 
        dr.*,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        e.program_id,
        p.program_name
      FROM documentrequest dr
      JOIN students s ON dr.id = s.id
      JOIN enrollments e ON s.id = e.student_id
      JOIN program p ON e.program_id = p.program_id
      WHERE dr.req_id = $1 AND dr.req_status = 'Approved'
    `, [req_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found or not approved' });
    }

    const student = result.rows[0];

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 72,
        right: 72
      }
    });

    // Create buffer for PDF data
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    const pdfPromise = new Promise((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Add PDF content
    // Add logo and header
    doc.fontSize(16).text('Our Lady of the Sacred Heart College of Guimba, Inc.', { align: 'center' });
    doc.fontSize(12).text('Guimba, Nueva Ecija', { align: 'center' });
    doc.fontSize(10).text('Tel Nos.: (044)-611-0533 / Fax: (044)-611-0026', { align: 'center' });
    doc.moveDown(1);

    // BSIT Department and Certification header
    doc.fontSize(14).text('BSIT DEPARTMENT', { align: 'center' });
    doc.fontSize(14).text('CERTIFICATION OF GRADES', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).text('TO WHOM IT MAY CONCERN:', { align: 'left' });
    doc.moveDown(1);

    // Student information
    doc.fontSize(12).text(`This is to certify that ${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''} is presently enrolled as a First Year College, a Bachelor of Science in Information Technology student and this is an UNOFFICIAL COPY of his/her grades during the 1st Semester A.Y 2022-2023 as indicated with corresponding units earned:`, { align: 'justify' });
    doc.moveDown(1);

    // Create table headers
    const startX = 72;
    const startY = doc.y;
    doc.fontSize(10);
    
    // Draw table headers
    doc.text('COURSE CODE', startX, startY);
    doc.text('DESCRIPTIVE TITLE', startX + 80, startY);
    doc.text('RATING', startX + 300, startY);
    doc.text('CREDITS', startX + 360, startY);
    doc.text('REMARKS', startX + 420, startY);

    // Add horizontal line after headers
    doc.moveTo(startX, startY + 20).lineTo(startX + 480, startY + 20).stroke();

    // Fetch and display grades (you'll need to modify your SQL query to get this data)
    // This is a placeholder - you'll need to add actual grade data from your database
    const courseData = [
      { code: 'CC101', title: 'Introduction to Computing', rating: '1.64', credits: '3', remarks: 'Passed' },
      { code: 'CC102', title: 'Computer Programming 1', rating: '1.80', credits: '3', remarks: 'Passed' },
      // Add other courses as needed
    ];

    let currentY = startY + 30;
    courseData.forEach(course => {
      doc.text(course.code, startX, currentY);
      doc.text(course.title, startX + 80, currentY);
      doc.text(course.rating, startX + 300, currentY);
      doc.text(course.credits, startX + 360, currentY);
      doc.text(course.remarks, startX + 420, currentY);
      currentY += 20;
    });

    doc.moveDown(4);
    
    // Add issuance text
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    doc.fontSize(10).text(`Issued for the above named student for his/her references purposes only this ${currentDate} here at OLSHCO, Guimba, Nueva Ecija.`, { align: 'justify' });
    
    doc.moveDown(2);

    // Add signatories
    doc.fontSize(12).text('Prepared by:', startX + 50, doc.y);
    doc.moveDown(2);
    doc.fontSize(12).text('JENNIFER JOY K. DOMINGO', startX + 50, doc.y);
    doc.fontSize(10).text('Adviser BSIT', startX + 50, doc.y);

    doc.fontSize(12).text('Checked by:', startX + 300, doc.y - 45);
    doc.moveDown(2);
    doc.fontSize(12).text('JOEL P. ALTURA', startX + 300, doc.y - 45);
    doc.fontSize(10).text('Program Head', startX + 300, doc.y);

    // Add note at the bottom
    doc.moveDown(2);
    doc.fontSize(8).text('Note: This copy of grades is for student references only. Valid copy of grades will be issued by the registrar\'s Office upon request.', { align: 'left' });

    // Add footer and signature
    doc.moveDown(2);
    doc.fontSize(10).text('This certification is issued upon request of the above-named student for whatever legal purpose it may serve.', { align: 'justify' });
    doc.moveDown(3);
    doc.fontSize(12).text('JUAN DELA CRUZ', { align: 'center' });
    doc.fontSize(10).text('Registrar', { align: 'center' });

    // End the document and get the buffer
    doc.end();
    const pdfBuffer = await pdfPromise;

    // Send the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=document_${req_id}.pdf`);
    res.end(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating document: ' + error.message });
  }
};
