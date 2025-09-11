import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* provide a router-based onRedirectCallback for Auth0 so we navigate client-side */}
      <Auth0RouterWrapper>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Auth0RouterWrapper>
    </BrowserRouter>
  </React.StrictMode>
);

function Auth0RouterWrapper({ children }) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    // navigate to the originally requested path or default to /dashboard
    navigate(appState?.returnTo || '/dashboard');
  };

  return (
    <Auth0Provider
      domain="dev-i8y8tcafjtnstqmz.us.auth0.com"
      clientId="1AaF03iUw4Hz84aWuWNHW54FHxDMcs1l"
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.task_management.com"
      }}
    >
      {children}
    </Auth0Provider>
  );
}