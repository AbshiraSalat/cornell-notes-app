import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ClassNotes from './pages/ClassNotes';
import NoteEditor from './pages/NoteEditor';
import SharedNote from './pages/SharedNote';

function App() {
  const theme = useStore(state => state.theme);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/class/:classId" element={<ClassNotes />} />
          <Route path="/note/:noteId" element={<NoteEditor />} />
          <Route path="/share/:noteId" element={<SharedNote />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </div>
  );
}

export default App;
