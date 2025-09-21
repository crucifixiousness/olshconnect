// EmailJS service for sending verification emails
// This is a client-side solution that doesn't require backend email setup

import emailjs from '@emailjs/browser';

// Initialize EmailJS with your service ID
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Initialize EmailJS
console.log('🔧 Initializing EmailJS with key:', EMAILJS_PUBLIC_KEY);
emailjs.init(EMAILJS_PUBLIC_KEY);
console.log('✅ EmailJS initialized');

export const sendVerificationEmail = async (email, otp) => {
  try {
    // Debug: Check if environment variables are loaded
    console.log('=== EMAILJS DEBUG INFO ===');
    console.log('EmailJS Service ID:', process.env.REACT_APP_EMAILJS_SERVICE_ID);
    console.log('EmailJS Template ID:', process.env.REACT_APP_EMAILJS_TEMPLATE_ID);
    console.log('EmailJS Public Key:', process.env.REACT_APP_EMAILJS_PUBLIC_KEY);
    console.log('Email to send to:', email);
    console.log('OTP to send:', otp);
    console.log('========================');
    
    if (!process.env.REACT_APP_EMAILJS_SERVICE_ID || !process.env.REACT_APP_EMAILJS_TEMPLATE_ID || !process.env.REACT_APP_EMAILJS_PUBLIC_KEY) {
      console.error('❌ Environment variables missing!');
      throw new Error('EmailJS environment variables are not properly configured');
    }
    
    console.log('✅ Environment variables loaded successfully');

    const templateParams = {
      to_email: email,
      to_name: 'Student',
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

    console.log('✅ Email sent successfully:', response);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send verification email', error: error.message };
  }
};

export const sendSMS = async (phoneNumber, otp) => {
  // For SMS, you would typically use a service like Twilio
  // This is a placeholder implementation
  try {
    // In a real implementation, you would call your SMS service here
    console.log(`SMS would be sent to ${phoneNumber} with code: ${otp}`);
    
    // Beautiful SMS message template
    const smsMessage = `🎓 OLSHCO Registration Verification

Your verification code is: ${otp}

This code expires in 10 minutes.

If you didn't request this verification, please ignore this message.

Our Lady of the Sacred Heart College of Guimba, Inc.
📧 olshco.acesschools.ph
📞 0956-2774029`;

    console.log('SMS Message:', smsMessage);
    
    // For development, you can simulate SMS sending
    return { 
      success: true, 
      message: 'SMS sent successfully (simulated)',
      smsMessage: smsMessage,
      // In development, include the OTP for testing
      developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, message: 'Failed to send SMS', error: error.message };
  }
};
