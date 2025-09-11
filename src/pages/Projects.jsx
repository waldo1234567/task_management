import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as projectsApi from '../api/projects';
import { useNavigate } from 'react-router-dom';

function ProjectsNew() {
  const { getAccessTokenSilently } = useAuth0();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const create = useMutation({
    mutationFn: async (payload) => {
      const token = await getAccessTokenSilently();
      return projectsApi.createProject(payload, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries(['projects']);
      navigate(`/projects/${data.id}`);
    }
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="panel-surface p-6 rounded-2xl shadow card-soft">
      <h3 className="text-lg font-semibold mb-4">Create Project</h3>
      <div className="space-y-3">
        <input className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn-primary" onClick={() => create.mutate({ name, description })}>Create</button>
      </div>
    </div>
  );
}

export default ProjectsNew;
