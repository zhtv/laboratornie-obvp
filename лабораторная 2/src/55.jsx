import { useState } from 'react'
import './App.css'

function App() {
  const [notes, setNotes] = useState(initNotes);
  const result = notes.map((note) => {
    return (
      <li key={note.id}>
        <span>{note.prop1}</span> <span>{note.prop2}</span> <span>{note.prop3}</span>
        <button onClick={() => doSmth(note.id)}> btn </button>
      </li>
    );
  });
  return (
    <div>
      <ul> {result} </ul>
    </div>
  );
}

function doSmth(id) {
  setNotes(
    notes.map((note) => {
      if (note.id === id) {
        // что-то делаем с элементом
      }
      return note;
    }),
  );
}

function doSmth2(id) {
  setNotes(
    notes.map((note) => {
      if (note.id === id) {
        note.prop1 += "!";
        note.prop2 += "!";
        note.prop2 += "!";
        return note;
      }
      return note;
    }),
  );
}

export default App
