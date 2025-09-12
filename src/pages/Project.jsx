import React, { useState, useEffect, useRef , useCallback} from 'react';
import { useParams, Link } from 'react-router-dom';
import TaskForm from '../component/TaskForm';
import TaskList from '../component/TaskList';
import KanbanColumn from '../component/KanbanColumn';
import PresenceBar from '../component/PresenceBar';
import WSIndicator from '../component/WSIndicator';
import WhiteboardCanvas from '../component/WhiteboardCanvas';
import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import * as projectsApi from '../api/projects';
import useStomp from '../hooks/useStomp';
import Modal from '../component/Modal';

function ProjectPage() {
  const { projectId } = useParams();
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [presence, setPresence] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');

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

  // fetch board (columns + tasks) for authoritative ordering
  const { data: board = [], isLoading: boardLoading } = useQuery({
    queryKey: ['board', projectId],
    enabled: isAuthenticated && !!projectId,
    queryFn: async () => {
      try {
        const token = await getAccessTokenSilently();
        return projectsApi.fetchBoard(projectId, token);
      } catch (err) {
        console.error('Failed to load board', err);
        return [];
      }
    }
  });

  // optimistic update when moving tasks between columns
  // we'll use moveTask API for accurate moves (server computes position if not provided)
  const moveMutation = useMutation({
    mutationFn: async ({ id, toColumnId, newPosition }) => {
      const token = await getAccessTokenSilently();
      const body = {};
      if (toColumnId) body.toColumnId = toColumnId;
      if (typeof newPosition !== 'undefined') body.newPosition = newPosition;
      return tasksApi.moveTask(id, body, token);
    },
    onMutate: async ({ id, toColumnId }) => {
      await qc.cancelQueries(['tasks', projectId]);
      const previous = qc.getQueryData(['tasks', projectId]);
      qc.setQueryData(['tasks', projectId], (old = []) => {
        return old.map((t) => (String(t.id) === String(id) ? { ...t, columnId: toColumnId } : t));
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) qc.setQueryData(['tasks', projectId], context.previous);
      // show conflict toast - left as console for now
      console.error('Move conflict or error', err?.response?.status, err?.message || err);
    },
    onSettled: () => qc.invalidateQueries(['tasks', projectId])
  });

  const handleDrop = async (id, toColumnId) => {
    try {
      await moveMutation.mutateAsync({ id, toColumnId });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  // use the central STOMP hook for lifecycle & message handling
  const onMessage = useCallback((payload) => {
    if (!payload || !payload.type) return;
    switch (payload.type) {
      case 'task.created':
      case 'task.updated':
      case 'task.moved':
        qc.invalidateQueries(['board', projectId]);
        qc.invalidateQueries(['tasks', projectId]);
        break;
      case 'activity.created':
        // handle activity if needed
        break;
      case 'whiteboard.stroke':
        // route to canvas via a callback — we'll store strokes in state and pass to canvas via prop
        setRemoteStroke(payload);
        break;
    }
  },[qc, projectId]);

  const { publish, status: stompStatus, members: stompMembers, client } = useStomp({ projectId, getAccessTokenSilently, onMessage });
  useEffect(() => { setWsStatus(stompStatus); }, [stompStatus]);
  useEffect(() => { setPresence(stompMembers); }, [stompMembers]);

  const [remoteStroke, setRemoteStroke] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="p-6 panel-surface rounded-2xl shadow card-soft">
        <p className="mb-4">Please log in to view the board.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      <aside className="w-18 min-h-[320px] p-3 flex flex-col justify-between bg-white rounded-lg shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">🖊️</div>
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">📎</div>
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">🔍</div>
          <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">⚙️</div>
        </div>
        <div>
          <Link to="/dashboard" className="text-sm text-gray-600">← Projects</Link>
        </div>
      </aside>

      <main className="flex-1">
        <div className="whiteboard-header flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{project?.name || 'Project Board'}</h1>
            <div className="text-sm text-gray-400">{project?.description}</div>
          </div>
          <div className="flex items-center gap-4">
            <PresenceBar members={presence} />
            <WSIndicator status={wsStatus} />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
            <WhiteboardCanvas width={900} height={600} onLocalStroke={(msg) => {
              if (publish) publish(`/app/project.${projectId}`, { ...msg, projectId });
            }} remoteStroke={remoteStroke} />
          </div>

          <div className="w-[420px]">
            <div className="flex gap-3 items-start">
              {boardLoading && <div className="text-sm text-gray-500">Loading board...</div>}
              {!boardLoading && board
                .slice()
                .sort((a, b) => {
                  const pa = a.column ? a.column.positionIndex ?? 0 : Number.MAX_SAFE_INTEGER;
                  const pb = b.column ? b.column.positionIndex ?? 0 : Number.MAX_SAFE_INTEGER;
                  return pa - pb;
                })
                .map((colGroup) => {
                  const col = colGroup.column;
                  const title = col ? col.name : 'Unassigned';
                  const columnId = col ? col.id : null;
                  const count = (colGroup.tasks || []).length;
                  return (
                    <KanbanColumn key={String(columnId || 'unassigned')} title={title} status={null} onDrop={(id) => handleDrop(id, columnId)} count={count} wipLimit={999}>
                      {/* render task list filtered by columnId */}
                      <TaskList projectId={projectId} columnId={columnId} />
                    </KanbanColumn>
                  );
                })}
            </div>

            <div className="mt-4 text-right">
              <button className="btn-primary" onClick={() => setOpen(true)}>＋ Add Task</button>
            </div>
          </div>
        </div>

        <Modal open={open} onClose={() => setOpen(false)} title="Add Task">
          <TaskForm projectId={projectId} />
        </Modal>
      </main>
    </div>
  );
}

export default ProjectPage;
