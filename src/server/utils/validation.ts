export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim().toLowerCase());
}

export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6;
}

export function isValidPositiveInteger(val: any): boolean {
  return typeof val === 'number' && Number.isInteger(val) && val > 0;
}

export function isValidNonNegativeNumber(val: any): boolean {
  return typeof val === 'number' && !isNaN(val) && val >= 0;
}

export function sanitizeString(val: any, maxLength = 500): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLength);
}

export interface ShippingValidationResult {
  valid: boolean;
  error?: string;
}

export function validateShippingAddress(data: any): ShippingValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Shipping details are required.' };
  }

  const { fullName, phone, address, city, state, pincode } = data;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return { valid: false, error: 'Recipient full name must be at least 2 characters.' };
  }

  if (!phone || typeof phone !== 'string' || phone.trim().replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Please provide a valid 10-digit phone number.' };
  }

  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    return { valid: false, error: 'Please enter a complete delivery street address.' };
  }

  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return { valid: false, error: 'Please enter a valid city name.' };
  }

  if (!state || typeof state !== 'string' || state.trim().length < 2) {
    return { valid: false, error: 'Please enter a valid state.' };
  }

  if (!pincode || typeof pincode !== 'string' || pincode.trim().length < 4) {
    return { valid: false, error: 'Please enter a valid postal pincode.' };
  }

  return { valid: true };
}
