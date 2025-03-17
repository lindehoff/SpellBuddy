// Remove the createHmac import if it's not being used
// Add any necessary imports for JWT functionality

// Implementing minimal JWT functions for Edge Runtime

// Simple base64 encoding/decoding that works in Edge Runtime
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// Simple HMAC-like function that works in Edge Runtime
async function createSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    keyData,
    encoder.encode(message)
  );

  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export interface JwtPayload {
  [key: string]: unknown;
  exp?: number;
}

export async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Add expiration if not present
  if (!payload.exp) {
    payload.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  }
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;
  const signature = await createSignature(message, secret);
  
  return `${message}.${signature}`;
}

export async function verifyJwt<T extends JwtPayload>(token: string, secret: string): Promise<T | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }
    
    // Verify signature
    const message = `${headerB64}.${payloadB64}`;
    const expectedSignature = await createSignature(message, secret);
    
    if (signatureB64 !== expectedSignature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as T;
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
} 