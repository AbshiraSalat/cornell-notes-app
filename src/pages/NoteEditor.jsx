import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { debounce } from '../utils/helpers';
import toast from 'react-hot-toast';

const NoteEditor = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { theme, notes, updateNote, classes, user, loadNotes } = useStore();
  
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState('');
  const [mainContent, setMainContent] = useState('');
  const [summary, setSummary] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Load notes on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(true);
        return;
      }
      setIsLoading(true);
      await loadNotes();
      await new Promise(resolve => setTimeout(resolve, 300));
      setIsLoading(false);
    };
    
    loadData();
  }, [user, loadNotes]);

  // Find note when notes load
  useEffect(() => {
    if (isLoading) return;
    const note = notes.find(n => n.id === noteId);
    if (note && !isInitialized) {
      setCurrentNote(note);
      setTitle(note.title || '');
      setQuestions(note.questions || '');
      setMainContent(note.mainContent || '');
      setSummary(note.summary || '');
      setIsInitialized(true);
    }
  }, [notes, noteId, isLoading, isInitialized]);

  // Debounced auto-save
  const saveNoteDebounced = useCallback(
    debounce((noteData) => {
      updateNote(noteId, noteData);
      setLastSaved(new Date());
    }, 1500),
    [noteId, updateNote]
  );

  useEffect(() => {
    if (isInitialized && currentNote) {
      saveNoteDebounced({
        title,
        questions,
        mainContent,
        summary,
      });
    }
  }, [title, questions, mainContent, summary, isInitialized, currentNote, saveNoteDebounced]);

  const handleTogglePublic = async () => {
    try {
      const newPublicStatus = !currentNote.isPublic;
      await updateNote(noteId, { isPublic: newPublicStatus });
      setCurrentNote({ ...currentNote, isPublic: newPublicStatus });
      toast.success(newPublicStatus ? 'Note is now public!' : 'Note is now private.');
    } catch (error) {
      console.error('Error toggling public status:', error);
      toast.error('Failed to update sharing settings');
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${noteId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>
            Loading note...
          </p>
        </div>
      </div>
    );
  }

  if (!currentNote && !isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Note not found
          </h2>
          <p className={`mb-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>
            Note ID: {noteId}
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentClass = classes.find(c => c.id === currentNote?.classId);

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-[#f5f1e8]'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-20 border-b ${
        theme === 'dark'
          ? 'bg-gray-900 border-gray-800'
          : 'bg-[#ebe7dd] border-gray-300'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate(currentNote ? `/class/${currentNote.classId}` : '/dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-200'
                }`}
              >
                ←
              </button>
              
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                  placeholder="Untitled Note"
                />
                <div className={`flex items-center gap-3 mt-1 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span>{currentClass?.name || 'Unknown Class'}</span>
                  {lastSaved && (
                    <>
                      <span>•</span>
                      <span>Saved {lastSaved.toLocaleTimeString()}</span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowShareModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  currentNote?.isPublic
                    ? theme === 'dark'
                      ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {currentNote?.isPublic ? '🔗 Shared' : '🔒 Share'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cornell Notes Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Questions & Key Points */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border overflow-hidden sticky top-24 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}>
              <div className={`px-6 py-4 border-b ${
                theme === 'dark'
                  ? 'bg-amber-900/20 border-amber-800'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <h2 className={`font-semibold text-lg ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Questions & Key Points
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder="• Key questions&#10;• Important terms&#10;• Main concepts"
                  className={`w-full min-h-[400px] bg-transparent border-none outline-none resize-none placeholder-gray-400 whitespace-pre-wrap break-words ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Main Notes & Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Notes Section */}
            <div className={`rounded-xl border overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}>
              <div className={`px-6 py-4 border-b ${
                theme === 'dark'
                  ? 'bg-blue-900/20 border-blue-800'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <h2 className={`font-semibold text-lg ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Main Notes
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  value={mainContent}
                  onChange={(e) => setMainContent(e.target.value)}
                  placeholder="Start taking notes..."
                  className={`w-full min-h-[500px] bg-transparent border-none outline-none resize-none leading-relaxed placeholder-gray-400 whitespace-pre-wrap break-words ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className={`rounded-xl border overflow-hidden ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }`}>
              <div className={`px-6 py-4 border-b ${
                theme === 'dark'
                  ? 'bg-green-900/20 border-green-800'
                  : 'bg-green-50 border-green-200'
              }`}>
                <h2 className={`font-semibold text-lg ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Summary
                </h2>
              </div>
              <div className="p-6">
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize the key points from your notes..."
                  className={`w-full min-h-[150px] bg-transparent border-none outline-none resize-none placeholder-gray-400 whitespace-pre-wrap break-words ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Share Note
            </h3>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                  }`}>
                    Public Access
                  </span>
                  <button
                    onClick={handleTogglePublic}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentNote?.isPublic ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentNote?.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {currentNote?.isPublic
                    ? 'Anyone with the link can view this note'
                    : 'Only you can view this note'}
                </p>
              </div>

              {currentNote?.isPublic && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/share/${noteId}`}
                      readOnly
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className={`w-full mt-6 px-4 py-2 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
