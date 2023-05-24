import { useContext } from "react";
import { auth } from "./firebase";
import { Link } from "react-router-dom";

import { Context } from "./ContextProvider";
import TaskList from "./TaskList";

import "./style/App.css";

function App() {
  const context = useContext(Context);

  return (
    <main>
      <>
        <div>
          <button onClick={() => auth.signOut()}>Sign out</button>
          <Link to="new">
            <button>New</button>
          </Link>
        </div>
        <h2>Tâches</h2>
        <TaskList tasks={context?.todos || null} />
      </>
    </main>
  );
}

export default App;
