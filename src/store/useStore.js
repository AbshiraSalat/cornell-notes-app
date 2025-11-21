import { create } from 'zustand';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useStore = create((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),
  
  // Theme state
  theme: localStorage.getItem('theme') || 'minimal',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  // Classes state
  classes: [],
  setClasses: (classes) => set({ classes }),
  
  addClass: async (newClass) => {
    try {
      const user = get().user;
      if (!user) throw new Error('No user logged in');

      // Remove the local ID - Firebase will generate one
      const { id, ...classData } = newClass;

      const docRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });

      const classWithId = { ...classData, id: docRef.id };
      set((state) => ({ classes: [...state.classes, classWithId] }));
      return classWithId;
    } catch (error) {
      console.error('Error adding class:', error);
      throw error;
    }
  },
  
  updateClass: async (id, updates) => {
    try {
      const classRef = doc(db, 'classes', id);
      await updateDoc(classRef, updates);
      set((state) => ({
        classes: state.classes.map(c => c.id === id ? { ...c, ...updates } : c)
      }));
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },
  
  deleteClass: async (id) => {
    try {
      await deleteDoc(doc(db, 'classes', id));
      set((state) => ({
        classes: state.classes.filter(c => c.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  loadClasses: async () => {
    try {
      const user = get().user;
      if (!user) return;

      const q = query(collection(db, 'classes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const classes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ classes });
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  },

  // Notes state
  notes: [],
  setNotes: (notes) => set({ notes }),
  
  addNote: async (note) => {
    try {
      const user = get().user;
      if (!user) throw new Error('No user logged in');

      const docRef = await addDoc(collection(db, 'notes'), {
        ...note,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const noteWithId = { ...note, id: docRef.id };
      set((state) => ({ notes: [noteWithId, ...state.notes] }));
      
      // IMPORTANT: Return the note with ID
      return noteWithId;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },
  
  updateNote: async (id, updates) => {
    try {
      const noteRef = doc(db, 'notes', id);
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(noteRef, updateData);
      set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updateData } : n)
      }));
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },
  
  deleteNote: async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },
  
  pinNote: async (id) => {
    try {
      const note = get().notes.find(n => n.id === id);
      if (!note) return;

      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, { pinned: !note.pinned });
      set((state) => ({
        notes: state.notes.map(n => 
          n.id === id ? { ...n, pinned: !n.pinned } : n
        )
      }));
    } catch (error) {
      console.error('Error pinning note:', error);
      throw error;
    }
  },

  loadNotes: async () => {
    try {
      const user = get().user;
      if (!user) return;

      const q = query(collection(db, 'notes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const notes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ notes });
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  },

  // Templates - 6 Enhanced Subject Templates
  templates: [
    {
      id: 'physics',
      name: 'Physics',
      icon: '⚡',
      description: 'Designed for laws, equations, problem-solving steps, and conceptual understanding. Emphasizes variables, units, and diagram sketches.',
      structure: {
        questions: "• What physical principle applies?\n• Key equation(s)?\n• What are the knowns/unknowns?\n• Units and dimensions?\n• How to approach the problem?",
        main: "## Physical Principle\n\n## Key Equations\n- **Formula 1**: F = ma\n- **Formula 2**: E = mc²\n\n## Variables Defined\n| Symbol | Meaning | Units |\n|--------|---------|-------|\n| F | Force | N |\n| m | mass | kg |\n\n## Problem-Solving Steps\n1. Identify given values\n2. Choose appropriate equation\n3. Solve for unknown\n4. Check units\n5. Verify answer makes physical sense\n\n## Diagram\n[Draw force diagram, circuit, or system sketch]\n\n## Conceptual Notes\n- This relates to... because...",
        summary: "State the core physics concept and how the equation models real-world behavior."
      }
    },
    {
      id: 'biology',
      name: 'Biology',
      icon: '🧬',
      description: 'Optimized for biological processes, vocabulary, systems, and relationships. Emphasizes categorization, cycles, and visual diagram references.',
      structure: {
        questions: "• What is the main process/system?\n• Key vocabulary terms?\n• How do components interact?\n• What are the inputs/outputs?\n• Clinical or ecological relevance?",
        main: "## Main Concept\n\n## Vocabulary & Definitions\n- **Term**: definition\n- **Term**: definition\n\n## Process/Cycle\n1. Step one\n2. Step two\n3. Step three\n\n## Diagram Reference\n[Sketch or describe diagram here]\n\n## Related Systems\n- System A → connects to...\n- System B → affects...\n\n## Examples\n- Example organism/cell/tissue",
        summary: "In 2-3 sentences, explain the core biological principle and its significance in living systems."
      }
    },
    {
      id: 'software',
      name: 'Software Engineering',
      icon: '💻',
      description: 'Built for design patterns, architecture, system design, and best practices. Emphasizes structure, scalability, and maintainability.',
      structure: {
        questions: "• What pattern/architecture?\n• Problem it solves?\n• When to use it?\n• Trade-offs?\n• Implementation considerations?",
        main: "## Design Pattern/Architecture\n\n## Problem & Context\n- Problem: \n- Context where it applies:\n\n## Structure/Components\n- **Component A**: Responsibility\n- **Component B**: Responsibility\n- **Component C**: Responsibility\n\n## How It Works\n1. Client interacts with...\n2. Component delegates to...\n3. Result is...\n\n## Code Example (Pseudocode)\n```\nclass PatternName:\n    // structure\n```\n\n## Advantages\n- Pro 1\n- Pro 2\n\n## Disadvantages\n- Con 1\n- Con 2\n\n## When to Use\n- Use when:\n- Avoid when:\n\n## Related Patterns\n- Similar to:\n- Differs from:",
        summary: "Explain the design pattern's intent and how it improves software quality and maintainability."
      }
    },
    {
      id: 'statistics',
      name: 'Statistics',
      icon: '📊',
      description: 'Built for hypothesis testing, distributions, data analysis, and probability. Emphasizes test selection, assumptions, and interpretation.',
      structure: {
        questions: "• What statistical test to use?\n• What are the hypotheses?\n• Assumptions met?\n• What does the result mean?\n• p-value interpretation?",
        main: "## Research Question\n\n## Hypotheses\n- **H₀** (Null): \n- **H₁** (Alternative): \n\n## Test Selection\n- [ ] t-test\n- [ ] ANOVA\n- [ ] Chi-square\n- [ ] Regression\n- [ ] Correlation\n\n## Assumptions\n1. Independence\n2. Normality\n3. Equal variance\n4. Random sampling\n\n## Key Formulas\n- Mean: x̄ = Σx/n\n- Standard Deviation: s = √[Σ(x-x̄)²/(n-1)]\n- Test Statistic: \n\n## Results\n- Test statistic value:\n- p-value:\n- Confidence interval:\n\n## Interpretation\n- Reject/Fail to reject H₀\n- Practical significance:",
        summary: "State the statistical conclusion and what it reveals about the research question."
      }
    },
    {
      id: 'history',
      name: 'History',
      icon: '📜',
      description: 'Focused on timelines, events, causes/effects, and historical interpretation. Emphasizes chronology, key figures, and evidence-based arguments.',
      structure: {
        questions: "• What happened and when?\n• Who were the key figures?\n• What caused this event?\n• What were the consequences?\n• Different historical interpretations?",
        main: "## Event/Period\n\n## Timeline\n- **Date**: Event\n- **Date**: Event\n- **Date**: Event\n\n## Key Figures\n- **Name**: Role/Actions\n- **Name**: Role/Actions\n\n## Causes (Long-term & Immediate)\n### Long-term\n- Cause 1\n- Cause 2\n\n### Immediate/Trigger\n- Event that sparked...\n\n## Major Events/Turning Points\n1. Event: Significance\n2. Event: Significance\n\n## Consequences/Effects\n- Political:\n- Economic:\n- Social:\n- Cultural:\n\n## Historical Interpretations\n- Historian A argues:\n- Historian B argues:\n\n## Primary Sources\n- Document/Quote:",
        summary: "Explain the historical significance of this event and how it shaped subsequent developments."
      }
    },
    {
      id: 'literature',
      name: 'Literature',
      icon: '📚',
      description: 'Optimized for themes, literary devices, character analysis, and textual evidence. Emphasizes close reading and interpretation.',
      structure: {
        questions: "• What are the main themes?\n• Key literary devices used?\n• Character motivations?\n• What is the author's purpose?\n• Textual evidence?",
        main: "## Text Information\n- **Title**: \n- **Author**: \n- **Genre/Period**: \n\n## Main Themes\n1. Theme 1: How it develops\n2. Theme 2: How it develops\n\n## Characters\n- **Name**: Traits, Arc, Significance\n- **Name**: Traits, Arc, Significance\n\n## Literary Devices\n- **Device**: Example from text\n- **Device**: Example from text\n\n## Key Quotes\n- \"Quote\" (page #): Analysis\n- \"Quote\" (page #): Analysis\n\n## Plot/Structure\n- Exposition:\n- Rising Action:\n- Climax:\n- Resolution:\n\n## Author's Purpose/Message\n- What the author is saying about...\n\n## Historical/Cultural Context\n- Relevant background:",
        summary: "Synthesize the main themes and explain what the text reveals about human nature or society."
      }
    },
  ],

  // Current note being edited
  currentNote: null,
  setCurrentNote: (note) => set({ currentNote: note }),

  // UI state
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Search state
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Filtered notes based on search
  getFilteredNotes: () => {
    const { notes, searchQuery } = get();
    if (!searchQuery) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title?.toLowerCase().includes(query) ||
      note.tags?.some(tag => tag.toLowerCase().includes(query)) ||
      note.questions?.toLowerCase().includes(query) ||
      note.mainContent?.toLowerCase().includes(query) ||
      note.summary?.toLowerCase().includes(query)
    );
  },
}));
