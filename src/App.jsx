import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import PublicNote from './pages/PublicNote';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ClassNotes from './pages/ClassNotes';
import NoteEditor from './pages/NoteEditor';

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
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/share/:noteId" element={<PublicNote />} />
        </Routes>

        <Toaster position="top-right" />
      </Router>
    </div>
  );
}

export default App;