import React from 'react';
import { X } from 'lucide-react';

const Tag = ({ 
  label, 
  onRemove, 
  color = 'blue',
}) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full font-medium ${colors[color]}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 transition-opacity" type="button">
          <X size={14} />
        </button>
      )}
    </span>
  );
};

export default Tag;