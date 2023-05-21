import { useEffect, useState } from "react";
import "./App.css";
import Todo, { ITodo } from "./Todo";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  createTodo,
  getTodos,
  handleSignIn,
  isUserValid,
} from "./firebase";

function App() {
  const [user, setUser] = useState<null | User>(null);
  const [todos, setTodos] = useState<null | ITodo[]>(null);

  const handleCreateTodo = async () => {
    if (!user) return;
    await createTodo({
      user,
      data: {
        name: "another test",
        comment: "On doit ranger les outils dans la cabane",
      } as ITodo,
    });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      isUserValid(user) ? setUser(user) : setUser(null);
    });
  }, []);

  useEffect(() => {
    getTodos(user, todos, setTodos);
  }, [user, todos]);

  return (
    <main>
      {user ? (
        <>
          <h2>Tâches</h2>
          {todos && todos.length ? (
            <ul>
              {todos.map((t) => (
                <Todo todo={t} key={t.name.slice(0, 10)} />
              ))}
            </ul>
          ) : (
            <p>Aucune tâche pour le moment.</p>
          )}
          <button onClick={handleCreateTodo}>Créer todo</button>
          <button onClick={() => getTodos(user, todos, setTodos)}>
            Fetch todos
          </button>
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
