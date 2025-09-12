import React from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import { motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';

function TaskList({ status = null, projectId = null, columnId = null }) {
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

  if (isLoading) return <div className="text-gray-500">Loading tasks...</div>;

  const filterStatus = status ? String(status).toUpperCase() : null;

  const visible = tasks.filter((tsk) => {
    if (filterStatus && String(tsk.status).toUpperCase() !== filterStatus) return false;
    if (columnId && String(tsk.columnId || '') !== String(columnId)) return false;
    return true;
  });

  return (
    <div>
      {visible.length === 0 && (
        <div className="text-gray-500">No tasks yet</div>
      )}
      <ul className="space-y-4">
        {visible.map((t) => {
          const prioClass = `prio-${t.priority ?? 3}`;
          return (
          <motion.li
            layout
            key={t.id}
            className={`bg-white p-3 rounded-md shadow-sm flex justify-between gap-4 ${prioClass}`}
            whileHover={{ y: -6 }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(t.id));
              e.dataTransfer.effectAllowed = 'move';
            }}
          >
            <div className="flex-1">
              <div className="font-medium">{t.title}</div>
              <div className="text-sm text-gray-500">{t.description}</div>
              <div className="text-xs text-gray-400 mt-2">Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'} · Priority: {t.priority ?? 3} · {t.assigneeAuth0Id ? t.assigneeAuth0Id.split('|').pop() : 'Unassigned'}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-1 text-sm" value={String(t.status).toUpperCase()} onChange={(e) => updateMutation.mutate({ id: t.id, updates: { status: e.target.value } })}>
                  <option value="TODO">To Do</option>
                  <option value="INPROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
                <button className="text-sm text-gray-600" onClick={() => deleteMutation.mutate(t.id)}>Delete</button>
              </div>
              <div className="text-xs text-gray-400">#{t.id}</div>
            </div>
          </motion.li>
          );
  })}
      </ul>
    </div>
  );
}

export default TaskList;
