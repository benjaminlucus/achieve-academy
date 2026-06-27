import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment variables
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) { // 32 bytes in hex is 64 characters
    throw new Error('Invalid ENCRYPTION_KEY. Must be 32 bytes (64 hex chars)');
  }
  return Buffer.from(key, 'hex');
};

export const encrypt = (plaintext: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, encrypted data, and auth tag for storage
  return Buffer.concat([iv, encrypted, authTag]).toString('base64');
};

export const decrypt = (encryptedBase64: string): string => {
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  
  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const authTag = encryptedBuffer.subarray(-AUTH_TAG_LENGTH);
  const encrypted = encryptedBuffer.subarray(IV_LENGTH, -AUTH_TAG_LENGTH);
  
  const key = getEncryptionKey();
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
};
