// EmailJS service for sending verification emails
// This is a client-side solution that doesn't require backend email setup

import emailjs from '@emailjs/browser';

// Initialize EmailJS with your service ID
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const validatePhoneNumber = async (phoneNumber) => {
  try {
    console.log(`🔍 Validating phone number: ${phoneNumber}`);
    
    // Call the phone validation API endpoint
    const response = await fetch('/api/validate-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to validate phone number');
    }

    console.log('✅ Phone number validation result:', result);
    
    return {
      success: true,
      isValid: result.isValid,
      phoneNumber: result.phoneNumber,
      country: result.country,
      carrier: result.carrier,
      lineType: result.lineType,
      message: result.message
    };
  } catch (error) {
    console.error('❌ Error validating phone number:', error);
    return { 
      success: false, 
      isValid: false,
      message: error.message || 'Failed to validate phone number',
      error: error.message 
    };
  }
};
export const sendVerificationEmail = async (email, otp, studentName = 'Student') => {
  try {
    if (!process.env.REACT_APP_EMAILJS_SERVICE_ID || !process.env.REACT_APP_EMAILJS_TEMPLATE_ID || !process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS environment variables are not properly configured');
    }

    const templateParams = {
      // EmailJS template expects these exact parameter names
      email: email,  // This is what your template uses for "To Email"
      to_name: studentName,
      from_name: 'OLSHCO Registration',
      message: `Your OLSHCO verification code is: ${otp}. This code expires in 10 minutes.`,
      subject: 'OLSHCO Registration - Email Verification',
      verification_code: otp,
      school_name: 'Our Lady of the Sacred Heart College of Guimba, Inc.',
      school_short: 'OLSHCO',
      current_year: new Date().getFullYear(),
      expiry_time: '10 minutes'
    };

    console.log('📧 Attempting to send email with EmailJS...');
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_TEMPLATE_ID);
    console.log('Template Params:', templateParams);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send verification email', error: error.message };
  }
};

