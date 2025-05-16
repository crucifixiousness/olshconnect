const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');

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

    // Fetch request and student details
    const result = await pool.query(`
      SELECT 
        dr.*,
        s.first_name,
        s.middle_name,
        s.last_name,
        s.suffix,
        s.program_id,
        p.program_name
      FROM documentrequest dr
      JOIN students s ON dr.id = s.id
      JOIN programs p ON s.program_id = p.program_id
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

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=document_${req_id}.pdf`);

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Add school logo
    // doc.image('path/to/logo.png', 250, 50, { width: 100 });

    // Add content based on document type
    doc.fontSize(18).text('OUR LADY OF SACRED HEART COLLEGE', { align: 'center' });
    doc.fontSize(12).text('Poblacion, San Jose, Occidental Mindoro', { align: 'center' });
    doc.moveDown(2);

    if (student.doc_type === 'Certificate of Grades') {
      doc.fontSize(16).text('CERTIFICATION OF GRADES', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(12).text(`This is to certify that ${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}`, { align: 'justify' });
      doc.text(`is a student of ${student.program_name} of this institution.`, { align: 'justify' });
      // Add more content specific to grades certificate
    } else if (student.doc_type === 'Good Moral Certificate') {
      doc.fontSize(16).text('CERTIFICATE OF GOOD MORAL CHARACTER', { align: 'center' });
      doc.moveDown(2);
      doc.fontSize(12).text(`This is to certify that ${student.first_name} ${student.middle_name || ''} ${student.last_name} ${student.suffix || ''}`, { align: 'justify' });
      doc.text(`is a student of ${student.program_name} of this institution and has shown good moral character during their stay.`, { align: 'justify' });
    }

    // Add footer
    doc.fontSize(10).text('This certification is issued upon request of the above-named student for whatever legal purpose it may serve.', { align: 'justify' });
    doc.moveDown(3);

    // Add signatory
    doc.fontSize(12).text('JUAN DELA CRUZ', { align: 'center' });
    doc.fontSize(10).text('Registrar', { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error generating document' });
  }
};