import React from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

const decodeSharedNote = (shareId) => {
  try {
    const json = decodeURIComponent(atob(shareId));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

const SharedNotePage = () => {
  const { shareId } = useParams();
  const note = decodeSharedNote(shareId);

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid or expired link</h1>
          <p className="text-gray-600">
            This shared note could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="lg:pl-[280px] px-4 py-6 lg:px-8 lg:py-8 max-w-5xl mx-auto space-y-6">
        <header>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Shared Cornell Note
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            {note.title}
          </h1>
          {note.className && (
            <p className="text-sm text-gray-500">
              {note.className}
            </p>
          )}
        </header>

        {/* Cornell layout, read-only */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Questions */}
          <div className="lg:col-span-1">
            <h2 className="font-semibold text-gray-900 mb-2">
              Questions / Cues
            </h2>
            <div className="min-h-[200px] rounded-lg border border-gray-200 bg-white p-3 text-sm whitespace-pre-wrap">
              {note.questions || <span className="text-gray-400">No questions added.</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-2">
              Notes
            </h2>
            <div className="min-h-[200px] rounded-lg border border-gray-200 bg-white p-3 text-sm whitespace-pre-wrap">
              {note.notes || <span className="text-gray-400">No notes added.</span>}
            </div>
          </div>
        </section>

        {/* Summary */}
        <section>
          <h2 className="font-semibold text-gray-900 mb-2">
            Summary
          </h2>
          <div className="min-h-[120px] rounded-lg border border-gray-200 bg-white p-3 text-sm whitespace-pre-wrap">
            {note.summary || <span className="text-gray-400">No summary added.</span>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SharedNotePage;
