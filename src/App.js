import './App.css';
import Notebook from "./Notebook"
import Story from "./Story"

function App() {
  return (
    <div className='flex'>
      <aside>
        <h1>World Class Wines</h1>
        <Story />
      </aside>
      <div className='notebookContainer'>
        <Notebook />
      </div>
    </div>
  );
}

export default App;
