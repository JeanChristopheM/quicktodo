import { useContext } from "react";
import "./App.css";
import type { ITodo } from "./Todo";
import { auth, createTodo, handleSignIn } from "./firebase";
import { Context } from "./ContextProvider";
import TaskList from "./TaskList";

function App() {
  const context = useContext(Context);

  const handleCreateTodo = async () => {
    if (!context?.user) return;
    await createTodo({
      user: context.user,
      data: {
        name: "latest test 2",
        comment: "This should have new keys",
      } as ITodo,
    });
  };

  return (
    <main>
      {context?.user ? (
        <>
          <h2>Tâches</h2>
          <TaskList tasks={context?.todos || null} />

          <button onClick={handleCreateTodo}>Créer todo</button>
          <div>
            <button onClick={() => auth.signOut()}>Sign out</button>
          </div>
        </>
      ) : (
        <>
          <button onClick={handleSignIn}>Sign in</button>
        </>
      )}
    </main>
  );
}

export default App;
