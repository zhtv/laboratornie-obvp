import { useState } from 'react'
import './App.css'

function App() {
    const [notes, setNotes] = useState([1, 2, 3, 4, 5]);
    const result = notes.map((note, index) => {
      return (
        <li key = {index} onClick = {() => doSmth(index)}>
          {note}
        </li>
      );
    });

    return (
      <div>
        <ul> {result} </ul>
      </div>
    );
  }
  
function AppSmth() {
  function doSmth(index) {
    let copy = Object.assign([], notes);
    copy[index] += "!"; // что-то сделаем с элементом
    setNotes(copy);
  }
}

export default App
