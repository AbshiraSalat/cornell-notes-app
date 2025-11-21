import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const PublicNote = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPublicNote = async () => {
      try {
        setIsLoading(true);
        
        // Fetch the note
        const noteRef = doc(db, 'notes', noteId);
        const noteSnap = await getDoc(noteRef);
        
        if (!noteSnap.exists()) {
          setError('Note not found');
          setIsLoading(false);
          return;
        }
        
        const noteData = { id: noteSnap.id, ...noteSnap.data() };
        
        // Check if note is public
        if (!noteData.isPublic) {
          setError('This note is private');
          setIsLoading(false);
          return;
        }
        
        setNote(noteData);
        
        // Fetch class data if available
        if (noteData.classId) {
          const classRef = doc(db, 'classes', noteData.classId);
          const classSnap = await getDoc(classRef);
          if (classSnap.exists()) {
            setClassData({ id: classSnap.id, ...classSnap.data() });
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading public note:', error);
        setError('Failed to load note');
        setIsLoading(false);
      }
    };
    
    loadPublicNote();
  }, [noteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading shared note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600">This note may be private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      {/* Header */}
      <div className="bg-[#ebe7dd] border-b border-gray-300 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              CN
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{note.title || 'Untitled Note'}</h1>
              {classData && (
                <p className="text-sm text-gray-600">{classData.name} • {classData.code}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📖</span>
            <span>Shared Cornell Note</span>
            {note.createdAt && (
              <>
                <span>•</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cornell Notes Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Questions & Key Points */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
              <div className="px-6 py-4 bg-amber-50 border-b border-amber-200">
                <h2 className="font-semibold text-lg text-gray-900">
                  Questions & Key Points
                </h2>
              </div>
              <div className="p-6">
                <div className="whitespace-pre-wrap text-gray-900">
                  {note.questions || <span className="text-gray-400">No questions added</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Notes & Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Notes Section */}
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <h2 className="font-semibold text-lg text-gray-900">
                  Main Notes
                </h2>
              </div>
              <div className="p-6">
                <div className="whitespace-pre-wrap leading-relaxed text-gray-900">
                  {note.mainContent || <span className="text-gray-400">No notes added</span>}
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <h2 className="font-semibold text-lg text-gray-900">
                  Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="whitespace-pre-wrap text-gray-900">
                  {note.summary || <span className="text-gray-400">No summary added</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Created with Cornell Notes • <a href="/" className="text-blue-600 hover:underline">Create your own notes</a></p>
        </div>
      </div>
    </div>
  );
};

export default PublicNote;