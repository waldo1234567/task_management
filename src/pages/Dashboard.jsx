import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as projectsApi from '../api/projects';

// Simplified Dashboard now lists projects and links to the project board

function Dashboard() {
  const { isAuthenticated, loginWithRedirect, logout, user, getAccessTokenSilently } = useAuth0();
  // call hooks unconditionally to preserve hook order
  const qc = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    // don't run until we know the user is authenticated
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return await projectsApi.fetchProjects(token);
      } catch (err) {
        console.error('Failed to load projects:', err);
        return [];
      }
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="p-6 panel-surface rounded-2xl shadow card-soft">
        <p className="mb-4">Please log in to view your tasks.</p>
        <button className="px-3 py-1 btn-primary" onClick={() => loginWithRedirect()}>Log in</button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {user?.name || user?.email}</h2>
          <div className="text-sm text-gray-500">All your active projects are listed below.</div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects/new" className="btn-primary">+ New Project</Link>
          <button className="px-3 py-1 bg-gray-200 rounded-lg" onClick={() => logout({ returnTo: window.location.origin })}>Log out</button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="panel-surface p-4 rounded-2xl shadow card-soft">
          <h3 className="font-semibold mb-2">Your Projects</h3>
          {isLoading && <div className="text-gray-500">Loading projects...</div>}
          {!isLoading && projects.length === 0 && <div className="text-gray-500">You don't have any projects yet. Create one to get started.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="panel-surface p-4 rounded-xl shadow hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="font-medium text-lg">{p.name}</div>
                  <div className="text-sm text-gray-400 mt-2">{p.description}</div>
                </div>
                <div className="mt-4 text-sm text-gray-400">Created: {new Date(p.createdAt).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
