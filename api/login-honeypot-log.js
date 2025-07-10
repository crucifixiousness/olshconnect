export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logEntry, timestamp, activityType, ...details } = req.body;
    
    // Get client IP address
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress ||   
                    req.socket.remoteAddress ||
                    'Unknown';
    
    // Add IP address to log entry if not present
    let finalLogEntry = logEntry;
    if (!logEntry.includes('Visitor IP Address:')) {
      finalLogEntry = logEntry.replace('Visitor IP Address: Unknown', `Visitor IP Address: ${clientIP}`);
    }
    
    // For Vercel deployment - log in exact format requested
    console.log(`\n=== LOGIN HONEYPOT LOG ENTRY ===\nVisitor IP Address: ${clientIP}\n\nTimestamp: ${timestamp}\n\nRequested URL or Endpoint: ${req.headers['referer'] || '/login'}\n\nHTTP Method: ${req.method}\n\nUser-Agent: ${req.headers['user-agent'] || 'Unknown'}\n\nReferrer: ${req.headers['referer'] || '(none)'}\n\nRequest Body / POST Data: ${JSON.stringify(details) || 'N/A'}\n\nLogin Attempted (Username / Password): ${details.username || 'N/A'}:${details.password || 'N/A'}\n\nCommand Attempted (SSH / Telnet Honeypot): ${details.commandAttempt || 'N/A'}\n\nExploit Payload or Input: ${details.exploitPayload || details.value || 'N/A'}\n\nUploaded or Downloaded File Info: Filename: ${details.fileName || 'N/A'}, Size: ${details.fileSize || 'N/A'} bytes, Type: ${details.fileType || 'N/A'}\n\nGeoIP Location (Resolved from IP): ${details.geoLocation || 'Unknown'}\n\nPort Accessed: ${details.port || '443'}\n\nProtocol Used: ${details.protocol || 'HTTPS'}\n\nSession Duration: Connected for ${details.sessionDuration || 'Unknown'} seconds\n\nNumber of Commands Issued: Commands: ${details.commandCount || '1'}\n\nDetected Vulnerability Attempt: ${details.vulnerabilityType || activityType}\n\nBot Score / Risk Score: Bot Score: ${details.botScore || '85%'}, Risk: ${details.riskLevel || 'High'}\n\nHoneypot Path Accessed: ${details.honeypotPath || '/fake_login_form'}\n\nHeaders: Content-Type: ${req.headers['content-type'] || 'application/json'}, User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'Unknown'}...\n\nActivity Type: ${activityType}\nAction: ${details.action || 'N/A'}\nAdditional Data: ${JSON.stringify(details, null, 2)}\n\n=== END LOG ENTRY ===\n`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Login honeypot log entry logged successfully (Vercel environment)',
      timestamp,
      activityType,
      clientIP,
      environment: 'vercel'
    });
    
  } catch (error) {
    console.error('❌ Login honeypot logging error:', error);
    res.status(500).json({ 
      error: 'Failed to log login honeypot activity',
      details: error.message 
    });
  }
} 