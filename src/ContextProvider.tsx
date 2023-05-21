import { createContext, useEffect, useState } from "react";

import { Unsubscribe, User, onAuthStateChanged } from "firebase/auth";
import { auth, isUserValid, subscribeToDBChanges } from "./firebase";
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

  return (
    <Context.Provider value={{ user, setUser, todos, setTodos }}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
