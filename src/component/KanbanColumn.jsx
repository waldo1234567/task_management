import React from 'react';

export default function KanbanColumn({ title, children, count, status, onDrop, wipLimit = Infinity }) {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setIsOver(false);
    if (onDrop && id) onDrop(id, status);
  };

  // status is expected to be uppercase (TODO, INPROGRESS, DONE, BLOCKED)
  const cls = status ? `header-${String(status).toUpperCase()}` : '';

  return (
    <div className={`column workspace-column ${isOver ? 'column-over' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <div className={`column-header ${cls}`}>
        <div className="column-header-left">
          <h3>{title}</h3>
          {typeof count === 'number' && <div className="column-badge">{count}</div>}
        </div>
        <div className="wip-indicator">{typeof count === 'number' ? `${count}` : ''}{wipLimit < Infinity ? ` / ${wipLimit}` : ''}</div>
      </div>
      <div className="column-body workspace-column-body">
        {children}
      </div>
    </div>
  );
}
