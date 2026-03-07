'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface IQRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
  fps?: number;
  qrbox?: number | { width: number; height: number };
  aspectRatio?: number;
}

export interface QRScannerRef {
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

/**
 * Dynamically imported QR scanner component
 * This component is lazy-loaded to reduce initial bundle size
 */
const QRScanner = forwardRef<QRScannerRef, IQRScannerProps>(
  ({ onScanSuccess, onScanFailure, fps = 10, qrbox = 250, aspectRatio = 1.0 }, ref) => {
    const scannerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitializedRef = useRef(false);

    useImperativeHandle(
      ref,
      () => ({
        start: async () => {
          if (!scannerRef.current || isInitializedRef.current) return;

          try {
            const { Html5Qrcode } = await import('html5-qrcode');

            scannerRef.current = new Html5Qrcode('qr-scanner-container');
            isInitializedRef.current = true;

            await scannerRef.current.start(
              { facingMode: 'environment' },
              {
                fps,
                qrbox,
                aspectRatio,
              },
              (decodedText: string) => {
                onScanSuccess(decodedText);
              },
              (errorMessage: string) => {
                onScanFailure?.(errorMessage);
              }
            );
          } catch (error) {
            console.error('Failed to start QR scanner:', error);
          }
        },
        stop: async () => {
          if (scannerRef.current && isInitializedRef.current) {
            try {
              await scannerRef.current.stop();
              isInitializedRef.current = false;
            } catch (error) {
              console.error('Failed to stop QR scanner:', error);
            }
          }
        },
      }),
      [onScanSuccess, onScanFailure, fps, qrbox, aspectRatio]
    );

    useEffect(() => {
      return () => {
        if (scannerRef.current && isInitializedRef.current) {
          scannerRef.current
            .stop()
            .catch((error: any) => console.error('Failed to stop QR scanner on unmount:', error));
        }
      };
    }, []);

    return <div id="qr-scanner-container" ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }
);

QRScanner.displayName = 'QRScanner';

export default QRScanner;
