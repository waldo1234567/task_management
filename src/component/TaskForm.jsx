import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';

function TaskForm({ projectId: propProjectId = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeAuth0Id, setAssigneeAuth0Id] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(3);
  const [projectId, setProjectId] = useState(propProjectId || '');
  const qc = useQueryClient();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      let token = null;
      if (isAuthenticated) {
        try {
          token = await getAccessTokenSilently();
        } catch (err) {
          console.error('Failed to get access token (create):', err);
          throw err;
        }
      }
      try {
        return await tasksApi.createTask(payload, token);
      } catch (err) {
        console.error('API createTask error:', err?.response?.status, err?.response?.data || err.message);
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['tasks']);
      setTitle('');
      setDescription('');
    }
  });

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
  // CreateTaskRequest shape: projectId, title, description, assigneeAuth0Id, dueDate, priority
  createMutation.mutate({ projectId: projectId || null, title, description, assigneeAuth0Id: assigneeAuth0Id || null, dueDate: dueDate || null, priority: Number(priority) || 3 });
  };

  return (
    <form onSubmit={submit} className="space-y-4 card-soft panel-surface p-5">
      <div>
        <input
          className="form-control"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <input
          className="form-control"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="form-control" placeholder="Assignee Auth0 id" value={assigneeAuth0Id} onChange={(e) => setAssigneeAuth0Id(e.target.value)} />
        <input className="form-control" type="date" placeholder="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {!propProjectId && <input className="form-control" placeholder="Project ID (optional)" value={projectId} onChange={(e) => setProjectId(e.target.value)} />}
        <select className="form-control" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value={1}>1 (Highest)</option>
          <option value={2}>2</option>
          <option value={3}>3 (Default)</option>
          <option value={4}>4</option>
          <option value={5}>5 (Lowest)</option>
        </select>
      </div>
      <motion.button whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.02 }} className="btn-primary" type="submit">Add Task</motion.button>
    </form>
  );
}

export default TaskForm;
