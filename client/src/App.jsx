
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  Flower2,
  Heart,
  Plus,
  Sparkles,
  Trash2,
  ListTodo,
  BookHeart,
  Target,
  Lightbulb,
  Repeat2,
  Pencil,
  X,
  Save,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";
const API_URL = `${API_BASE}/tasks`;
const GOALS_URL = `${API_BASE}/goals`;
const NOTES_URL = `${API_BASE}/notes`;
const HABITS_URL = `${API_BASE}/habits`;

const PAGES = [
  { id: "daily-planner", label: "Daily planner", icon: CalendarDays },
  { id: "goals", label: "Goals", icon: Target },
  { id: "notes", label: "Notes & Ideas", icon: BookHeart },
  { id: "habits", label: "Habit tracker", icon: Repeat2 },
];

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return dateString;

  return `${day}-${month}-${year}`;
}

function formatTime(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}

function getPriorityClass(priority) {
  return (priority || "Medium").toLowerCase();
}


async function apiRequest(url, options = {}) {
  const token = sessionStorage.getItem("sundayEditToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";

    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}


function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "signup" ? "/signup" : "/login";

      const response = await fetch(
        `http://localhost:5000/api/auth${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(mode === "signup" ? { name: name.trim() } : {}),
            email: email.trim(),
            password,
          }),
        }
      );

      
const responseText = await response.text();

let data;

try {
  data = JSON.parse(responseText);
} catch {
  console.error("Non-JSON response from server:", responseText);
  throw new Error(
    "The server returned HTML instead of JSON. Check the backend route and server."
  );
}

if (!response.ok) {
  throw new Error(data.message || "Authentication failed.");
}


      if (!data.token) {
        throw new Error("The server did not return an authentication token.");
      }

      sessionStorage.setItem("sundayEditToken", data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setError(
        err.message || "Couldn't connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #e7dcf5",
    borderRadius: "12px",
    background: "#fff",
    color: "#493750",
    marginTop: "6px",
    outlineColor: "#ad8fc3",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#fffaf8",
        color: "#493750",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px",
          border: "1px solid #f0e4ef",
          borderRadius: "24px",
          background: "#fff",
          boxShadow: "0 10px 32px rgba(106, 73, 112, 0.07)",
        }}
      >
        <p
          style={{
            color: "#a58ab4",
            fontSize: "11px",
            letterSpacing: "2px",
            fontWeight: "700",
          }}
        >
          YOUR PERSONAL SPACE
        </p>

        <h1
          style={{
            fontFamily: "Georgia, serif",
            color: "#35243F",
            fontSize: "30px",
            fontWeight: "500",
            marginBottom: "8px",
          }}
        >
          The Daily Edit <span style={{ color: "#8e70a5" }}>✿</span>
        </h1>

        <p style={{ color: "#927d9a", marginBottom: "24px" }}>
          A softer way to plan, one day at a time.
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            style={{
              ...inputStyle,
              width: "50%",
              marginTop: 0,
              cursor: "pointer",
              background: mode === "login" ? "#f0e8ff" : "#fff",
            }}
          >
            Log in
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            style={{
              ...inputStyle,
              width: "50%",
              marginTop: 0,
              cursor: "pointer",
              background: mode === "signup" ? "#ffe8ef" : "#fff",
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label style={{ display: "block", marginBottom: "16px" }}>
              Your name
              <input
                style={inputStyle}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </label>
          )}

          <label style={{ display: "block", marginBottom: "16px" }}>
            Email address
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          
<label style={{ display: "block", marginBottom: "18px" }}>
  Password
  <div style={{ position: "relative", marginTop: "6px" }}>
    <input
      style={{
        ...inputStyle,
        width: "100%",
        boxSizing: "border-box",
        paddingRight: "65px",
      }}
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Enter your password"
      autoComplete={
        mode === "signup" ? "new-password" : "current-password"
      }
      minLength={mode === "signup" ? 6 : undefined}
      required
    />

    <button
      type="button"
      onClick={() => setShowPassword((previous) => !previous)}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "transparent",
        color: "#6d547b",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: "600",
      }}
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</label>


          {error && (
            <p
              role="alert"
              style={{
                padding: "10px",
                borderRadius: "10px",
                background: "#fff0f2",
                color: "#a33d5a",
                overflowWrap: "anywhere",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "12px",
              background: "#8e70a5",
              color: "#fff",
              fontWeight: "600",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading
              ? "Please wait..."
              : mode === "signup"
                ? "Create my account"
                : "Welcome back"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "12px",
            color: "#a08da5",
          }}
        >
          Your space, your goals, your little wins.
        </p>
      </section>
    </main>
  );
}


function App() {
    const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = sessionStorage.getItem("sundayEditToken");

      if (!token) {
        if (!cancelled) setAuthLoading(false);
        return;
      }

      try {
        const user = await apiRequest(
          "http://localhost:5000/api/auth/me"
        );

        if (!cancelled) {
          setAuthUser(user.user || user);
        }
      } catch {
        sessionStorage.removeItem("sundayEditToken");

        if (!cancelled) {
          setAuthUser(null);
        }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleAuthSuccess(user) {
    setAuthUser(user);
  }

  function handleLogout() {
    sessionStorage.removeItem("sundayEditToken");
    setAuthUser(null);
  }
  const [activePage, setActivePage] = useState("daily-planner");

  // DAILY PLANNER
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // GOALS
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalError, setGoalError] = useState("");
  const [goalSaving, setGoalSaving] = useState(false);

  // NOTES & IDEAS
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("Personal");
  const [editingNote, setEditingNote] = useState(null);
  const [noteError, setNoteError] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteFilter, setNoteFilter] = useState("All");

  // HABITS
  const [habits, setHabits] = useState([]);
  const [habitsLoading, setHabitsLoading] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");
  const [habitFrequency, setHabitFrequency] = useState("Daily");
  const [habitError, setHabitError] = useState("");
  const [habitSaving, setHabitSaving] = useState(false);


  // LOAD TASKS
  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest(
          `${API_URL}?date=${encodeURIComponent(selectedDate)}`
        );

        if (!cancelled) {
          setTasks(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError(
            "I couldn't connect to your planner. Please check that your backend and MongoDB are running."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedDate, authUser]);

  // LOAD GOALS
  useEffect(() => {
    if (!authUser || activePage !== "goals") return;

    let cancelled = false;

    async function loadGoals() {
      setGoalsLoading(true);
      setGoalError("");

      try {
        const data = await apiRequest(GOALS_URL);
        if (!cancelled) setGoals(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setGoalError("Couldn't load your goals. Check your backend.");
        }
      } finally {
        if (!cancelled) setGoalsLoading(false);
      }
    }

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, [activePage, authUser]);

  // LOAD NOTES
  useEffect(() => {
    if (!authUser || activePage !== "notes") return;

    let cancelled = false;

    async function loadNotes() {
      setNotesLoading(true);
      setNoteError("");

      try {
        const data = await apiRequest(NOTES_URL);
        if (!cancelled) setNotes(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setNoteError("Couldn't load your notes. Check your backend.");
        }
      } finally {
        if (!cancelled) setNotesLoading(false);
      }
    }

    loadNotes();

    return () => {
      cancelled = true;
    };
  }, [activePage, authUser]);

  // LOAD HABITS
  useEffect(() => {
    if (!authUser || activePage !== "habits") return;

    let cancelled = false;

    async function loadHabits() {
      setHabitsLoading(true);
      setHabitError("");

      try {
        const data = await apiRequest(HABITS_URL);
        if (!cancelled) setHabits(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setHabitError("Couldn't load your habits. Check your backend.");
        }
      } finally {
        if (!cancelled) setHabitsLoading(false);
      }
    }

    loadHabits();

    return () => {
      cancelled = true;
    };
  }, [activePage, authUser]);

  // DAILY PLANNER CALCULATIONS
  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const totalCount = tasks.length;

  const completionPercentage =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 100);

  // DAILY PLANNER ACTIONS
  async function addTask(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Give your little task a name first.");
      return;
    }

    setSaving(true);
    setError("");

    const newTask = {
      title: trimmedTitle,
      date: selectedDate,
      priority,
      deadlineDate,
      dueTime,
      completed: false,
      isTopThree: false,
    };

    try {
      const savedTask = await apiRequest(API_URL, {
        method: "POST",
        body: JSON.stringify(newTask),
      });

      if (savedTask && savedTask.date === selectedDate) {
        setTasks((currentTasks) => [...currentTasks, savedTask]);
      } else {
        const data = await apiRequest(
          `${API_URL}?date=${encodeURIComponent(selectedDate)}`
        );
        setTasks(Array.isArray(data) ? data : []);
      }

      setTitle("");
      setPriority("Medium");
      setDeadlineDate("");
      setDueTime("");
    } catch (err) {
      setError(err.message || "Your task couldn't be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");

    const updatedTask = {
      ...task,
      completed: !task.completed,
    };

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item._id === task._id ? updatedTask : item
      )
    );

    try {
      await apiRequest(`${API_URL}/${task._id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: updatedTask.completed }),
      });
    } catch {
      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? task : item
        )
      );
      setError("Couldn't update that task. Please try again.");
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Would you like to remove this task from your list?")) {
      return;
    }

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task._id !== taskId)
    );
    setError("");

    try {
      await apiRequest(`${API_URL}/${taskId}`, { method: "DELETE" });
    } catch {
      setTasks(previousTasks);
      setError("Couldn't delete that task. Please try again.");
    }
  }

  // GOALS ACTIONS
  function resetGoalForm() {
    setGoalTitle("");
    setGoalDescription("");
    setGoalTargetDate("");
    setGoalProgress(0);
    setEditingGoal(null);
  }

  function startEditingGoal(goal) {
    setEditingGoal(goal);
    setGoalTitle(goal.title || "");
    setGoalDescription(goal.description || "");
    setGoalTargetDate(goal.targetDate || "");
    setGoalProgress(Number(goal.progress) || 0);
    setGoalError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveGoal(event) {
    event.preventDefault();

    if (!goalTitle.trim()) {
      setGoalError("Please give your goal a title.");
      return;
    }

    setGoalSaving(true);
    setGoalError("");

    const payload = {
      title: goalTitle.trim(),
      description: goalDescription.trim(),
      targetDate: goalTargetDate,
      progress: Number(goalProgress),
      completed: Number(goalProgress) === 100,
    };

    try {
      if (editingGoal) {
        const updated = await apiRequest(
          `${GOALS_URL}/${editingGoal._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setGoals((current) =>
          current.map((goal) =>
            goal._id === editingGoal._id
              ? { ...goal, ...payload, ...(updated || {}) }
              : goal
          )
        );
      } else {
        const created = await apiRequest(GOALS_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (created) {
          setGoals((current) => [created, ...current]);
        } else {
          setGoals(await apiRequest(GOALS_URL));
        }
      }

      resetGoalForm();
    } catch (err) {
      setGoalError(err.message || "Couldn't save this goal.");
    } finally {
      setGoalSaving(false);
    }
  }

  async function deleteGoal(goalId) {
    if (!window.confirm("Would you like to delete this goal?")) return;

    const previous = goals;
    setGoals((current) => current.filter((goal) => goal._id !== goalId));
    setGoalError("");

    try {
      await apiRequest(`${GOALS_URL}/${goalId}`, { method: "DELETE" });
      if (editingGoal?._id === goalId) resetGoalForm();
    } catch (err) {
      setGoals(previous);
      setGoalError(err.message || "Couldn't delete this goal.");
    }
  }

  async function changeGoalProgress(goal, value) {
    const progress = Math.max(0, Math.min(100, Number(value)));

    const payload = {
      progress,
      completed: progress === 100,
    };

    const previous = goals;

    setGoals((current) =>
      current.map((item) =>
        item._id === goal._id ? { ...item, ...payload } : item
      )
    );

    try {
      await apiRequest(`${GOALS_URL}/${goal._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch (err) {
      setGoals(previous);
      setGoalError(err.message || "Couldn't update goal progress.");
    }
  }

  // NOTES ACTIONS
  function resetNoteForm() {
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("Personal");
    setEditingNote(null);
  }

  function startEditingNote(note) {
    setEditingNote(note);
    setNoteTitle(note.title || "");
    setNoteContent(note.content || "");
    setNoteCategory(note.category || "Personal");
    setNoteError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveNote(event) {
    event.preventDefault();

    if (!noteTitle.trim()) {
      setNoteError("Please give your note a title.");
      return;
    }

    setNoteSaving(true);
    setNoteError("");

    const payload = {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
    };

    try {
      if (editingNote) {
        const updated = await apiRequest(
          `${NOTES_URL}/${editingNote._id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        setNotes((current) =>
          current.map((note) =>
            note._id === editingNote._id
              ? { ...note, ...payload, ...(updated || {}) }
              : note
          )
        );
      } else {
        const created = await apiRequest(NOTES_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (created) {
          setNotes((current) => [created, ...current]);
        } else {
          setNotes(await apiRequest(NOTES_URL));
        }
      }

      resetNoteForm();
    } catch (err) {
      setNoteError(err.message || "Couldn't save this note.");
    } finally {
      setNoteSaving(false);
    }
  }

  async function deleteNote(noteId) {
    if (!window.confirm("Would you like to delete this note?")) return;

    const previous = notes;
    setNotes((current) => current.filter((note) => note._id !== noteId));
    setNoteError("");

    try {
      await apiRequest(`${NOTES_URL}/${noteId}`, { method: "DELETE" });
      if (editingNote?._id === noteId) resetNoteForm();
    } catch (err) {
      setNotes(previous);
      setNoteError(err.message || "Couldn't delete this note.");
    }
  }

  // HABITS ACTIONS
  async function addHabit(event) {
    event.preventDefault();

    if (!habitName.trim()) {
      setHabitError("Please give your habit a name.");
      return;
    }

    setHabitSaving(true);
    setHabitError("");

    const payload = {
      name: habitName.trim(),
      description: habitDescription.trim(),
      frequency: habitFrequency,
      completedDates: [],
    };

    try {
      const created = await apiRequest(HABITS_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (created) {
        setHabits((current) => [created, ...current]);
      } else {
        setHabits(await apiRequest(HABITS_URL));
      }

      setHabitName("");
      setHabitDescription("");
      setHabitFrequency("Daily");
    } catch (err) {
      setHabitError(err.message || "Couldn't save this habit.");
    } finally {
      setHabitSaving(false);
    }
  }

  async function toggleHabit(habit) {
    const completedDates = Array.isArray(habit.completedDates)
      ? habit.completedDates
      : [];

    const today = getLocalDate();
    const alreadyCompleted = completedDates.includes(today);

    const updatedDates = alreadyCompleted
      ? completedDates.filter((date) => date !== today)
      : [...completedDates, today];

    const updatedHabit = {
      ...habit,
      completedDates: updatedDates,
    };

    const previous = habits;

    setHabits((current) =>
      current.map((item) =>
        item._id === habit._id ? updatedHabit : item
      )
    );
    setHabitError("");

    try {
      await apiRequest(`${HABITS_URL}/${habit._id}`, {
        method: "PUT",
        body: JSON.stringify({ completedDates: updatedDates }),
      });
    } catch (err) {
      setHabits(previous);
      setHabitError(
        err.message ||
          "Couldn't update this habit. Check that your backend accepts completedDates."
      );
    }
  }

  async function deleteHabit(habitId) {
    if (!window.confirm("Would you like to delete this habit?")) return;

    const previous = habits;
    setHabits((current) => current.filter((habit) => habit._id !== habitId));
    setHabitError("");

    try {
      await apiRequest(`${HABITS_URL}/${habitId}`, { method: "DELETE" });
    } catch (err) {
      setHabits(previous);
      setHabitError(err.message || "Couldn't delete this habit.");
    }
  }

  const completedHabitsToday = habits.filter((habit) =>
    Array.isArray(habit.completedDates)
      ? habit.completedDates.includes(getLocalDate())
      : false
  ).length;

  const filteredNotes =
    noteFilter === "All"
      ? notes
      : notes.filter((note) => note.category === noteFilter);

  const noteCategories = [
    "Personal",
    "Work",
    "Study",
    "Ideas",
    "Other",
  ];

  function navigate(page) {
    setActivePage(page);
    window.history.replaceState(null, "", `#${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (PAGES.some((page) => page.id === hash)) {
      setActivePage(hash);
    }
  }, []);

    if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fffaf8",
          color: "#493750",
        }}
      >
        Checking your session...
      </div>
    );
  }

  if (!authUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

 
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-area">
          <div className="brand-flower" aria-hidden="true">
            <Sparkles size={27} strokeWidth={1.7} />
          </div>

          <h1 className="brand">The Daily Edit</h1>
          <p className="brand-tagline">A softer way to plan.</p>
          <p className="brand-caption">
            Make room for <em>what matters.</em>
          </p>
        </div>

        <p className="sidebar-label">YOUR SPACE</p>

        <nav className="sidebar-nav">
          {PAGES.map((page) => {
            const Icon = page.icon;

            return (
              <button
                key={page.id}
                type="button"
                className={`nav-item ${
                  activePage === page.id ? "active" : ""
                }`}
                onClick={() => navigate(page.id)}
              >
                <Icon size={20} />
                <span>{page.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="side-note">
          <Flower2 size={26} strokeWidth={1.7} />
          <p>Small steps still move you forward.</p>
          <span aria-hidden="true">✿</span>
        </div>

        <div className="sidebar-footer">
          <span>♡</span> Made with intention
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">YOUR PERSONAL SPACE</p>
            <p className="topbar-note">
              A little space for everything that matters.
            </p>
          </div>

          <div className="today-date">
            <CalendarDays size={16} />
            <span>{formatDate(getLocalDate())}</span>
          </div>
        </header>

        {activePage === "daily-planner" && (
          <>
            <section className="hero">
              <p className="hero-eyebrow">A FRESH PAGE, JUST FOR YOU</p>
              <h2 className="hero-title">
                Make room for <em>what matters.</em>
              </h2>
              <p className="hero-subtitle">
                One day at a time. One little win at a time.
              </p>
            </section>

            <section className="stats-grid" aria-label="Daily progress">
              <article className="stat-card stat-pink">
                <div className="stat-icon">
                  <ListTodo size={20} />
                </div>
                <p className="stat-label">Today's tasks</p>
                <p className="stat-number">{totalCount}</p>
                <p className="stat-description">
                  Things you want to make time for
                </p>
              </article>

              <article className="stat-card stat-lavender">
                <div className="stat-icon">
                  <Heart size={20} />
                </div>
                <p className="stat-label">Little wins</p>
                <p className="stat-number">
                  {completedCount} / {totalCount}
                </p>
                <p className="stat-description">
                  {completionPercentage}% of your tasks completed
                </p>
              </article>
            </section>

            <section className="planner-card" id="daily-planner">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">YOUR DAY</p>
                  <h2>Daily tasks</h2>
                  <p className="section-subtitle">
                    A gentle plan, one task at a time.
                  </p>
                </div>

                <label className="date-field">
                  <span>Planning for</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    aria-label="Choose planning date"
                  />
                </label>
              </div>

              <form className="task-form" onSubmit={addTask}>
                <input
                  className="task-title-input"
                  type="text"
                  placeholder="Add a little task..."
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={150}
                  aria-label="Task name"
                  required
                />

                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                  aria-label="Task priority"
                >
                  <option value="Low">Low priority</option>
                  <option value="Medium">Medium priority</option>
                  <option value="High">High priority</option>
                </select>

                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(event) => setDeadlineDate(event.target.value)}
                  aria-label="Task deadline date"
                  title="Optional deadline date"
                />

                <input
                  type="time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  aria-label="Task deadline time"
                  title="Optional deadline time"
                />

                <button
                  className="add-task-button"
                  type="submit"
                  disabled={saving}
                >
                  <Plus size={19} />
                  <span>{saving ? "Adding..." : "Add task"}</span>
                </button>
              </form>

              <p className="form-hint">
                Deadlines are optional. Your day doesn't have to be perfect.
              </p>

              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              <div className="task-list">
                {loading ? (
                  <div className="empty-state">
                    <Sparkles className="loading-icon" size={27} />
                    <h3>Preparing your page...</h3>
                    <p>Just a little moment.</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-flower" aria-hidden="true">
                      ✿
                    </span>
                    <h3>A fresh page awaits</h3>
                    <p>
                      Add a task above and make a little room for what matters.
                    </p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <article
                      className={`task-row ${
                        task.completed ? "completed" : ""
                      }`}
                      key={task._id}
                    >
                      <button
                        type="button"
                        className={`check-button ${
                          task.completed ? "checked" : ""
                        }`}
                        onClick={() => toggleTask(task)}
                        aria-label={
                          task.completed
                            ? `Mark ${task.title} as incomplete`
                            : `Mark ${task.title} as complete`
                        }
                        title={
                          task.completed
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      >
                        {task.completed && <Check size={18} />}
                      </button>

                      <div className="task-main">
                        <p className="task-title">{task.title}</p>

                        {(task.deadlineDate || task.dueTime) && (
                          <p className="task-deadline">
                            <Clock3 size={14} />
                            <span>
                              {task.deadlineDate
                                ? `Due: ${formatDate(task.deadlineDate)}`
                                : "Deadline"}
                              {task.dueTime
                                ? ` at ${formatTime(task.dueTime)}`
                                : ""}
                            </span>
                          </p>
                        )}
                      </div>

                      <span
                        className={`priority-pill ${getPriorityClass(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Medium"}
                      </span>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteTask(task._id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))
                )}
              </div>

              {!loading && tasks.length > 0 && (
                <div className="planner-bottom">
                  <span>
                    {completedCount === totalCount
                      ? "You've made it through your list. Well done! ♡"
                      : `${totalCount - completedCount} little ${
                          totalCount - completedCount === 1
                            ? "thing"
                            : "things"
                        } left to do`}
                  </span>
                  <span>{completionPercentage}% complete</span>
                </div>
              )}
            </section>
          </>
        )}

        {activePage === "goals" && (
          <>
            <section className="hero">
              <p className="hero-eyebrow">DREAM A LITTLE BIGGER</p>
              <h2 className="hero-title">
                Little steps, <em>big dreams.</em>
              </h2>
              <p className="hero-subtitle">
                Give your goals a place to grow.
              </p>
            </section>

            <section className="planner-card feature-card">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">YOUR NEXT CHAPTER</p>
                  <h2>{editingGoal ? "Edit your goal" : "Plant a new goal"}</h2>
                  <p className="section-subtitle">
                    Every big achievement starts somewhere.
                  </p>
                </div>
                <Target size={30} />
              </div>

              <form className="feature-form" onSubmit={saveGoal}>
                <label>
                  Goal title
                  <input
                    value={goalTitle}
                    onChange={(event) => setGoalTitle(event.target.value)}
                    placeholder="e.g. Learn a new skill"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={goalDescription}
                    onChange={(event) =>
                      setGoalDescription(event.target.value)
                    }
                    placeholder="What does this goal mean to you?"
                    rows={3}
                  />
                </label>

                <label>
                  Target date
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(event) => setGoalTargetDate(event.target.value)}
                  />
                </label>

                {editingGoal && (
                  <label>
                    Progress: {goalProgress}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={goalProgress}
                      onChange={(event) =>
                        setGoalProgress(Number(event.target.value))
                      }
                    />
                  </label>
                )}

                {goalError && (
                  <div className="error-message" role="alert">
                    {goalError}
                  </div>
                )}

                <div className="feature-actions">
                  <button
                    className="add-task-button"
                    type="submit"
                    disabled={goalSaving}
                  >
                    <Save size={17} />
                    {goalSaving
                      ? "Saving..."
                      : editingGoal
                      ? "Save changes"
                      : "Add goal"}
                  </button>

                  {editingGoal && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={resetGoalForm}
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="feature-list-section">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">IN PROGRESS</p>
                  <h2>Your goals</h2>
                </div>
                <span className="feature-count">{goals.length} goals</span>
              </div>

              {goalsLoading ? (
                <div className="empty-state">
                  <Sparkles size={27} />
                  <h3>Gathering your goals...</h3>
                </div>
              ) : goals.length === 0 ? (
                <div className="empty-state feature-empty">
                  <span className="empty-flower">✿</span>
                  <h3>Your next chapter starts here</h3>
                  <p>Add your first goal and watch your progress grow.</p>
                </div>
              ) : (
                <div className="feature-grid">
                  {goals.map((goal) => (
                    <article className="feature-item goal-item" key={goal._id}>
                      <div className="feature-item-top">
                        <span className="feature-item-icon">
                          <Target size={20} />
                        </span>
                        <div className="item-actions">
                          <button
                            className="icon-action"
                            type="button"
                            onClick={() => startEditingGoal(goal)}
                            title="Edit goal"
                            aria-label="Edit goal"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-action delete-action"
                            type="button"
                            onClick={() => deleteGoal(goal._id)}
                            title="Delete goal"
                            aria-label="Delete goal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3>{goal.title}</h3>
                      {goal.description && <p>{goal.description}</p>}

                      {goal.targetDate && (
                        <span className="item-meta">
                          <CalendarDays size={14} />
                          Target: {formatDate(goal.targetDate)}
                        </span>
                      )}

                      <div className="progress-heading">
                        <span>Your progress</span>
                        <strong>{Number(goal.progress) || 0}%</strong>
                      </div>

                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-valuenow={Number(goal.progress) || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`${goal.title} progress`}
                      >
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, Number(goal.progress) || 0)
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="goal-progress-actions">
                        <button
                          type="button"
                          onClick={() =>
                            changeGoalProgress(
                              goal,
                              (Number(goal.progress) || 0) - 10
                            )
                          }
                          disabled={(Number(goal.progress) || 0) <= 0}
                          aria-label="Decrease progress"
                        >
                          −
                        </button>
                        <span>
                          {goal.completed ? "Goal complete ♡" : "Keep growing"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            changeGoalProgress(
                              goal,
                              (Number(goal.progress) || 0) + 10
                            )
                          }
                          disabled={(Number(goal.progress) || 0) >= 100}
                          aria-label="Increase progress"
                        >
                          +
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activePage === "notes" && (
          <>
            <section className="hero">
              <p className="hero-eyebrow">A HOME FOR YOUR THOUGHTS</p>
              <h2 className="hero-title">
                Collect your <em>little ideas.</em>
              </h2>
              <p className="hero-subtitle">
                Thoughts, plans, and everything in between.
              </p>
            </section>

            <section className="planner-card feature-card">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">YOUR NOTEBOOK</p>
                  <h2>{editingNote ? "Edit your note" : "Capture a thought"}</h2>
                  <p className="section-subtitle">
                    No thought is too small to save.
                  </p>
                </div>
                <Lightbulb size={30} />
              </div>

              <form className="feature-form" onSubmit={saveNote}>
                <label>
                  Note title
                  <input
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Give this thought a name..."
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Category
                  <select
                    value={noteCategory}
                    onChange={(event) => setNoteCategory(event.target.value)}
                  >
                    {noteCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Your thoughts
                  <textarea
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    placeholder="Write anything you want to remember..."
                    rows={5}
                  />
                </label>

                {noteError && (
                  <div className="error-message" role="alert">
                    {noteError}
                  </div>
                )}

                <div className="feature-actions">
                  <button
                    className="add-task-button"
                    type="submit"
                    disabled={noteSaving}
                  >
                    <Plus size={18} />
                    {noteSaving
                      ? "Saving..."
                      : editingNote
                      ? "Save changes"
                      : "Save note"}
                  </button>

                  {editingNote && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={resetNoteForm}
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="feature-list-section">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">SAVED THOUGHTS</p>
                  <h2>Notes & Ideas</h2>
                </div>
                <span className="feature-count">{notes.length} notes</span>
              </div>

              <div className="filter-row">
                {["All", ...noteCategories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`filter-chip ${
                      noteFilter === category ? "selected" : ""
                    }`}
                    onClick={() => setNoteFilter(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {notesLoading ? (
                <div className="empty-state">
                  <Sparkles size={27} />
                  <h3>Opening your notebook...</h3>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="empty-state feature-empty">
                  <span className="empty-flower">✿</span>
                  <h3>A little space for a big idea</h3>
                  <p>
                    {notes.length === 0
                      ? "Save your first thought using the form above."
                      : "No notes in this category yet."}
                  </p>
                </div>
              ) : (
                <div className="feature-grid notes-grid">
                  {filteredNotes.map((note) => (
                    <article className="feature-item note-item" key={note._id}>
                      <div className="feature-item-top">
                        <span className="category-pill">
                          {note.category || "Personal"}
                        </span>
                        <div className="item-actions">
                          <button
                            className="icon-action"
                            type="button"
                            onClick={() => startEditingNote(note)}
                            title="Edit note"
                            aria-label="Edit note"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="icon-action delete-action"
                            type="button"
                            onClick={() => deleteNote(note._id)}
                            title="Delete note"
                            aria-label="Delete note"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3>{note.title}</h3>
                      <p className="note-content">
                        {note.content || "A thought worth keeping."}
                      </p>

                      {note.createdAt && (
                        <span className="item-meta">
                          <Clock3 size={14} />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activePage === "habits" && (
          <>
            <section className="hero">
              <p className="hero-eyebrow">SHOW UP FOR YOURSELF</p>
              <h2 className="hero-title">
                Little rituals, <em>lovely progress.</em>
              </h2>
              <p className="hero-subtitle">
                Consistency over perfection, always.
              </p>
            </section>

            <section className="stats-grid" aria-label="Habit progress">
              <article className="stat-card stat-pink">
                <div className="stat-icon">
                  <Repeat2 size={20} />
                </div>
                <p className="stat-label">Your habits</p>
                <p className="stat-number">{habits.length}</p>
                <p className="stat-description">Little rituals you're building</p>
              </article>

              <article className="stat-card stat-lavender">
                <div className="stat-icon">
                  <Heart size={20} />
                </div>
                <p className="stat-label">Today's wins</p>
                <p className="stat-number">
                  {completedHabitsToday} / {habits.length}
                </p>
                <p className="stat-description">
                  Habits you've checked off today
                </p>
              </article>
            </section>

            <section className="planner-card feature-card">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">BUILD YOUR ROUTINE</p>
                  <h2>Add a habit</h2>
                  <p className="section-subtitle">
                    Start small. Let the little things add up.
                  </p>
                </div>
                <Repeat2 size={30} />
              </div>

              <form className="feature-form" onSubmit={addHabit}>
                <label>
                  Habit name
                  <input
                    value={habitName}
                    onChange={(event) => setHabitName(event.target.value)}
                    placeholder="e.g. Read for 15 minutes"
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Description (optional)
                  <textarea
                    value={habitDescription}
                    onChange={(event) =>
                      setHabitDescription(event.target.value)
                    }
                    placeholder="What will this habit help you with?"
                    rows={3}
                  />
                </label>

                <label>
                  Frequency
                  <select
                    value={habitFrequency}
                    onChange={(event) => setHabitFrequency(event.target.value)}
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </label>

                {habitError && (
                  <div className="error-message" role="alert">
                    {habitError}
                  </div>
                )}

                <button
                  className="add-task-button"
                  type="submit"
                  disabled={habitSaving}
                >
                  <Plus size={18} />
                  {habitSaving ? "Adding..." : "Add habit"}
                </button>
              </form>
            </section>

            <section className="feature-list-section">
              <div className="section-heading">
                <div>
                  <p className="section-eyebrow">ONE DAY AT A TIME</p>
                  <h2>Your habits</h2>
                </div>
                <span className="feature-count">
                  {completedHabitsToday} of {habits.length} done today
                </span>
              </div>

              {habitsLoading ? (
                <div className="empty-state">
                  <Sparkles size={27} />
                  <h3>Getting your habits ready...</h3>
                </div>
              ) : habits.length === 0 ? (
                <div className="empty-state feature-empty">
                  <span className="empty-flower">✿</span>
                  <h3>Your routine starts with one little thing</h3>
                  <p>Add a habit above to begin tracking your progress.</p>
                </div>
              ) : (
                <div className="habit-list">
                  {habits.map((habit) => {
                    const isDone = Array.isArray(habit.completedDates)
                      ? habit.completedDates.includes(getLocalDate())
                      : false;

                    const daysDone = Array.isArray(habit.completedDates)
                      ? habit.completedDates.length
                      : 0;

                    return (
                      <article
                        className={`habit-row ${isDone ? "habit-done" : ""}`}
                        key={habit._id}
                      >
                        <button
                          type="button"
                          className={`check-button ${
                            isDone ? "checked" : ""
                          }`}
                          onClick={() => toggleHabit(habit)}
                          aria-label={
                            isDone
                              ? `Unmark ${habit.name} for today`
                              : `Mark ${habit.name} complete for today`
                          }
                          title={isDone ? "Undo today's completion" : "Done today"}
                        >
                          {isDone && <Check size={18} />}
                        </button>

                        <div className="habit-main">
                          <h3>{habit.name}</h3>
                          {habit.description && <p>{habit.description}</p>}
                          <div className="habit-meta">
                            <span className="category-pill">
                              {habit.frequency || "Daily"}
                            </span>
                            <span className="item-meta">
                              <Heart size={13} />
                              {daysDone} {daysDone === 1 ? "day" : "days"} completed
                            </span>
                          </div>
                        </div>

                        <span className="habit-status">
                          {isDone ? "Done for today ♡" : "You've got this"}
                        </span>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteHabit(habit._id)}
                          aria-label={`Delete ${habit.name}`}
                          title="Delete habit"
                        >
                          <Trash2 size={17} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        <footer className="page-footer">
          <span>Just for you</span>
          <Heart size={13} />
        </footer>
      </main>
    </div>
  );
}

export default App;
