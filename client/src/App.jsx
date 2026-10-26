
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
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

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

function App() {
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}?date=${encodeURIComponent(selectedDate)}`
        );

        if (!response.ok) {
          throw new Error("Could not load your tasks.");
        }

        const data = await response.json();

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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const totalCount = tasks.length;

  const completionPercentage =
    totalCount === 0
      ? 0
      : Math.round((completedCount / totalCount) * 100);

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
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Could not save your task.");
      }

      const savedTask = await response.json();

      if (savedTask.date === selectedDate) {
        setTasks((currentTasks) => [...currentTasks, savedTask]);
      }

      setTitle("");
      setPriority("Medium");
      setDeadlineDate("");
      setDueTime("");
    } catch {
      setError(
        "Your task couldn't be saved. Please check that the backend is running and try again."
      );
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
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: updatedTask.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Update failed.");
      }
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
    const confirmed = window.confirm(
      "Would you like to remove this task from your list?"
    );

    if (!confirmed) return;

    const previousTasks = tasks;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task._id !== taskId)
    );
    setError("");

    try {
      const response = await fetch(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed.");
      }
    } catch {
      setTasks(previousTasks);
      setError("Couldn't delete that task. Please try again.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-area">
          <div className="brand-flower" aria-hidden="true">
            <Sparkles size={27} strokeWidth={1.7} />
          </div>

          <h1 className="brand">The Sunday Edit</h1>

          <p className="brand-tagline">A softer way to plan.</p>

          <p className="brand-caption">
            Make room for <em>what matters.</em>
          </p>
        </div>

        <p className="sidebar-label">YOUR SPACE</p>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="#daily-planner">
            <CalendarDays size={20} />
            <span>Daily planner</span>
          </a>
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

        <section className="hero">
          <p className="hero-eyebrow">
            A FRESH PAGE, JUST FOR YOU
          </p>

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
                  className={`task-row ${task.completed ? "completed" : ""}`}
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
                      totalCount - completedCount === 1 ? "thing" : "things"
                    } left to do`}
              </span>

              <span>{completionPercentage}% complete</span>
            </div>
          )}
        </section>

        <footer className="page-footer">
          <span>Just for you</span>
          <Heart size={13} />
        </footer>
      </main>
    </div>
  );
}

export default App;
