import { useEffect, useState } from "react";
import "./App.css";
import Todo, { ITodo } from "./Todo";
import { Unsubscribe, User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  createTodo,
  handleSignIn,
  isUserValid,
  subscribeToDBChanges,
} from "./firebase";

function App() {
  const [user, setUser] = useState<null | User>(null);
  const [todos, setTodos] = useState<null | ITodo[]>(null);

  const handleCreateTodo = async () => {
    if (!user) return;
    await createTodo({
      user,
      data: {
        name: "latest test",
        comment:
          "This is a long text to see what it would look like in the UI. I am just making a visual test with this. Also maybe it will fail in the database because the length of the data is too long ? Who knows at this point. I am just rambling for the fun of it by now. You probably guessed if you're reading. I mean if you're reading this right now you probably think I'm crazy. But try typing a long text with nothing interesting to say and we'll see who's the crazy one. Anyway that should be enough data to test both study cases. See ya",
      } as ITodo,
    });
  };

  useEffect(() => {
    let unsub: Unsubscribe | null = null;
    onAuthStateChanged(auth, (user) => {
      console.log("auth state changed");
      const validUser = isUserValid(user);
      if (!validUser) {
        setUser(null);
        unsub && typeof unsub === "function" && unsub();
      } else {
        setUser(user);
        unsub = subscribeToDBChanges(setTodos);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsub && typeof unsub === "function") return () => unsub!();
  }, []);

  // useEffect(() => {
  //   initializeTodos(user, todos, setTodos);
  // }, [user, todos]);

  return (
    <main>
      {user ? (
        <>
          <h2>Tâches</h2>
          {todos && todos.length ? (
            <ul>
              {todos
                .sort((a, b) =>
                  a.createdAt.toDate() > b.createdAt.toDate() ? -1 : 1
                )
                .map((t) => (
                  <Todo todo={t} key={t.id} />
                ))}
            </ul>
          ) : (
            <p>Aucune tâche pour le moment.</p>
          )}
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
