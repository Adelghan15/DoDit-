import { useState, useEffect } from "react";

const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_COLORS = {
  High: { bg: "#FEE2E2", text: "#B91C1C" },
  Medium: { bg: "#FEF9C3", text: "#92400E" },
  Low: { bg: "#DCFCE7", text: "#166534" },
};

const TIMES = ["Morning", "Afternoon", "Evening", "No time"];

function getToday() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

const SAMPLE_TASKS = [
  { id: 1, text: "Review project proposal", priority: "High", time: "Morning", done: false },
  { id: 2, text: "Reply to emails", priority: "Medium", time: "Morning", done: false },
  { id: 3, text: "Go for a 30-min walk", priority: "Low", time: "Afternoon", done: true },
  { id: 4, text: "Read for 20 minutes", priority: "Low", time: "Evening", done: false },
];

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("dodit-tasks");
      return saved ? JSON.parse(saved) : SAMPLE_TASKS;
    } catch {
      return SAMPLE_TASKS;
    }
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [time, setTime] = useState("Morning");
  const [filter, setFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("dodit-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), priority, time, done: false }]);
    setInput("");
  };

  const toggleDone = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const saveEdit = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text: editText } : t)));
    setEditId(null);
  };

  const filtered =
    filter === "All" ? tasks :
    filter === "Done" ? tasks.filter((t) => t.done) :
    tasks.filter((t) => !t.done);

  const grouped = TIMES.reduce((acc, t) => {
    const group = filtered.filter((task) => task.time === t);
    if (group.length) acc[t] = group;
    return acc;
  }, {});

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", fontFamily: "'Inter', sans-serif", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: "#1C1917", padding: "28px 24px 24px", color: "#fff" }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 2 }}>Dodit</div>
        <div style={{ fontSize: 12, color: "#A8A29E", marginBottom: 14 }}>Stop thinking. Start doing.</div>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#78716C", marginBottom: 4 }}>
          {getToday()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 5, background: "#3D3835", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: "linear-gradient(90deg, #F59E0B, #EF4444)",
              borderRadius: 999, transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ fontSize: 12, color: "#A8A29E", whiteSpace: "nowrap" }}>{done}/{total} done</div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 0" }}>
        {/* Add Task */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#A8A29E", marginBottom: 10 }}>New Task</div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="What needs to get done?"
            style={{ width: "100%", border: "none", outline: "none", fontSize: 15, background: "transparent", color: "#1C1917", marginBottom: 12, fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {PRIORITIES.map((p) => (
              <button key={p} onClick={() => setPriority(p)} style={{
                padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: priority === p ? PRIORITY_COLORS[p].bg : "#F4F1ED",
                color: priority === p ? PRIORITY_COLORS[p].text : "#78716C",
              }}>{p}</button>
            ))}
            {TIMES.map((t) => (
              <button key={t} onClick={() => setTime(t)} style={{
                padding: "5px 12px", borderRadius: 999, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600,
                background: time === t ? "#1C1917" : "#F4F1ED",
                color: time === t ? "#fff" : "#78716C",
              }}>{t}</button>
            ))}
          </div>
          <button onClick={addTask} style={{
            width: "100%", padding: 11, borderRadius: 10, border: "none",
            background: "#1C1917", color: "#fff", fontWeight: 600,
            fontSize: 14, cursor: "pointer", fontFamily: "inherit",
          }}>Add task</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["All", "Pending", "Done"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              background: filter === f ? "#1C1917" : "#E7E5E0",
              color: filter === f ? "#fff" : "#78716C",
            }}>{f}</button>
          ))}
        </div>

        {/* Task Groups */}
        {Object.keys(grouped).length === 0 && (
          <div style={{ textAlign: "center", color: "#A8A29E", marginTop: 40, fontSize: 14 }}>
            No tasks here. Add one above!
          </div>
        )}

        {Object.entries(grouped).map(([timeGroup, groupTasks]) => (
          <div key={timeGroup} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#A8A29E", marginBottom: 8 }}>
              {timeGroup}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {groupTasks.map((task) => (
                <div key={task.id} style={{
                  background: "#fff", borderRadius: 12, padding: "14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: task.done ? 0.55 : 1, transition: "opacity 0.2s",
                }}>
                  <button onClick={() => toggleDone(task.id)} style={{
                    width: 22, height: 22, borderRadius: "50%",
                    border: `2px solid ${task.done ? "#22C55E" : "#D4CFC9"}`,
                    background: task.done ? "#22C55E" : "transparent",
                    cursor: "pointer", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {task.done && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </button>
                  <div style={{ flex: 1 }}>
                    {editId === task.id ? (
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                        onBlur={() => saveEdit(task.id)}
                        autoFocus
                        style={{ border: "none", borderBottom: "1px solid #E7E5E0", outline: "none", fontSize: 14, width: "100%", fontFamily: "inherit", background: "transparent" }}
                      />
                    ) : (
                      <span style={{ fontSize: 14, color: "#1C1917", textDecoration: task.done ? "line-through" : "none" }}>
                        {task.text}
                      </span>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600,
                        background: PRIORITY_COLORS[task.priority].bg,
                        color: PRIORITY_COLORS[task.priority].text,
                        padding: "2px 7px", borderRadius: 999,
                      }}>{task.priority}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setEditId(task.id); setEditText(task.text); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: 4 }}>✏️</button>
                    <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, padding: 4 }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
