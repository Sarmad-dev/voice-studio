/**
 * Base class for all custom API errors
 */
export class APIError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends APIError {
  fieldErrors?: Record<string, string[]>;
  
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Error for authentication failures
 */
export class AuthError extends APIError {
  constructor(message: string) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Error for authorization failures (not permitted)
 */
export class ForbiddenError extends APIError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error for resource not found
 */
export class NotFoundError extends APIError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Error for rate limiting
 */
export class RateLimitError extends APIError {
  constructor(message: string) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

// Server errors (internal issues)
export class ServerError extends APIError {
  constructor(message: string, code = 'SERVER_ERROR') {
    super(message, 500, code);
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

// Database errors
export class DatabaseError extends APIError {
  constructor(message: string, code = 'DATABASE_ERROR') {
    super(message, 500, code);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

// Unauthorized access errors
export class UnauthorizedError extends AuthError {
  constructor(message = 'You are not authorized to access this resource') {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

// Function to handle and format error responses
export function handleApiError(error: unknown): { 
  statusCode: number; 
  message: string;
  code: string;
  errors?: Record<string, string[]>;
} {
  if (error instanceof APIError) {
    const response: any = {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };

    if (error instanceof ValidationError) {
      response.errors = error.fieldErrors;
    }

    return response;
  }

  // For unexpected errors
  console.error('Unexpected error:', error);
  return {
    statusCode: 500,
    message: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
  };
}

/**
 * Formats an error response for API handlers
 * @param error The error to format
 * @returns A formatted error response object
 */
export function formatErrorResponse(error: unknown): {
  statusCode: number;
  message: string;
  code: string;
  errors?: Record<string, string[]>;
} {
  if (error instanceof APIError) {
    const response: any = {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };

    if (error instanceof ValidationError && error.fieldErrors) {
      response.errors = error.fieldErrors;
    }

    return response;
  }

  // Handle unexpected errors
  console.error('Unexpected error:', error);
  return {
    statusCode: 500,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
  };
} 