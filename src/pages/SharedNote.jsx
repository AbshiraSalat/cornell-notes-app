import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const SharedNote = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "notes", noteId);
      const snap = await getDoc(ref);

      if (snap.exists() && snap.data().isPublic === true) {
        setNote({ id: snap.id, ...snap.data() });
      }

      setLoading(false);
    };

    load();
  }, [noteId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      Loading…
    </div>
  );

  if (!note) return (
    <div className="min-h-screen flex items-center justify-center">
      <h2>Note not found or not public.</h2>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">{note.title}</h1>

      <h2 className="text-xl mt-6 font-semibold">Questions</h2>
      <pre className="bg-gray-100 p-4 rounded">{note.questions}</pre>

      <h2 className="text-xl mt-6 font-semibold">Notes</h2>
      <pre className="bg-gray-100 p-4 rounded">{note.mainContent}</pre>

      <h2 className="text-xl mt-6 font-semibold">Summary</h2>
      <pre className="bg-gray-100 p-4 rounded">{note.summary}</pre>
    </div>
  );
};

export default SharedNote;
