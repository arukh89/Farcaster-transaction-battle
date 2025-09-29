// types/global.d.ts
export {};

declare global {
  interface Window {
    APP_NAME?: string;
    sdk?: any; // minimal supaya TS tidak komplain; bisa diganti dengan tipe yang lebih spesifik
  }
}
