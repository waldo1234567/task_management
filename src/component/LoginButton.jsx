import React, { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();

  // keep hooks at top-level to satisfy Rules of Hooks
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  if (isAuthenticated) {
    const initials = user?.name ? user.name.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase() : (user?.email || '').slice(0,2).toUpperCase();
    return (
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen((s) => !s)} className="flex items-center gap-2 bg-white/60 panel-surface px-3 py-1 rounded-full shadow-sm">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">{initials}</div>
          <div className="text-sm">{user?.email?.split('@')[0]}</div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg panel-surface py-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); /* profile action placeholder */ }}>Profile</button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={() => { setOpen(false); /* settings action placeholder */ }}>Settings</button>
            <button className="w-full text-left px-3 py-2 text-red-600 hover:bg-gray-50" onClick={() => logout({ returnTo: window.location.origin })}>Log out</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => loginWithRedirect({ appState: { returnTo: '/dashboard' } })}
      className="btn-primary focus-ring"
      style={{ padding: '0.45rem 0.9rem' }}
    >
      Log In
    </button>
  );
};

export default LoginButton;