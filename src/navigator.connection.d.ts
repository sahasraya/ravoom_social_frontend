// src/@types/navigator.connection.d.ts

interface Connection {
    effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'ethernet' | 'wifi' | 'none';
    addEventListener(type: 'change', listener: () => void): void;
    removeEventListener(type: 'change', listener: () => void): void;
  }
  
  interface Navigator {
    connection?: Connection;
  }
  