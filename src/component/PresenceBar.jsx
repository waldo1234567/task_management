import React from 'react';

export default function PresenceBar({ members = [] }) {
  return (
    <div className="presence-bar">
      <div className="presence-left">Online: {members.length}</div>
      <div className="presence-avatars">
        {members.slice(0, 8).map((m) => (
          <div key={m.auth0Id} className="avatar" title={m.displayName}>{m.displayName ? m.displayName.split(' ').map(n=>n[0]).join('').slice(0,2) : m.auth0Id.split('|').pop()}</div>
        ))}
      </div>
    </div>
  );
}
