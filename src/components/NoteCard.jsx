import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';

const NoteCard = ({ note, onEdit, onDelete, onPin }) => {
  const theme = useStore(state => state.theme);

  // Safely format the date
  const getFormattedDate = () => {
    try {
      if (!note.updatedAt) return 'Just now';
      const date = new Date(note.updatedAt);
      if (isNaN(date.getTime())) return 'Just now';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  const handleCardClick = () => {
    onEdit(note);
  };

  const handlePin = (e) => {
    e.stopPropagation();
    onPin(note.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700 hover:border-blue-400'
          : 'bg-white border-gray-300 hover:border-blue-500'
      }`}
    >
      {/* Pin Badge */}
      {note.pinned && (
        <div className="absolute top-4 right-4">
          <span className="text-yellow-500 text-xl">📌</span>
        </div>
      )}

      {/* Note Title */}
      <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {note.title || 'Untitled Note'}
      </h3>

      {/* Note Preview */}
      <div className={`text-sm mb-4 space-y-2 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {note.questions && (
          <p className="line-clamp-2">
            <span className="font-medium">Q:</span> {note.questions.substring(0, 100)}
          </p>
        )}
        {note.mainContent && (
          <p className="line-clamp-2">{note.mainContent.substring(0, 150)}</p>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between text-xs ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <span>{getFormattedDate()}</span>
        
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handlePin}
            className={`p-1 rounded ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {note.pinned ? '📌' : '📍'}
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 rounded ${
              theme === 'dark'
                ? 'hover:bg-red-900/20 text-red-400'
                : 'hover:bg-red-50 text-red-600'
            }`}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;