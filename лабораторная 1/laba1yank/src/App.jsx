import "./App.css";
function App() {
    function square(num) {
      return num % 10;
    }
    
    function cube(num) {
      return num ** 3;
    }
    
    const sum = square(3) + cube(4);
    
    return <div>
      {sum}
    </div>
  }  
export default App;