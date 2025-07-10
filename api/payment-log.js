import fs from 'fs';
import path from 'path';

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
    
    // Path to payment_log.txt in project root
    const logFilePath = path.join(process.cwd(), 'payment_log.txt');
    
    // Append log entry to file
    fs.appendFileSync(logFilePath, finalLogEntry, 'utf8');
    
    console.log(`📝 Payment honeypot log written to ${logFilePath}`);
    console.log(`🚨 Activity: ${activityType} from IP: ${clientIP}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Payment log entry written successfully',
      timestamp,
      activityType,
      clientIP
    });
    
  } catch (error) {
    console.error('❌ Payment logging error:', error);
    res.status(500).json({ 
      error: 'Failed to write payment log',
      details: error.message 
    });
  }
} 