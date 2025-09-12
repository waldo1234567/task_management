import React from 'react';

export default function WSIndicator({ status = 'disconnected' }) {
  const cls = {
    connected: 'ws-connected',
    connecting: 'ws-connecting',
    disconnected: 'ws-disconnected'
  }[status] || 'ws-disconnected';

  return (
    <div className={`ws-indicator ${cls}`}>{status[0].toUpperCase() + status.slice(1)}</div>
  );
}
