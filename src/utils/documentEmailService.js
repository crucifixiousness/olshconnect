import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_document_template_id';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key';

console.log('🔧 Initializing EmailJS for document notifications with key:', EMAILJS_PUBLIC_KEY);
emailjs.init(EMAILJS_PUBLIC_KEY);
console.log('✅ EmailJS initialized for document notifications');

export const sendDocumentApprovalEmail = async (studentEmail, studentName, documentType, requestDate) => {
  try {
    console.log('=== DOCUMENT EMAIL DEBUG INFO ===');
    console.log('EmailJS Service ID:', process.env.REACT_APP_EMAILJS_SERVICE_ID);
    console.log('EmailJS Document Template ID:', process.env.REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID);
    console.log('EmailJS Public Key:', process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    console.log('Student Email:', studentEmail);
    console.log('Student Name:', studentName);
    console.log('Document Type:', documentType);
    console.log('Request Date:', requestDate);
    console.log('===============================');
    
    if (!process.env.REACT_APP_EMAILJS_SERVICE_ID || !process.env.REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID || !process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      console.error('❌ EmailJS environment variables missing!');
      throw new Error('EmailJS environment variables are not properly configured');
    }
    
    console.log('✅ Environment variables loaded successfully');

    // Minimal variables for testing
    const templateParams = {
      email: studentEmail,
      to_name: studentName,
      document_type: documentType
    };

    console.log('📧 Attempting to send document approval email with EmailJS...');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Template Params:', templateParams);
    console.log('🔍 Using template ID:', process.env.REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID);
    console.log('🔍 Environment check:');
    console.log('- REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID);
    console.log('- REACT_APP_EMAILJS_TEMPLATE_ID:', process.env.REACT_APP_EMAILJS_TEMPLATE_ID);
    console.log('- Final template ID being used:', EMAILJS_TEMPLATE_ID);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Document approval email sent successfully:', response);
    return { success: true, message: 'Document approval email sent successfully' };
  } catch (error) {
    console.error('Error sending document approval email:', error);
    return { success: false, message: 'Failed to send document approval email', error: error.message };
  }
};

export const sendDocumentRejectionEmail = async (studentEmail, studentName, documentType, requestDate, reason = '') => {
  try {
    console.log('=== DOCUMENT REJECTION EMAIL DEBUG INFO ===');
    console.log('Student Email:', studentEmail);
    console.log('Student Name:', studentName);
    console.log('Document Type:', documentType);
    console.log('Reason:', reason);
    console.log('==========================================');
    
    if (!process.env.REACT_APP_EMAILJS_SERVICE_ID || !process.env.REACT_APP_EMAILJS_DOCUMENT_TEMPLATE_ID || !process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      console.error('❌ EmailJS environment variables missing!');
      throw new Error('EmailJS environment variables are not properly configured');
    }

    // Minimal variables for testing
    const templateParams = {
      email: studentEmail,
      to_name: studentName,
      document_type: documentType
    };

    console.log('📧 Attempting to send document rejection email with EmailJS...');
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Document rejection email sent successfully:', response);
    return { success: true, message: 'Document rejection email sent successfully' };
  } catch (error) {
    console.error('Error sending document rejection email:', error);
    return { success: false, message: 'Failed to send document rejection email', error: error.message };
  }
};
