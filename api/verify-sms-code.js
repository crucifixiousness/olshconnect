// This endpoint verifies the SMS OTP code using AWS SNS
// Uses in-memory store for OTPs (use Redis or database in production)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Clean phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    const formattedPhoneNumber = '+63' + cleanPhoneNumber.substring(1);

    // Get OTP store
    const otpStore = global.otpStore || new Map();
    
    // Check if OTP exists and is valid
    const storedOtpData = otpStore.get(formattedPhoneNumber);
    
    if (!storedOtpData) {
      return res.status(400).json({ 
        error: 'No verification code found. Please request a new code.' 
      });
    }

    // Check if OTP has expired (10 minutes)
    const now = new Date();
    const expirationTime = new Date(storedOtpData.timestamp + (10 * 60 * 1000));
    
    if (now > expirationTime) {
      otpStore.delete(formattedPhoneNumber);
      global.otpStore = otpStore;
      return res.status(400).json({ 
        error: 'Verification code has expired. Please request a new code.' 
      });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ 
        error: 'Invalid verification code. Please try again.' 
      });
    }

    // OTP is valid, remove it from store
    otpStore.delete(formattedPhoneNumber);
    global.otpStore = otpStore;

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully'
    });

  } catch (error) {
    console.error('Error verifying SMS code:', error);
    res.status(500).json({ 
      error: 'Failed to verify SMS code. Please try again.' 
    });
  }
};

// Helper function to clean up expired OTPs
const cleanupExpiredOtps = () => {
  const otpStore = global.otpStore || new Map();
  const now = Date.now();
  
  for (const [key, value] of otpStore.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      otpStore.delete(key);
    }
  }
  
  global.otpStore = otpStore;
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredOtps, 5 * 60 * 1000);
