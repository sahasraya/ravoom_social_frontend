import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserIdEncryptionService {
  private encryptionKey = 'your-secure-key';  // You can use this key for HMAC or other purposes, but not needed for SHA-256

  constructor() {}

  // SHA-256 Hashing function using Web Crypto API
  async encrypt(data: string): Promise<string> {
    if (!data) return '';  // Return empty string if data is empty

    // Convert the string into an array of bytes
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Perform the SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Convert the hash buffer into a hex string (returns string type)
    return this.bufferToHex(hashBuffer);
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    const view = new DataView(buffer);
    let hexString = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      const byte = view.getUint8(i);
      hexString += byte.toString(16).padStart(2, '0');
    }
    return hexString;
  }

  // Decryption function: SHA-256 is a one-way function, so decryption is not possible
 

  // Store the encrypted (hashed) user ID as a string
  async storeEncryptedUserId(userid: string): Promise<void> {
    // Ensure that the userid is converted to a string
    const stringifiedUserId = String(userid);  // Convert to string
  
    // Check if the stringified userid is a valid non-empty string
    if (!stringifiedUserId.trim()) {
      console.error('Invalid userid. It must be a non-empty string.');
      return;
    }
  
    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const encryptedId = await this.encrypt(stringifiedUserId);  // Hash the userId using SHA-256
  
        if (encryptedId) {
          localStorage.setItem('wmd', encryptedId);  // Store the hashed value in localStorage
        } else {
          console.error('Encryption failed. Encrypted ID is empty.');
        }
      } catch (error) {
        console.error('Encryption error:', error);
      }
    } else {
      console.error('LocalStorage is not available.');
    }
    

    // Check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const encryptedId = await this.encrypt(userid);  // Hash the userId using SHA-256

        if (encryptedId) {
          localStorage.setItem('wmd', encryptedId);  // Store the hashed value in localStorage
        } else {
          console.error('Encryption failed. Encrypted ID is empty.');
        }
      } catch (error) {
        console.error('Encryption error:', error);
      }
    } else {
      console.error('LocalStorage is not available.');
    }
  }

  // Method to get the hashed user ID from localStorage
  getDecryptedUserId(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const encryptedId = localStorage.getItem('wmd') || '';
      this.decrypt(encryptedId);

      return encryptedId;  // Return the hash directly (SHA-256 is one-way, no decryption)
    }
    return '';  // Return empty string if localStorage is not available (e.g., in SSR)
  }
  async decrypt(data: string): Promise<string> {
    // Step 1: Get the stored hash (assuming it's stored in localStorage)
    const storedHash = localStorage.getItem('wmd') || '';  // Retrieve the stored hashed user ID
  
    // Step 2: Hash the provided data (the same way we hashed it before)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
  
    // Return a promise with a comparison between the hashes
    return crypto.subtle.digest('SHA-256', dataBuffer).then((hashBuffer: ArrayBuffer) => {
      const hashedData = this.bufferToHex(hashBuffer);
  
      // Step 3: Compare the provided hash with the stored hash
      if (hashedData === storedHash) {
        return data;  // If the hashes match, return the original data
      } else {
        return '';  // If the hashes don't match, return an empty string
      }
    }).catch(() => {
      return '';  // Return empty string in case of any error
    });
  }
  





  // Method to check if the hashed user ID matches a given string (used for comparison, not decryption)
  async verifyUserId(userId: string): Promise<boolean> {
    const storedHash = this.getDecryptedUserId();
    const hashToCompare = await this.encrypt(userId);  // Hash the input userId and compare

    return storedHash === hashToCompare;  // Return true if the hashes match
  }
}
