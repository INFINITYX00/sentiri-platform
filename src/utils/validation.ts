// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

// Sanitize string inputs
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// Validate email format
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const sanitizedEmail = sanitizeString(email);
  
  if (!sanitizedEmail) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedEmail
  };
}

// Validate password strength
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate company name
export function validateCompanyName(name: string): ValidationResult {
  const errors: string[] = [];
  const sanitizedName = sanitizeString(name);
  
  if (!sanitizedName) {
    errors.push('Company name is required');
  } else if (sanitizedName.length < 2) {
    errors.push('Company name must be at least 2 characters long');
  } else if (sanitizedName.length > 100) {
    errors.push('Company name must be less than 100 characters');
  } else if (!/^[a-zA-Z0-9\s\-&.,'()]+$/.test(sanitizedName)) {
    errors.push('Company name contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedName
  };
}

// Validate material data
export function validateMaterialData(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};
  
  // Validate name
  if (!data.name) {
    errors.push('Material name is required');
  } else {
    const nameValidation = validateCompanyName(data.name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitizedData.name = nameValidation.sanitizedValue;
    }
  }
  
  // Validate type
  const validTypes = ['wood', 'reclaimed_wood', 'metal', 'plastic', 'fabric', 'glass', 'ceramic', 'composite', 'other'];
  if (!data.type || !validTypes.includes(data.type)) {
    errors.push('Valid material type is required');
  } else {
    sanitizedData.type = data.type;
  }
  
  // Validate quantity
  if (typeof data.quantity !== 'number' || data.quantity < 0) {
    errors.push('Quantity must be a positive number');
  } else {
    sanitizedData.quantity = data.quantity;
  }
  
  // Validate unit
  const validUnits = ['mm³', 'cm³', 'm³', 'kg', 'g', 'pieces', 'sheets', 'rolls'];
  if (!data.unit || !validUnits.includes(data.unit)) {
    errors.push('Valid unit is required');
  } else {
    sanitizedData.unit = data.unit;
  }
  
  // Sanitize optional fields
  if (data.description) {
    sanitizedData.description = sanitizeString(data.description);
  }
  
  if (data.origin) {
    sanitizedData.origin = sanitizeString(data.origin);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedData
  };
}

// Validate project data
export function validateProjectData(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};
  
  // Validate name
  if (!data.name) {
    errors.push('Project name is required');
  } else {
    const nameValidation = validateCompanyName(data.name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitizedData.name = nameValidation.sanitizedValue;
    }
  }
  
  // Validate status
  const validStatuses = ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push('Valid project status is required');
  } else {
    sanitizedData.status = data.status;
  }
  
  // Validate progress
  if (typeof data.progress !== 'number' || data.progress < 0 || data.progress > 100) {
    errors.push('Progress must be a number between 0 and 100');
  } else {
    sanitizedData.progress = data.progress;
  }
  
  // Sanitize optional fields
  if (data.description) {
    sanitizedData.description = sanitizeString(data.description);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedData
  };
}

// Validate numeric input
export function validateNumericInput(value: any, min?: number, max?: number): ValidationResult {
  const errors: string[] = [];
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    errors.push('Value must be a valid number');
  } else {
    if (min !== undefined && numValue < min) {
      errors.push(`Value must be at least ${min}`);
    }
    if (max !== undefined && numValue > max) {
      errors.push(`Value must be no more than ${max}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: isNaN(numValue) ? undefined : numValue
  };
}

// Validate UUID format
export function validateUUID(uuid: string): ValidationResult {
  const errors: string[] = [];
  const sanitizedUUID = sanitizeString(uuid);
  
  if (!sanitizedUUID) {
    errors.push('UUID is required');
  } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sanitizedUUID)) {
    errors.push('Invalid UUID format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: sanitizedUUID
  };
}

// Rate limiting helper
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    return true;
  };
}

// CSRF token validation
export function validateCSRFToken(token: string, expectedToken: string): ValidationResult {
  const errors: string[] = [];
  
  if (!token) {
    errors.push('CSRF token is required');
  } else if (token !== expectedToken) {
    errors.push('Invalid CSRF token');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
} 