/**
 * Dynamic components that are lazy-loaded for better performance
 *
 * These components use dynamic imports to reduce the initial bundle size.
 * Import and use them in your pages/components as needed.
 */

export { default as QRScanner } from './qr-scanner';
export type { QRScannerRef } from './qr-scanner';
export { default as QRGenerator } from './qr-generator';
export type { QRGeneratorProps } from './qr-generator';
export { DynamicChart } from './chart-loader';
export type { ChartComponentProps } from './chart-loader';

// Re-export as Next.js dynamic components
export { default as dynamicQRScanner } from './qr-scanner';
export { default as dynamicQRGenerator } from './qr-generator';
export { default as dynamicChart } from './chart-loader';
