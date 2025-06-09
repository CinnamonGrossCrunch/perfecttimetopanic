/*
  FloatingToDoPanel.jsx
  This is a self-contained floating to-do list component for PerfectTimeToPanic.com
  Features: Add, edit, delete, mark complete, persist with localStorage.
*/

"use client";
import React, { useState, useEffect, useRef } from "react";

export default function FloatingToDoPanel({ height = "500px" }) {
  const [todos, setTodos] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [forceExpand, setForceExpand] = useState(false); // NEW

  useEffect(() => {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) setTodos(JSON.parse(storedTodos));
  }, []);

  // Only collapse if not force expanding
  useEffect(() => {
    if (todos.length === 0 && expanded && !forceExpand) {
      setExpanded(false);
    }
  }, [todos, expanded, forceExpand]);

  // Collapse if expanded, no todos, user clicks outside, and not force expanding
  const panelRef = useRef(null);
  useEffect(() => {
    if (!expanded || todos.length > 0 || forceExpand) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [expanded, todos.length, forceExpand]);

  const updateLocalStorage = (newTodos) => {
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  const addTodo = (title) => {
    const newTodo = {
      title,
      id: self.crypto.randomUUID(),
      is_completed: false,
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    updateLocalStorage(updated);
    if (forceExpand) setForceExpand(false); // Reset forceExpand after first add
  };

  const completeTodo = (id) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo
    );
    setTodos(updated);
    updateLocalStorage(updated);
  };

  const deleteTodo = (id) => {
    const updated = todos.filter((todo) => todo.id !== id);
    setTodos(updated);
    updateLocalStorage(updated);
  };

  const editTodo = (id, newTitle) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, title: newTitle } : todo
    );
    setTodos(updated);
    updateLocalStorage(updated);
  };

  // Handle drag and drop
  const handleDragStart = (index) => setDraggedIndex(index);

  const handleDragOver = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...todos];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    setDraggedIndex(index);
    setTodos(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    updateLocalStorage(todos);
  };

  const deleteAllTodos = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAll = () => {
    setTodos([]);
    updateLocalStorage([]);
    setShowDeleteConfirm(false);
  };

  const cancelDeleteAll = () => {
    setShowDeleteConfirm(false);
  };

  // Panel sizing logic
  const isEmpty = todos.length === 0;
  const isCollapsed = isEmpty && !expanded;
  const dynamicHeight = isCollapsed
    ? "150px"
    : `min(${height}, ${120 + todos.length * 56}px)`;
  const dynamicWidth = isCollapsed ? "180px" : "360px";

  // Only show scroll if content overflows
  const showScroll =
    todos.length > 0 && (80 + todos.length * 56) > parseInt(height);

  // Position panel just above and to the right of the FAB when collapsed
  const panelPosition = isCollapsed
    ? {
        position: "fixed",
        right: "1.5rem",
        bottom: "7.5rem",
        zIndex: 50,
        transition: "all 0.5s",
      }
    : {};

  return (
    <div
      ref={panelRef}
      className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg z-50 p-4 overflow-hidden flex flex-col transition-all duration-500 relative`}
      style={{
        height: dynamicHeight,
        width: dynamicWidth,
        ...panelPosition,
      }}
    >
      {/* Delete All Button (hide if empty) */}
      {!isEmpty && (
        <button
          onClick={deleteAllTodos}
          className="absolute top-3 right-4 text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow font-bold transition"
          title="Delete all tasks"
        >
          Delete All
        </button>
      )}

      <h2
        className={`text-lg font-bold mb-2 pr-0 ${
          isCollapsed
            ? "flex justify-center items-center w-full h-full mb-0 text-center"
            : "justify-right text-left "
        }`}
        style={isCollapsed ? { flex: 1 } : {marginLeft: "0.3rem"} }
      >
        Your To-Do List
      </h2>
      <ToDoForm
        onSubmit={addTodo}
        isCollapsed={isCollapsed}
        expanded={expanded}
        setExpanded={setExpanded}
        forceExpand={forceExpand}
        setForceExpand={setForceExpand}
      />

      {/* Only show tasks if not empty */}
      {!isEmpty && (
        <ul className={`${showScroll ? "overflow-auto" : "overflow-visible"} flex-1 pr-2`}>
          {todos.map((todo, idx) => (
            <ToDoItem
              key={todo.id}
              todo={todo}
              onComplete={completeTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={() => handleDragOver(idx)}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === idx}
            />
          ))}
        </ul>
      )}

      {/* Custom Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-2 border-yellow-300">
            <div className="text-lg font-bold mb-4 text-red-700">
              Delete all tasks?
            </div>
            <div className="mb-6 text-gray-700">
              Are you sure you want to delete all tasks?
            </div>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold shadow"
              >
                Delete All
              </button>
              <button
                onClick={cancelDeleteAll}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ToDoForm updated for expand-once logic
function ToDoForm({ onSubmit, isCollapsed, expanded, setExpanded, forceExpand, setForceExpand }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCollapsed && !expanded) {
      setExpanded(true);
      setForceExpand(true);
      return;
    }
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
    if (forceExpand) setForceExpand(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${isCollapsed && !expanded ? "justify-center" : "gap-2 mb-4"}`}
    >
      {(!isCollapsed || expanded) && (
        <input
          type="text"
          placeholder="New task..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 px-3 py-2 rounded border border-yellow-300 bg-white text-black"
        />
      )}
      <button
        type="submit"
        className={`px-3 py-2 bg-yellow-300 hover:bg-yellow-400 rounded`}
        aria-label="Add"
        disabled={(!value.trim() && (!isCollapsed || expanded))}
        style={
          (!value.trim() && (!isCollapsed || expanded))
            ? { opacity: 0.5, cursor: "not-allowed" }
            : {}
        }
      >
        Add
      </button>
    </form>
  );
}

