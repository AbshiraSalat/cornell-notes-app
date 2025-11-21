import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { generateNoteTitle } from '../utils/helpers';
import toast from 'react-hot-toast';

const ClassNotes = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { theme, classes, notes, addNote, deleteNote, pinNote, templates } = useStore();
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const currentClass = classes.find(c => c.id === classId);
  const classNotes = notes.filter(n => n.classId === classId);
  
  const sortedNotes = [...classNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!currentClass) {
    return (
      <div className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
      }`}>
        <Sidebar />
        <div className="lg:pl-[280px] flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Class not found
            </h2>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateNote = async (template = null) => {
  try {
    setShowTemplateModal(false);
    
    const newNote = {
      classId: classId,
      className: currentClass.name,
      title: generateNoteTitle(currentClass.name),
      questions: template?.structure.questions || '',
      mainContent: '',
      summary: template?.structure.summary || '',
      tags: [],
      pinned: false,
      isPublic: false,
    };

    const loadingToast = toast.loading('Creating note...');
    console.log('🔵 Creating note:', newNote);

    // Add note to Firebase and local state
    const savedNote = await addNote(newNote);
    console.log('✅ Note saved with ID:', savedNote.id);
    
    // Wait a bit longer for Zustand state to propagate
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify note is in store
    const currentNotes = useStore.getState().notes;
    const noteExists = currentNotes.find(n => n.id === savedNote.id);
    console.log('✅ Note exists in store?', noteExists ? 'YES' : 'NO');
    console.log('Total notes in store:', currentNotes.length);
    
    toast.dismiss(loadingToast);
    toast.success('Note created!');
    
    console.log('🔵 Navigating to note:', savedNote.id);
    navigate(`/note/${savedNote.id}`);
  } catch (error) {
    console.error('❌ Error creating note:', error);
    toast.error('Failed to create note. Please try again.');
    setShowTemplateModal(false);
  }
};

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Delete this note?')) {
      deleteNote(noteId);
      toast.success('Note deleted');
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-200 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
    }`}>
      <Sidebar />
      
      <div className="lg:pl-[280px]">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 mb-4 transition-colors ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ← Back to Classes
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                style={{ 
                  backgroundColor: currentClass.color ? `${currentClass.color}20` : '#3B82F620'
                }}
              >
                {currentClass.icon || '📚'}
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl lg:text-4xl font-bold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {currentClass.name}
                </h1>
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>
                  {currentClass.code} • {classNotes.length} {classNotes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
            </div>

            <Button onClick={() => setShowTemplateModal(true)}>
              ➕ New Note
            </Button>
          </div>

          {sortedNotes.length === 0 ? (
            <div className="text-center py-16">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <span className="text-4xl">📝</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                No notes yet
              </h3>
              <p className={`mb-6 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Create your first note for this class
              </p>
              <Button onClick={() => setShowTemplateModal(true)}>
                ➕ Create Note
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={(note) => navigate(`/note/${note.id}`)}
                  onDelete={handleDeleteNote}
                  onPin={pinNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choose a Template"
        size="lg"
      >
        <div className="space-y-4">
          <button
            onClick={() => handleCreateNote()}
            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
              theme === 'dark'
                ? 'border-gray-600 hover:border-blue-400'
                : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                📝
              </div>
              <div>
                <h3 className={`font-semibold ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Blank Note
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Start with an empty Cornell note template
                </p>
              </div>
            </div>
          </button>

          <div className={`border-t pt-4 ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h4 className={`font-medium mb-3 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Subject Templates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleCreateNote(template)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:border-blue-400'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold mb-1 ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </h4>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassNotes;