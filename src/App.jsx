import React from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import ProjectsNew from './pages/Projects';
import ProjectPage from './pages/Project';
import LoginButton from './component/LoginButton';

function App() {
  return (
    <div className="min-h-screen">
      <nav className="container flex items-center justify-between py-6">
        <Link to="/" className="text-xl font-semibold tracking-tight">Task Manager</Link>
        <div className="flex items-center gap-3">
          <LoginButton />
        </div>
      </nav>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/new" element={<ProjectsNew />} />
          <Route path="/projects/:projectId" element={<ProjectPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
