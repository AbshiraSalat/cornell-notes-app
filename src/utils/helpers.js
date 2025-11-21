// Generate unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Generate note title based on class name
export const generateNoteTitle = (className) => {
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  return `${className} - ${date}`;
};

// Get theme classes
export const getThemeClasses = (theme) => {
  const themes = {
    minimal: 'bg-[#f5f1e8] text-gray-900', // Warm beige background
    dark: 'bg-gray-900 text-gray-100',
  };
  return themes[theme] || themes.minimal;
};

// Debounce function for auto-save
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get color for class
export const getClassColor = (index) => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F97316', // Orange
  ];
  return colors[index % colors.length];
};