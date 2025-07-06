// Security utilities for headers, CSP, and other security measures

// Content Security Policy
export const CSP_POLICY = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for React
    "'unsafe-eval'",   // Required for some libraries
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'https://api.anthropic.com',
    'wss://*.supabase.co'
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': buildCSPString(CSP_POLICY)
};

// Build CSP string from policy object
function buildCSPString(policy: Record<string, string[]>): string {
  return Object.entries(policy)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

// Session security utilities
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_SESSIONS_PER_USER = 3;
  
  // Check if session is still valid
  static isSessionValid(lastActivity: number): boolean {
    return Date.now() - lastActivity < this.SESSION_TIMEOUT;
  }
  
  // Generate secure session ID
  static generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Validate session ID format
  static isValidSessionId(sessionId: string): boolean {
    return /^[a-f0-9]{64}$/.test(sessionId);
  }
}

// Password security utilities
export class PasswordSecurity {
  // Check password strength
  static checkStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    else feedback.push('Password should be at least 8 characters long');
    
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');
    
    if (/\d/.test(password)) score += 1;
    else feedback.push('Include numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');
    
    // Common patterns to avoid
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Avoid repeated characters');
    }
    
    if (/123|abc|qwe/i.test(password)) {
      score -= 1;
      feedback.push('Avoid common patterns');
    }
    
    return {
      score: Math.max(0, score),
      feedback,
      isStrong: score >= 4
    };
  }
  
  // Generate secure password
  static generatePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// API security utilities
export class APISecurity {
  // Rate limiting map
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  
  // Check rate limit for API calls
  static checkRateLimit(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.rateLimitMap.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      this.rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    return true;
  }
  
  // Clear rate limit for a user
  static clearRateLimit(identifier: string): void {
    this.rateLimitMap.delete(identifier);
  }
  
  // Sanitize API response data
  static sanitizeResponse(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[<>]/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResponse(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeResponse(value);
      }
      return sanitized;
    }
    
    return data;
  }
}

// File upload security
export class FileSecurity {
  // Allowed file types
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  // Maximum file size (5MB)
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;
  
  // Validate file upload
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }
    
    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size exceeds 5MB limit' };
    }
    
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'File type not allowed' };
    }
    
    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'csv', 'xlsx', 'xls'];
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return { isValid: false, error: 'File extension not allowed' };
    }
    
    return { isValid: true };
  }
  
  // Generate secure filename
  static generateSecureFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop()?.toLowerCase() || '';
    return `${timestamp}-${randomId}.${extension}`;
  }
}

// Encryption utilities (for sensitive data)
export class Encryption {
  // Simple XOR encryption (for basic obfuscation - not for highly sensitive data)
  static simpleEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }
  
  static simpleDecrypt(encryptedText: string, key: string): string {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }
}

// Security monitoring
export class SecurityMonitor {
  private static suspiciousActivities: Array<{
    type: string;
    userId?: string;
    timestamp: number;
    details: any;
  }> = [];
  
  // Log suspicious activity
  static logSuspiciousActivity(type: string, userId?: string, details?: any): void {
    this.suspiciousActivities.push({
      type,
      userId,
      timestamp: Date.now(),
      details
    });
    
    // Keep only last 1000 activities
    if (this.suspiciousActivities.length > 1000) {
      this.suspiciousActivities = this.suspiciousActivities.slice(-1000);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Suspicious activity detected:', { type, userId, details });
    }
  }
  
  // Get recent suspicious activities
  static getRecentActivities(minutes: number = 60): typeof this.suspiciousActivities {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.suspiciousActivities.filter(activity => activity.timestamp > cutoff);
  }
  
  // Check for potential security threats
  static checkForThreats(): { hasThreats: boolean; threats: string[] } {
    const recentActivities = this.getRecentActivities(5); // Last 5 minutes
    const threats: string[] = [];
    
    // Check for too many failed login attempts
    const failedLogins = recentActivities.filter(a => a.type === 'failed_login');
    if (failedLogins.length > 10) {
      threats.push('Multiple failed login attempts detected');
    }
    
    // Check for unusual API usage
    const apiCalls = recentActivities.filter(a => a.type === 'api_call');
    if (apiCalls.length > 100) {
      threats.push('Unusual API usage detected');
    }
    
    return {
      hasThreats: threats.length > 0,
      threats
    };
  }
} 