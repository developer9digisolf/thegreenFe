/**
 * POS Header Component
 * Displays session info, mode switcher, and pending orders count
 */

'use client';

import React from 'react';
import { CashierSession, PosMode } from '../types/pos.types';

interface IPOSHeaderProps {
  mode: PosMode;
  setMode: (mode: PosMode) => void;
  currentSession: CashierSession | undefined;
  pendingOrdersCount: number;
  onCloseSession?: () => void;
}

export function POSHeader({
  mode,
  setMode,
  currentSession,
  pendingOrdersCount,
  onCloseSession,
}: IPOSHeaderProps) {
  return (
    <div className="pos-header">
      <div className="pos-header-left">
        {currentSession && (
          <div className="session-info">
            <span className="session-code">{currentSession.sessionCode}</span>
            <span className="session-status">{currentSession.statusName}</span>
          </div>
        )}
      </div>

      <div className="pos-header-center">
        <div className="mode-switcher">
          <button
            className={`mode-btn ${mode === 'session' ? 'active' : ''}`}
            onClick={() => setMode('session')}
          >
            Session
          </button>
          <button
            className={`mode-btn ${mode === 'voucher' ? 'active' : ''}`}
            onClick={() => setMode('voucher')}
          >
            Voucher
          </button>
          <button
            className={`mode-btn ${mode === 'redeem' ? 'active' : ''}`}
            onClick={() => setMode('redeem')}
          >
            Redeem
          </button>
        </div>
      </div>

      <div className="pos-header-right">
        {pendingOrdersCount > 0 && (
          <div className="pending-badge">{pendingOrdersCount} Pending</div>
        )}
        {currentSession && onCloseSession && (
          <button className="close-session-btn" onClick={onCloseSession}>
            Close Session
          </button>
        )}
      </div>
    </div>
  );
}

export default POSHeader;
