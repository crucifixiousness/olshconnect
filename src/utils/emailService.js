// EmailJS service for sending verification emails
// This is a client-side solution that doesn't require backend email setup

import emailjs from '@emailjs/browser';

// Initialize EmailJS with your service ID
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

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

export const sendSMS = async (phoneNumber, otp, studentName = 'Student') => {
  try {
    console.log(`📱 Sending SMS to ${phoneNumber} via AWS SNS`);
    
    // Call the AWS SNS SMS API endpoint
    const response = await fetch('/api/send-sms-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        studentName: studentName
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send SMS');
    }

    console.log('✅ SMS sent successfully via AWS SNS:', result);
    
    return {
      success: true,
      message: result.message,
      messageId: result.messageId,
      phoneNumber: result.phoneNumber,
      // In development, include the OTP for testing
      developmentOTP: result.developmentOTP
    };
  } catch (error) {
    console.error('❌ Error sending SMS via AWS SNS:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to send SMS verification code',
      error: error.message 
    };
  }
};

export const verifySMSCode = async (phoneNumber, otp) => {
  try {
    console.log(`🔍 Verifying SMS code for ${phoneNumber}`);
    
    // Call the SMS verification API endpoint
    const response = await fetch('/api/verify-sms-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        otp: otp
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to verify SMS code');
    }

    console.log('✅ SMS code verified successfully');
    
    return {
      success: true,
      message: result.message
    };
  } catch (error) {
    console.error('❌ Error verifying SMS code:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to verify SMS code',
      error: error.message 
    };
  }
};
