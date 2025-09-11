import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TaskForm from '../component/TaskForm';
import TaskList from '../component/TaskList';
import KanbanColumn from '../component/KanbanColumn';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';
import Modal from '../component/Modal';

function ProjectPage() {
  const { projectId } = useParams();
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        const list = await projectsApi.fetchProjects(token);
        return list.find((p) => String(p.id) === String(projectId)) || { id: projectId, name: 'Project' };
      } catch (err) {
        console.error('Failed to load project', err);
        return { id: projectId, name: 'Project' };
      }
    },
    enabled: !!projectId
  });

  // fetch tasks for counts and WIP indicators
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    enabled: isAuthenticated && !!projectId,
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return tasksApi.fetchTasks(token, projectId);
      } catch (err) {
        console.error('Failed to load tasks for counts', err);
        return [];
      }
    }
  });

  // optimistic update when moving tasks between columns
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const token = await getAccessTokenSilently();
      return tasksApi.updateTask(id, updates, token);
    },
    onMutate: async ({ id, updates }) => {
      await qc.cancelQueries(['tasks', projectId]);
      const previous = qc.getQueryData(['tasks', projectId]);
      qc.setQueryData(['tasks', projectId], (old = []) => {
        return old.map((t) => (String(t.id) === String(id) ? { ...t, ...updates } : t));
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) qc.setQueryData(['tasks', projectId], context.previous);
    },
    onSettled: () => qc.invalidateQueries(['tasks', projectId])
  });

  const handleDrop = async (id, newStatus) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { status: newStatus, projectId } });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 panel-surface rounded-2xl shadow card-soft">
        <p className="mb-4">Please log in to view the board.</p>
      </div>
    );
  }

  return (
    <div className="whiteboard-page">
      <aside className="whiteboard-tools panel-surface">
        <div className="tools-stack">
          <div className="tool">🖊️</div>
          <div className="tool">📎</div>
          <div className="tool">🔍</div>
          <div className="tool">⚙️</div>
        </div>
        <div className="tools-bottom">
          <Link to="/dashboard" className="btn-ghost">← Projects</Link>
        </div>
      </aside>

      <main className="whiteboard-main">
        <div className="whiteboard-header">
          <h1>{project?.name || 'Project Board'}</h1>
          <div className="text-sm text-gray-400">{project?.description}</div>
        </div>

        <div className="board whiteboard-board">
          <KanbanColumn title="Backlog" status="TODO" onDrop={handleDrop} count={tasks.filter(t=>String(t.status).toUpperCase()==='TODO').length} wipLimit={8}>
            <TaskList status="TODO" projectId={projectId} />
          </KanbanColumn>
          <KanbanColumn title="Not started" status="INPROGRESS" onDrop={handleDrop} count={tasks.filter(t=>String(t.status).toUpperCase()==='INPROGRESS').length} wipLimit={5}>
            <TaskList status="INPROGRESS" projectId={projectId} />
          </KanbanColumn>
          <KanbanColumn title="In progress" status="INPROGRESS" onDrop={handleDrop} count={tasks.filter(t=>String(t.status).toUpperCase()==='INPROGRESS').length} wipLimit={5}>
            <TaskList status="INPROGRESS" projectId={projectId} />
          </KanbanColumn>
          <KanbanColumn title="Done" status="DONE" onDrop={handleDrop} count={tasks.filter(t=>String(t.status).toUpperCase()==='DONE').length} wipLimit={999}>
            <TaskList status="DONE" projectId={projectId} />
          </KanbanColumn>
        </div>

        <button className="fab-add" onClick={() => setOpen(true)}>＋ Add Task</button>

        <Modal open={open} onClose={() => setOpen(false)} title="Add Task">
          <TaskForm projectId={projectId} />
        </Modal>
      </main>
    </div>
  );
}

export default ProjectPage;
