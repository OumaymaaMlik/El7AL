/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  /** Where the contact form sends its message (a mailto link). */
  readonly VITE_CONTACT_EMAIL?: string;
}

/** three.js ships no types in this version; the 3D scenes use it loosely. */
declare module 'three';
