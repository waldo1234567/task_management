import React from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain="https://dev-i8y8tcafjtnstqmz.us.auth0.com/"
      clientId="1AaF03iUw4Hz84aWuWNHW54FHxDMcs1l"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://api.task_management.com" 
      }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);