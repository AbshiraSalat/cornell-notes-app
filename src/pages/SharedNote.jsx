import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const SharedNote = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ref = doc(db, "notes", noteId);
        const snap = await getDoc(ref);

        if (snap.exists() && snap.data().isPublic === true) {
          setNote({ id: snap.id, ...snap.data() });
        } else {
          setNote(null);
        }
      } catch (err) {
        console.error("Error loading shared note:", err);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [noteId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl px-8 py-6 flex flex-col items-center gap-3 shadow-xl">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-200 text-sm">Loading shared note…</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">
            Note not found or not public
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            This link might be incorrect, expired, or the note owner has turned
            off sharing.
          </p>
          <a
            href="https://cornellnotes.net"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-medium text-white transition-colors"
          >
            Go to Cornell Notes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
      {/* Top bar */}
      <header className="max-w-5xl mx-auto mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center font-bold text-sm">
            CN
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
              Shared Cornell Note
            </p>
            <h1 className="text-lg font-semibold text-slate-50">
              {note.title || "Untitled Note"}
            </h1>
          </div>
        </div>

        <a
          href="https://cornellnotes.net"
          className="text-xs sm:text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          Open app →
        </a>
      </header>

      {/* Main card */}
      <main className="max-w-5xl mx-auto">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Meta bar */}
          <div className="px-6 sm:px-8 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              {note.className && (
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  {note.className}
                </span>
              )}
              {note.createdAt && (
                <span className="text-[11px] text-slate-500">
                  Created:{" "}
                  {new Date(note.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 px-3 py-1 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Public link
            </span>
          </div>

          {/* Cornell layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] gap-0">
            {/* Left column: Questions */}
            <section className="border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60">
              <div className="px-6 sm:px-8 py-4 border-b border-slate-800/80 bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
                  Questions & Cues
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Key prompts, terms, and triggers for recall.
                </p>
              </div>
              <div className="px-6 sm:px-8 py-5">
                <div className="text-sm whitespace-pre-wrap break-words text-slate-100/90 leading-relaxed">
                  {note.questions?.trim() || (
                    <span className="text-slate-500">
                      No questions added for this note yet.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Right column: Main notes */}
            <section className="border-b border-slate-800 bg-slate-900/40">
              <div className="px-6 sm:px-8 py-4 border-b border-slate-800/80 bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
                  Lecture Notes
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Main ideas, explanations, diagrams, and examples.
                </p>
              </div>
              <div className="px-6 sm:px-8 py-5">
                <div className="text-sm whitespace-pre-wrap break-words text-slate-100/90 leading-relaxed">
                  {note.mainContent?.trim() || (
                    <span className="text-slate-500">
                      No main notes recorded for this session yet.
                    </span>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Summary row */}
          <section className="bg-slate-900">
            <div className="px-6 sm:px-8 py-4 border-t border-slate-800/80 bg-slate-900/95">
              <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
                Summary
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                One–paragraph synthesis of the main ideas in your own words.
              </p>
            </div>
            <div className="px-6 sm:px-8 pb-6 pt-4">
              <div className="text-sm whitespace-pre-wrap break-words text-slate-100/90 leading-relaxed">
                {note.summary?.trim() || (
                  <span className="text-slate-500">
                    No summary yet. Summarizing after class is the most powerful
                    part of Cornell notes.
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Tiny footer */}
        <p className="mt-4 text-[11px] text-slate-500 text-center">
          Shared from <span className="font-medium text-slate-300">CornellNotes</span> ·
          organized Cornell-style for better recall.
        </p>
      </main>
    </div>
  );
};

export default SharedNote;
