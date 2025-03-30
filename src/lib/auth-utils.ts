import bcrypt from 'bcryptjs'

/**
 * Validates an email address
 * @param email Email to validate
 * @returns Array of error messages, empty if valid
 */
export function validateEmail(email: string): string[] {
  const errors: string[] = []
  
  if (!email) {
    errors.push('Email is required')
    return errors
  }
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format')
  }
  
  return errors
}

/**
 * Validates a username
 * @param username Username to validate
 * @returns Array of error messages, empty if valid
 */
export function validateUsername(username: string): string[] {
  const errors: string[] = []
  
  if (!username) {
    errors.push('Username is required')
    return errors
  }
  
  // Username must be 3-30 characters and only contain letters, numbers, and underscores
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters')
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters')
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores')
  }
  
  return errors
}

/**
 * Validates a password
 * @param password Password to validate
 * @returns Array of error messages, empty if valid
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
    return errors
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  
  // Password should contain at least one uppercase letter, one lowercase letter, and one number
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return errors
}

/**
 * Validates signup data
 * @param data The signup data to validate
 * @returns Object with validation errors by field
 */
export function validateSignupData(data: any): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  if (!data) {
    errors.general = ['No data provided'];
    return errors;
  }
  
  const { email, password, username } = data;
  
  // Validate email
  const emailErrors = validateEmail(email);
  if (emailErrors.length > 0) {
    errors.email = emailErrors;
  }
  
  // Validate password
  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }
  
  // Validate username
  const usernameErrors = validateUsername(username);
  if (usernameErrors.length > 0) {
    errors.username = usernameErrors;
  }
  
  return errors;
}

/**
 * Hashes a password using bcrypt
 * @param password Password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

/**
 * Verifies a password against a hash
 * @param password Password to verify
 * @param hashedPassword Hashed password to compare against
 * @returns Whether the password matches the hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
} 