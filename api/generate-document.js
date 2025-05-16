const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const NodeCache = require('node-cache');

// Initialize cache with 30 minutes TTL
const pdfCache = new NodeCache({ stdTTL: 1800 });

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

    // Check cache first
    const cachedPDF = pdfCache.get(req_id);
    if (cachedPDF) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', cachedPDF.length);
      res.setHeader('Content-Disposition', `attachment; filename=document_${req_id}.pdf`);
      res.setHeader('X-Cache', 'HIT');
      return res.end(cachedPDF);
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
    doc.fontSize(18).text('OUR LADY OF SACRED HEART COLLEGE', { align: 'center' });
    doc.fontSize(12).text('Poblacion, San Jose, Occidental Mindoro', { align: 'center' });
    doc.moveDown(2);

    // Add document content based on type
    if (student.doc_type === 'Certificate of Grades') {
      doc.fontSize(16).text('CERTIFICATION OF GRADES', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(12).text(`This is to certify that ${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}`, { align: 'justify' });
      doc.text(`is a student of ${student.program_name} of this institution.`, { align: 'justify' });
    } else if (student.doc_type === 'Good Moral Certificate') {
      doc.fontSize(16).text('CERTIFICATE OF GOOD MORAL CHARACTER', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(12).text(`This is to certify that ${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}`, { align: 'justify' });
      doc.text(`is a student of ${student.program_name} of this institution and has shown good moral character during their stay.`, { align: 'justify' });
    }

    // Add footer and signature
    doc.moveDown(2);
    doc.fontSize(10).text('This certification is issued upon request of the above-named student for whatever legal purpose it may serve.', { align: 'justify' });
    doc.moveDown(3);
    doc.fontSize(12).text('JUAN DELA CRUZ', { align: 'center' });
    doc.fontSize(10).text('Registrar', { align: 'center' });

    // End the document and get the buffer
    doc.end();
    const pdfBuffer = await pdfPromise;

    // Cache the PDF buffer before sending
    pdfCache.set(req_id, pdfBuffer);
    
    // Send the PDF with cache miss header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename=document_${req_id}.pdf`);
    res.setHeader('X-Cache', 'MISS');
    res.end(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating document: ' + error.message });
  }
};
