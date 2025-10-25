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
    
    console.log('🔍 Original phone number:', phoneNumber);
    console.log('🔍 Cleaned phone number:', cleanPhoneNumber);
    
    // If it starts with 09 (Philippines), convert to +63
    if (cleanPhoneNumber.startsWith('09') && cleanPhoneNumber.length === 11) {
      formattedPhoneNumber = '+63' + cleanPhoneNumber.substring(1);
      console.log('🇵🇭 Philippine number detected, formatted as:', formattedPhoneNumber);
    }
    // If it already has country code, use as is
    else if (cleanPhoneNumber.startsWith('63') && cleanPhoneNumber.length === 12) {
      formattedPhoneNumber = '+' + cleanPhoneNumber;
      console.log('🇵🇭 Philippine number with country code, formatted as:', formattedPhoneNumber);
    }
    // For US numbers (10 digits), add +1
    else if (cleanPhoneNumber.length === 10 && !cleanPhoneNumber.startsWith('0')) {
      formattedPhoneNumber = '+1' + cleanPhoneNumber;
      console.log('🇺🇸 US number detected, formatted as:', formattedPhoneNumber);
    }
    // For UK numbers (10 digits starting with 7), add +44
    else if (cleanPhoneNumber.length === 10 && cleanPhoneNumber.startsWith('7')) {
      formattedPhoneNumber = '+44' + cleanPhoneNumber;
      console.log('🇬🇧 UK number detected, formatted as:', formattedPhoneNumber);
    }
    // For other international numbers, try to detect country code
    else if (cleanPhoneNumber.length >= 7) {
      // For now, let's try common country codes
      if (cleanPhoneNumber.startsWith('1') && cleanPhoneNumber.length === 10) {
        formattedPhoneNumber = '+1' + cleanPhoneNumber;
        console.log('🇺🇸 US number (starts with 1), formatted as:', formattedPhoneNumber);
      } else if (cleanPhoneNumber.startsWith('44') && cleanPhoneNumber.length >= 10) {
        formattedPhoneNumber = '+' + cleanPhoneNumber;
        console.log('🇬🇧 UK number (starts with 44), formatted as:', formattedPhoneNumber);
      } else if (cleanPhoneNumber.startsWith('49') && cleanPhoneNumber.length >= 10) {
        formattedPhoneNumber = '+' + cleanPhoneNumber;
        console.log('🇩🇪 German number (starts with 49), formatted as:', formattedPhoneNumber);
      } else if (cleanPhoneNumber.startsWith('81') && cleanPhoneNumber.length >= 10) {
        formattedPhoneNumber = '+' + cleanPhoneNumber;
        console.log('🇯🇵 Japanese number (starts with 81), formatted as:', formattedPhoneNumber);
      } else {
        // Default: assume it's already formatted or add a generic prefix
        formattedPhoneNumber = '+' + cleanPhoneNumber;
        console.log('🌍 Generic international number, formatted as:', formattedPhoneNumber);
      }
    }
    else {
      formattedPhoneNumber = '+' + cleanPhoneNumber;
      console.log('❓ Unknown format, default formatting as:', formattedPhoneNumber);
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
    
    console.log('🌐 Calling NumLookup API with URL:', numlookupUrl);
    
    const response = await fetch(numlookupUrl);
    const data = await response.json();

    console.log('📡 NumLookup API response:', data);

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
