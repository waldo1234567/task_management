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
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      className={`w-72 bg-white rounded-lg p-3 shadow-sm ${isOver ? 'ring-2 ring-indigo-300' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {typeof count === 'number' && <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{count}</div>}
        </div>
        <div className="text-xs text-gray-400">{typeof count === 'number' ? `${count}` : ''}{wipLimit < Infinity ? ` / ${wipLimit}` : ''}</div>
      </div>
      <div className="min-h-[40px] space-y-3">
        {children}
      </div>
    </div>
  );
}
