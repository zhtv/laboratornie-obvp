import React, { useState } from 'react';
import './App.css';

function App() {
  const [isAdult, setIsAdult] = useState(false);

  function chckbx_chng() {
    setIsAdult(!isAdult);
  }

  return (
    <div>
      <h1>Олды на месте?</h1>
      <label><input type = "checkbox" checked = {isAdult} onChange = {chckbx_chng}/>Олды тут</label>

      {isAdult ? (
        <div>
          <h2>Ура, вам уже есть 18 и вы олд</h2>
          <p>Здесь расположен контент только для взрослых</p>
        </div>
      ) : (
        <div>
          <p>Увы, вам еще нет 18 лет, вы не олд</p>
        </div>
      )}
    </div>
  );
}

export default App;