function ToDoItem({
  todo,
  onComplete,
  onDelete,
  onEdit,
  draggable,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(todo.title);
  const inputRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputVal.length, inputVal.length);
    }
  }, [editing]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(todo.id, inputVal);
    setEditing(false);
  };

  return (
    <li
      className={`bg-yellow-100/80 text-black mb-2 rounded p-3 flex justify-between items-center transition-opacity duration-200 ${
        isDragging ? "opacity-50" : ""
      }`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragEnd={onDragEnd}
      style={{ cursor: "grab" }}
    >
      {/* Drag handle icon */}
      <span className="mr-3 flex items-center text-yellow-400 cursor-grab select-none" title="Drag to reorder">
        {/* SVG for three horizontal bars */}
        <svg width="10" height="20" viewBox="0 0 20 20" fill="none">
          <rect y="4" width="20" height="2.2" rx="1" fill="currentColor"/>
          <rect y="9" width="20" height="2.2" rx="1" fill="currentColor"/>
          <rect y="14" width="20" height="2.2" rx="1" fill="currentColor"/>
        </svg>
      </span>
      {editing ? (
        <form onSubmit={handleEditSubmit} className="flex-1 mr-2">
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={() => setEditing(false)}
            className="w-full p-1 rounded border border-yellow-400"
          />
        </form>
      ) : (
        <button
          onClick={() => onComplete(todo.id)}
          className="flex-1 text-left"
        >
          <span
            style={{
              textDecoration: todo.is_completed ? "line-through" : "none",
              color: todo.is_completed ? "#22C55E" : undefined,
            }}
          >
            {todo.title}
          </span>
        </button>
      )}
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-xs text-red-600 hover:text-red-800 flex items-center justify-center"
          title="Delete"
        >
          {/* X icon */}
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <line x1="5" y1="5" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="5" x2="5" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>
    </li>
  );
}

// Note: This component uses Tailwind CSS for styling. Ensure you have Tailwind set up in your project.
// You can customize the styles as needed or replace them with your own CSS.