import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useStomp({ projectId, getAccessTokenSilently, onMessage } = {}) {
  const clientRef = useRef(null);
  const [status, setStatus] = useState('disconnected');
  const [members, setMembers] = useState([]);

  const publish = useCallback((destination, body) => {
    const c = clientRef.current;
    if (!c || !c.connected) return false;
    try {
      c.publish({ destination, body: JSON.stringify(body) });
      return true;
    } catch (err) {
      console.error('STOMP publish failed', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let client = null;
    const failCountRef = { current: 0 };
    const MAX_FAILS = 5;
    let triedWebSocketFallback = false;

    const connect = async () => {
      try {
        setStatus('connecting');
        const token = await getAccessTokenSilently();
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:6060';
  const sockUrl = `${apiBase}/ws?token=${encodeURIComponent(token)}`;
  console.debug('[useStomp] attempting SockJS connect to', sockUrl);
        // prefer SockJS (server configured with .withSockJS()), but if repeated failures occur,
        // fall back to raw WebSocket and send token via Sec-WebSocket-Protocol header (subprotocol)
        client = new Client({
          connectHeaders: { Authorization: `Bearer ${token}` },
          webSocketFactory: () => new SockJS(sockUrl),
          reconnectDelay: 5000,
          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,
          debug: (m) => console.debug('[STOMP]', m),
          onConnect: () => {
            if (!mounted) return;
            setStatus('connected');
            // reset fail count on successful connect
            try { failCountRef.current = 0; } catch (e) {}
            client.subscribe(`/topic/project.${projectId}`, (m) => {
              try {
                const payload = JSON.parse(m.body);
                if (onMessage) onMessage(payload);
              } catch (err) {
                console.error('Failed to parse STOMP message', err);
              }
            });

            client.subscribe(`/topic/project.${projectId}.presence`, (m) => {
              try {
                const payload = JSON.parse(m.body);
                if (payload && payload.type === 'presence.update') {
                  setMembers(payload.members || []);
                }
              } catch (err) {
                console.error('Failed to parse presence', err);
              }
            });

            // seed presence via REST while WS warms
            (async () => {
              try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:6060'}/api/projects/${encodeURIComponent(projectId)}/presence`, { headers: { Authorization: `Bearer ${await getAccessTokenSilently()}` } });
                if (res.ok) {
                  const data = await res.json();
                  setMembers(data || []);
                }
              } catch (err) {
                console.error('Failed to seed presence', err);
              }
            })();
          },
          onStompError: (f) => console.error('STOMP frame error', f),
          onWebSocketClose: (evt) => {
            console.warn('STOMP websocket closed', evt);
            // increase fail count on unexpected close before established
            try {
              failCountRef.current += 1;
              if (!triedWebSocketFallback && failCountRef.current >= 2) {
                // attempt raw WebSocket fallback once
                triedWebSocketFallback = true;
                console.warn('Attempting raw WebSocket fallback (no SockJS)');
                try {
                  const tokenFallback = (async () => await getAccessTokenSilently())();
                } catch (e) {
                  console.error('Failed to get token for fallback', e);
                }
                // deactivate current and try a raw WS client with Authorization header in connect frame
                try { clientRef.current && clientRef.current.deactivate(); } catch (e) {}
                // short delay then create raw WS client
                setTimeout(async () => {
                  try {
                    const token = await getAccessTokenSilently();
                    const wsUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:6060'}/ws`;
                    const rawClient = new Client({
                      webSocketFactory: () => new WebSocket(wsUrl),
                      connectHeaders: { Authorization: `Bearer ${token}` },
                      reconnectDelay: 5000,
                      heartbeatIncoming: 10000,
                      heartbeatOutgoing: 10000,
                      onConnect: () => {
                        setStatus('connected');
                        try { failCountRef.current = 0; } catch (e) {}
                        rawClient.subscribe(`/topic/project.${projectId}`, (m) => {
                          try { const payload = JSON.parse(m.body); if (onMessage) onMessage(payload); } catch (err) { console.error(err); }
                        });
                        rawClient.subscribe(`/topic/project.${projectId}.presence`, (m) => {
                          try { const payload = JSON.parse(m.body); if (payload && payload.type === 'presence.update') setMembers(payload.members || []); } catch (err) { console.error(err); }
                        });
                      },
                      onStompError: (f) => console.error('STOMP frame error', f),
                      onWebSocketClose: (e2) => console.error('Raw WS close', e2),
                      onDisconnect: () => setStatus('disconnected')
                    });
                    clientRef.current = rawClient;
                    rawClient.activate();
                  } catch (err) {
                    console.error('Raw WS fallback failed', err);
                    setStatus('failed');
                  }
                }, 800);
              } else if (failCountRef.current >= MAX_FAILS) {
                console.error('STOMP websocket failed repeatedly — stopping reconnects');
                // stop client retries
                try { clientRef.current && clientRef.current.deactivate(); } catch (e) {}
                setStatus('failed');
              }
            } catch (e) {}
          },
          onDisconnect: () => setStatus('disconnected')
        });

        clientRef.current = client;
        client.activate();
      } catch (err) {
        console.error('Failed STOMP connect', err);
        setStatus('disconnected');
      }
    };

  if (projectId && getAccessTokenSilently) connect();

    return () => {
      mounted = false;
      try { if (clientRef.current) clientRef.current.deactivate(); } catch (err) {}
      clientRef.current = null;
    };
  }, [projectId, getAccessTokenSilently, onMessage]);

  return {
    publish,
    status,
    members,
    client: clientRef.current
  };
}
