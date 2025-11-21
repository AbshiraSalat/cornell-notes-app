import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import ClassCard from '../components/ClassCard';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    theme, 
    user, 
    classes, 
    notes, 
    addClass, 
    updateClass, 
    deleteClass,
    loadClasses,
    loadNotes 
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    professor: '',
    icon: '📚',
    color: '#3B82F6'
  });

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setIsLoading(true);
        try {
          await loadClasses();
          await loadNotes();
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Failed to load your data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast.error('Please fill in class name and code');
      return;
    }

    try {
      if (editingClass) {
        await updateClass(editingClass.id, formData);
        toast.success('Class updated!');
      } else {
        await addClass(formData);
        toast.success('Class added!');
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Failed to save class');
    }
  };

  const handleEdit = (classData) => {
    setEditingClass(classData);
    setFormData({
      name: classData.name,
      code: classData.code,
      professor: classData.professor || '',
      icon: classData.icon || '📚',
      color: classData.color || '#3B82F6'
    });
    setShowModal(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class? All notes will remain.')) {
      try {
        await deleteClass(classId);
        toast.success('Class deleted');
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error('Failed to delete class');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      professor: '',
      icon: '📚',
      color: '#3B82F6'
    });
    setEditingClass(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const getClassNoteCount = (classId) => {
    return notes.filter(note => note.classId === classId).length;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>
            Loading your classes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-200 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
    }`}>
      <Sidebar />
      
      <div className="lg:pl-[280px]">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                My Classes
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>
                {classes.length} {classes.length === 1 ? 'class' : 'classes'}
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              ➕ New Class
            </Button>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-16">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <span className="text-4xl">📚</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                No classes yet
              </h3>
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Create your first class to start taking Cornell notes
              </p>
              <Button onClick={() => setShowModal(true)}>
                ➕ Create Your First Class
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classData={classItem}
                  noteCount={getClassNoteCount(classItem.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={editingClass ? 'Edit Class' : 'New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Class Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Introduction to Physics"
            required
          />

          <Input
            label="Class Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., PHYS 101"
            required
          />

          <Input
            label="Professor (Optional)"
            value={formData.professor}
            onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
            placeholder="e.g., Dr. Smith"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Icon
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-800 text-gray-100'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="📚">📚 Book</option>
                <option value="🔬">🔬 Science</option>
                <option value="💻">💻 Computer</option>
                <option value="🎨">🎨 Art</option>
                <option value="📊">📊 Business</option>
                <option value="⚗️">⚗️ Chemistry</option>
                <option value="🧮">🧮 Math</option>
                <option value="🌍">🌍 Geography</option>
                <option value="📖">📖 Literature</option>
                <option value="🎵">🎵 Music</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className={`w-full h-10 rounded-lg border cursor-pointer ${
                  theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleModalClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingClass ? 'Update Class' : 'Create Class'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;