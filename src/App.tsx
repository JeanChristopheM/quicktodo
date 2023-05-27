import { useContext } from "react";
import { auth } from "./firebase";
import { Link } from "react-router-dom";

import { Context } from "./ContextProvider";
import TaskList from "./TaskList";

import "./style/App.scss";

const logoutIcon =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNklEQVR4nO3aMU4DMRCF4R8KWiRofRHEwWi3gcBNOEEaxAEoAhR0tCzXcGTJkdAqGzyJgt4MfpJLS/NpdtdrywBnwAPwDWSRMQKLWltz7gUKnxt3FshYJ12hk+sfnWnORq+WbK2rQ46c3Dsiltw7IpabKB0pGQgCMaVDjphHYAmce+/Iqtb0YsEoQhLwWesqqAuvkL0wqpAp5vU3jDLEhFGHbMNc4hTShPECmWLephhPkJ0Yb5BZzCGQE+Bd4NhodSjktL547iFhHi2pz3B2BEm71hIvkBRhQUwt/1vqkNT6O68MSZY9iSokRdhYpShb3Y8ohw/PwFOE46C90iF/kCFCRwZrXaqQ3CFiyb0jYsn/tiNjnVAusqhdqvmyTFoIHOfMjVsLpFzuKphNZxRG6URBNF88WwOccZGxk5w4qAAAAABJRU5ErkJggg==";

function App() {
  const context = useContext(Context);

  return (
    <main>
      <>
        <nav>
          <Link to="new">
            <button>New</button>
          </Link>
          <h2>Tâches</h2>
          <button onClick={() => auth.signOut()}>
            <img src={logoutIcon} id="logoutIcon" />
          </button>
        </nav>
        <TaskList tasks={context?.todos || null} />
      </>
    </main>
  );
}

export default App;
