const AWS = require('aws-sdk');

// Configure AWS SNS
const sns = new AWS.SNS({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, studentName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone number format (Philippines format)
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    if (cleanPhoneNumber.length !== 11 || !cleanPhoneNumber.startsWith('09')) {
      return res.status(400).json({ 
        error: 'Invalid phone number format. Please use a valid Philippine mobile number (09xxxxxxxxx)' 
      });
    }

    // Format phone number for international use (+63)
    const formattedPhoneNumber = '+63' + cleanPhoneNumber.substring(1);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create SMS message
    const message = `🎓 OLSHCO Registration Verification

Hello ${studentName || 'Student'}!

Your verification code is: ${otp}

This code expires in 10 minutes.

If you didn't request this verification, please ignore this message.

Our Lady of the Sacred Heart College of Guimba, Inc.
📧 olshco.acesschools.ph
📞 0956-2774029`;

    // Send SMS using AWS SNS
    const params = {
      Message: message,
      PhoneNumber: formattedPhoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'OLSHCO'
        }
      }
    };

    const result = await sns.publish(params).promise();

    console.log('SMS sent successfully via AWS SNS:', result.MessageId);

    // Store OTP for verification (you can use Redis or database in production)
    const otpStore = global.otpStore || new Map();
    otpStore.set(formattedPhoneNumber, {
      otp: otp,
      timestamp: Date.now()
    });
    global.otpStore = otpStore;

    const response = {
      success: true,
      message: 'SMS verification code sent successfully',
      messageId: result.MessageId,
      phoneNumber: formattedPhoneNumber
    };

    // In development, include OTP for testing
    if (process.env.NODE_ENV === 'development') {
      response.developmentOTP = otp;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error sending SMS via AWS SNS:', error);
    
    // Handle specific AWS SNS errors
    if (error.code) {
      switch (error.code) {
        case 'InvalidParameter':
          return res.status(400).json({ 
            error: 'Invalid phone number format' 
          });
        case 'OptedOut':
          return res.status(400).json({ 
            error: 'This phone number has opted out of SMS messages' 
          });
        case 'Throttling':
          return res.status(429).json({ 
            error: 'Too many requests. Please try again later.' 
          });
        case 'AccessDenied':
          return res.status(403).json({ 
            error: 'Access denied. Please check your AWS credentials.' 
          });
        default:
          return res.status(500).json({ 
            error: 'Failed to send SMS verification code' 
          });
      }
    }

    res.status(500).json({ 
      error: 'Failed to send SMS verification code. Please try again.' 
    });
  }
};
