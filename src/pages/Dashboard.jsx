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
        <h2 className="text-2xl font-semibold">Welcome, {user?.name || user?.email}</h2>
        <button className="px-3 py-1 bg-gray-200 rounded-lg" onClick={() => logout({ returnTo: window.location.origin })}>Log out</button>
      </div>

      <div className="space-y-6">
        <div className="panel-surface p-4 rounded-2xl shadow card-soft">
          <h3 className="font-semibold mb-2">Your Projects</h3>
          {isLoading && <div className="text-gray-500">Loading projects...</div>}
          <div className="grid grid-cols-2 gap-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="panel-surface p-4 rounded-xl shadow hover:shadow-md transition">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-400">{p.description}</div>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/projects/new" className="btn-primary inline-block">Create Project</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
