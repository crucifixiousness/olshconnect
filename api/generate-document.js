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
        top: 30,
        bottom: 30,
        left: 50,
        right: 50
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
    doc.moveDown(0.5);
    doc.fontSize(10).text('Student\'s Copy only', { align: 'right' });
    
    doc.moveDown(1);
    
    // Department and title
    doc.fontSize(14).text('BSIT DEPARTMENT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text('CERTIFICATION OF GRADES', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).text('TO WHOM IT MAY CONCERN:', { align: 'left' });
    doc.moveDown(1);

    // Student information - adjusted text
    doc.fontSize(12).text(`This is to certify that ${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''} is presently enrolled as a Third Year College, a Bachelor of Science in Information Technology student and this is an UN OFFICIAL COPY of his/her grades during the 2nd Semester A.Y 2023-2024 as indicated with corresponding units earned:`, { align: 'justify' });
    doc.moveDown(1);

    // Table headers with adjusted spacing
    const startX = 50;
    const startY = doc.y;
    
    // Draw table borders
    doc.rect(startX, startY, 500, 20).stroke(); // Header row
    
    // Table headers
    doc.fontSize(10);
    doc.text('COURSE', startX + 5, startY + 5);
    doc.text('CODE', startX + 5, startY + 15);
    doc.text('DESCRIPTIVE TITLE', startX + 80, startY + 5);
    doc.text('RATINGS', startX + 300, startY + 5);
    doc.text('CREDITS', startX + 360, startY + 5);
    doc.text('REMARKS', startX + 420, startY + 5);

    // Semester header
    doc.fontSize(10).text('2nd Semester 2023-2024', startX + 5, startY - 15);

    // Sample course data (replace with actual data from database)
    const courseData = [
      { code: 'SIA102', title: 'Systems Integration and Architecture (Advanced SIA)', rating: '1.57', credits: '3', remarks: 'Passed' },
      { code: 'WS101', title: 'Web Systems and technologies 1', rating: '1.88', credits: '3', remarks: 'Passed' },
      { code: 'GE11', title: 'Gender and society', rating: '1.25', credits: '3', remarks: 'Passed' },
      { code: 'IAS101', title: 'Information Assurance and Security 1', rating: '1.75', credits: '3', remarks: 'Passed' },
      { code: 'IPT102', title: 'Integrative Programming and Technologies', rating: '1.50', credits: '3', remarks: 'Passed' },
      { code: 'NET102', title: 'Networking 2 (Advanced Networking)', rating: '1.00', credits: '3', remarks: 'Passed' },
      { code: 'PE301', title: 'Event-Driven Programming', rating: '1.15', credits: '3', remarks: 'Passed' },
      { code: 'SPT1', title: 'Specialization 1-Computer Programming 3', rating: '1.63', credits: '3', remarks: 'Passed' },
      { code: 'SPT2', title: 'Specialization 2-Fundamentals of Mobile Programming', rating: '1.38', credits: '3', remarks: 'Passed' }
    ];

    let currentY = startY + 20;
    courseData.forEach(course => {
      doc.rect(startX, currentY, 500, 20).stroke();
      doc.text(course.code, startX + 5, currentY + 5);
      doc.text(course.title, startX + 80, currentY + 5);
      doc.text(course.rating, startX + 300, currentY + 5); // Added rating display
      doc.text(course.credits, startX + 360, currentY + 5);
      doc.text(course.remarks, startX + 420, currentY + 5);
      currentY += 20;
    });

    // Add GPA row
    doc.rect(startX, currentY, 500, 20).stroke();
    doc.text('GPA', startX + 5, currentY + 5);

    // Footer text
    doc.moveDown(4);
    doc.fontSize(10).text('Issued for the above named student for his/her references purposes only this October 16, 2023 here at', { align: 'left' });
    doc.text('OLSHCO, Guimba, Nueva Ecija.', { align: 'left' });
    
    doc.moveDown(2);

    // Signatory
    doc.moveDown(1);
    doc.fontSize(12).text('Checked by:', { align: 'right' });
    doc.moveDown(2);
    doc.fontSize(12).text('Joel P. Altura', { align: 'right' });
    doc.fontSize(10).text('PROGRAM HEAD', { align: 'right' });

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
