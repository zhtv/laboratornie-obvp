import './App.css'
/*
function App() {
  const [value, setValue] = useState("text");
  function handleChange(event){
    console.log(event.target.value);
    setValue(event.target.value);
  }
  return(
  <div>
    <input value ={value} onChange={handleChange}/>
    </div>
  );
}
*/

function App() {
  const [value, setValue] = useState("");
  return (
    <div>
      <input value={value} onChange={(event) => setValue(event.target.value)} />
      <p>text: {value}</p>
    </div>
  );
}

export default App
