import { createContext, useEffect, useState } from "react";

import { Unsubscribe, User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  handleSignIn,
  isUserValid,
  subscribeToDBChanges,
} from "./firebase";
import { ITodo } from "./Todo";

export const Context = createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  todos: ITodo[] | null;
  setTodos: React.Dispatch<React.SetStateAction<ITodo[] | null>>;
} | null>(null);

const ContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<ITodo[] | null>(null);

  useEffect(() => {
    let unsub: Unsubscribe | null = null;
    onAuthStateChanged(auth, async (user) => {
      console.log("auth state changed");
      const validUser = await isUserValid(user?.email || null);
      if (!validUser) {
        setUser(null);
        unsub && typeof unsub === "function" && unsub();
      } else {
        console.log("subscribing and connecting user");
        setUser(user);
        unsub = subscribeToDBChanges(setTodos)[0];
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsub && typeof unsub === "function") return () => unsub!();
  }, []);

  return (
    <Context.Provider value={{ user, setUser, todos, setTodos }}>
      {user ? (
        children
      ) : (
        <main>
          <button onClick={handleSignIn}>Se connecter</button>
        </main>
      )}
    </Context.Provider>
  );
};

export default ContextProvider;
