import { useState } from 'react'
import './App.css'

const initNotes = [
  { id: 1, name: "name1", desc: "long description 1", show: false },
  { id: 2, name: "name2", desc: "long description 2", show: false },
  { id: 3, name: "name3", desc: "long description 3", show: false },
];

function App() {
  const [notes, setNotes] = useState(initNotes);
  const result = notes.map((note) => {
    return (
      <p key = {note.id}>
        {note.name}, <i>{note.desc}</i>
      </p>
    );
  });

  return <div> {result} </div>;
}

export default App
