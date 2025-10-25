// Phone number validation using NumLookup API
// This validates phone numbers without sending SMS - just checks if the number is valid

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Clean phone number
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    // Basic validation - must be at least 7 digits (international minimum)
    if (cleanPhoneNumber.length < 7) {
      return res.status(400).json({ 
        error: 'Phone number must be at least 7 digits',
        isValid: false,
        phoneNumber: phoneNumber
      });
    }

    // Format for NumLookup API (international format)
    let formattedPhoneNumber;
    
    // If it starts with 09 (Philippines), convert to +63
    if (cleanPhoneNumber.startsWith('09') && cleanPhoneNumber.length === 11) {
      formattedPhoneNumber = '+63' + cleanPhoneNumber.substring(1);
    }
    // If it already has country code, use as is
    else if (cleanPhoneNumber.startsWith('63') && cleanPhoneNumber.length === 12) {
      formattedPhoneNumber = '+' + cleanPhoneNumber;
    }
    // For other formats, assume it needs a country code (you can modify this)
    else {
      // For testing purposes, let's assume it's a valid international number
      formattedPhoneNumber = '+' + cleanPhoneNumber;
    }

    // NumLookup API call
    const numlookupApiKey = process.env.NUMLOOKUP_API_KEY;
    
    if (!numlookupApiKey) {
      // If no API key, do basic validation only
      return res.status(200).json({
        success: true,
        isValid: true,
        phoneNumber: formattedPhoneNumber,
        country: 'Unknown',
        carrier: 'Unknown',
        lineType: 'mobile',
        message: 'Phone number format is valid (NumLookup not configured)'
      });
    }

    // Call NumLookup API
    const numlookupUrl = `https://api.numlookupapi.com/v1/validate/${formattedPhoneNumber}?apikey=${numlookupApiKey}`;
    
    const response = await fetch(numlookupUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`NumLookup API error: ${data.error || 'Unknown error'}`);
    }

    // Check if the number is valid
    if (!data.valid) {
      return res.status(400).json({
        success: false,
        isValid: false,
        phoneNumber: formattedPhoneNumber,
        error: 'Invalid phone number',
        details: data
      });
    }

    // Return validation results
    res.status(200).json({
      success: true,
      isValid: true,
      phoneNumber: data.number,
      country: data.country_name,
      countryCode: data.country_code,
      carrier: data.carrier,
      lineType: data.line_type,
      location: data.location,
      localFormat: data.local_format,
      internationalFormat: data.international_format,
      message: 'Phone number is valid'
    });

  } catch (error) {
    console.error('Error validating phone number:', error);
    
    // If NumLookup fails, fall back to basic validation
    const cleanPhoneNumber = req.body.phoneNumber?.replace(/\D/g, '');
    const isValid = cleanPhoneNumber && cleanPhoneNumber.length >= 7; // At least 7 digits for international
    
    res.status(200).json({
      success: true,
      isValid: isValid,
      phoneNumber: isValid ? '+' + cleanPhoneNumber : req.body.phoneNumber,
      country: 'Unknown',
      carrier: 'Unknown',
      lineType: 'mobile',
      message: isValid ? 'Phone number format is valid (validation service unavailable)' : 'Invalid phone number format',
      warning: 'NumLookup service unavailable, using basic validation'
    });
  }
};
