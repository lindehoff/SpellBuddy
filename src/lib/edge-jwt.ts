import { createHmac } from 'crypto';

interface TokenPayload {
  username: string;
  exp: number;
}

// Simple base64 encoding/decoding that works in Edge Runtime
function base64Encode(str: string): string {
  return btoa(str);
}

function base64Decode(str: string): string {
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

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Simple token verification that works in Edge Runtime
async function verifySignature(message: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await createSignature(message, secret);
  return signature === expectedSignature;
}

export async function signJwt(payload: { username: string }, secret: string): Promise<string> {
  const tokenPayload: TokenPayload = {
    username: payload.username,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };

  const payloadString = JSON.stringify(tokenPayload);
  const base64Payload = base64Encode(payloadString);
  const signature = await createSignature(base64Payload, secret);

  return `${base64Payload}.${signature}`;
}

export async function verifyJwt(token: string, secret: string): Promise<TokenPayload | null> {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    // Verify signature
    const isValid = await verifySignature(payloadBase64, signature, secret);
    if (!isValid) {
      return null;
    }

    // Decode payload
    const payloadString = base64Decode(payloadBase64);
    const payload = JSON.parse(payloadString) as TokenPayload;

    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
} 