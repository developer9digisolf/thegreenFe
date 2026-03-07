'use client';

import { useEffect, useState } from 'react';

interface IQRGeneratorProps {
  value: string;
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  className?: string;
}

/**
 * Dynamically imported QR code generator component
 * This component is lazy-loaded to reduce initial bundle size
 */
export function QRGenerator({
  value,
  size = 200,
  margin = 2,
  color = { dark: '#000000', light: '#ffffff' },
  className = '',
}: IQRGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function generateQR() {
      setLoading(true);

      try {
        // Dynamic import of QRCode library
        const QRCode = (await import('qrcode')).default;

        const dataUrl = await QRCode.toDataURL(value, {
          width: size,
          margin,
          color: {
            dark: color.dark || '#000000',
            light: color.light || '#ffffff',
          },
        });

        if (mounted) {
          setQrDataUrl(dataUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    generateQR();

    return () => {
      mounted = false;
    };
  }, [value, size, margin, color]);

  if (loading || !qrDataUrl) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color.light || '#ffffff',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0,0,0,0.1)',
            borderTopColor: 'currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <img
      src={qrDataUrl}
      alt="QR Code"
      className={className}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
}

export default QRGenerator;
