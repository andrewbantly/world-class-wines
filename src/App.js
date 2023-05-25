import './App.css';
import Notebook from "./Notebook"
import Story from "./Story"

function App() {
  return (
    <div className='flex'>
      <aside className="storyText">
        <h1>World Class Wines</h1>
        <Story />
      </aside>
      <aside className="aboutText">
        <p>
          Develop by <a href="https://www.linkedin.com/in/andrewbantly/">Andrew Bantly</a>
        </p>
      </aside>
      <div className='overflow'>
        <div className='notebookContainer'>
          <Notebook />
        </div>
        <div className='notebookBg'></div>
      </div>
    </div>
  );
}

export default App;
