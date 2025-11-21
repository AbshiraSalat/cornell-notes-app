import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const ClassCard = ({ 
  classData,
  onEdit,
  onDelete,
  noteCount = 0
}) => {
  const navigate = useNavigate();
  const theme = useStore(state => state.theme);
  const [showMenu, setShowMenu] = useState(false);

  const handleCardClick = () => {
    navigate(`/class/${classData.id}`);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(classData);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(classData.id);
  };

  return (
    <div className="relative group">
      <div
        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700 hover:border-blue-400'
            : 'bg-white border-gray-300 hover:border-blue-500'
        }`}
        onClick={handleCardClick}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ backgroundColor: classData.color || '#3B82F6' }}
        />

        {/* Menu Button */}
        <button
          onClick={handleMenuClick}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
            theme === 'dark'
              ? 'hover:bg-gray-700'
              : 'hover:bg-gray-100'
          }`}
        >
          <svg className={`w-5 h-5 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`} fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className={`absolute top-12 right-4 rounded-lg shadow-xl border py-2 z-10 min-w-[150px] ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-300'
          }`}>
            <button
              onClick={handleEdit}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              ✏️ Edit Class
            </button>
            <button
              onClick={handleDelete}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
                theme === 'dark'
                  ? 'hover:bg-red-900/20 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
              }`}
            >
              🗑️ Delete Class
            </button>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: classData.color ? `${classData.color}20` : '#3B82F620' }}
            >
              {classData.icon || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg truncate ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {classData.name}
              </h3>
              <p className={`text-sm truncate ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {classData.code}
              </p>
            </div>
          </div>

          {classData.professor && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {classData.professor}
            </p>
          )}

          <div className={`flex items-center gap-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>📖</span>
            <span>{noteCount} {noteCount === 1 ? 'note' : 'notes'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;