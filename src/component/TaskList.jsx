import React from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';

function TaskList({ status = null, projectId = null }) {
  const qc = useQueryClient();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      let token = null;
      if (isAuthenticated) {
        try {
          token = await getAccessTokenSilently();
        } catch (err) {
          console.error('Failed to get access token (TaskList):', err);
          throw err; // surface to react-query
        }
      }
      try {
        return await tasksApi.fetchTasks(token, projectId);
      } catch (err) {
        console.error('API fetchTasks error:', err?.response?.status, err?.response?.data || err.message);
        throw err;
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      let token = null;
      if (isAuthenticated) {
        try {
          token = await getAccessTokenSilently();
        } catch (err) {
          console.error('Failed to get access token (update):', err);
          throw err;
        }
      }
      try {
        return await tasksApi.updateTask(id, updates, token);
      } catch (err) {
        console.error('API updateTask error:', err?.response?.status, err?.response?.data || err.message);
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries(['tasks'])
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      let token = null;
      if (isAuthenticated) {
        try {
          token = await getAccessTokenSilently();
        } catch (err) {
          console.error('Failed to get access token (delete):', err);
          throw err;
        }
      }
      try {
        return await tasksApi.deleteTask(id, token);
      } catch (err) {
        console.error('API deleteTask error:', err?.response?.status, err?.response?.data || err.message);
        throw err;
      }
    },
    onSuccess: () => qc.invalidateQueries(['tasks'])
  });

  if (isLoading) return <div className="empty-card text-gray-500">Loading tasks...</div>;

  const filterStatus = status ? String(status).toUpperCase() : null;

  const visible = tasks.filter((tsk) => (filterStatus ? String(tsk.status).toUpperCase() === filterStatus : true));

  return (
    <div>
      {visible.length === 0 && (
        <div className="task-card empty-card">No tasks yet</div>
      )}
      <ul className="space-y-4">
        {visible.map((t) => {
          const prioClass = `prio-${t.priority ?? 3}`;
          return (
          <motion.li
            layout
            key={t.id}
            className={`task-card ${prioClass}`}
            whileHover={{ y: -6 }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(t.id));
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <div>
              <div className="task-title">{t.title}</div>
              <div className="task-desc">{t.description}</div>
              <div className="text-xs text-gray-400 mt-2">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'} · Priority: {t.priority ?? 3} · {t.assigneeAuth0Id ? t.assigneeAuth0Id.split('|').pop() : 'Unassigned'}</div>
            </div>
            <div className="task-meta">
              <div className="task-actions">
                <select className="form-control" value={String(t.status).toUpperCase()} onChange={(e) => updateMutation.mutate({ id: t.id, updates: { status: e.target.value } })}>
                  <option value="TODO">To Do</option>
                  <option value="INPROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
                <button className="btn-ghost" onClick={() => deleteMutation.mutate(t.id)}>Delete</button>
              </div>
              <div className="text-sm text-gray-400">#{t.id}</div>
            </div>
          </motion.li>
          );
  })}
      </ul>
    </div>
  );
}

export default TaskList;
