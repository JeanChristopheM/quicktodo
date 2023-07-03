import { createContext, useEffect, useState } from "react";

import { Unsubscribe, User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  handleSignIn,
  isUserValid,
  log,
  registerUser,
  subscribeToDBChanges,
} from "./firebase";
import { ITodo } from "./Todo";

export const Context = createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  todos: ITodo[] | null;
  setTodos: React.Dispatch<React.SetStateAction<ITodo[] | null>>;
  lastSeen: number | null;
  users: IUser[] | null;
  setUsers: React.Dispatch<React.SetStateAction<IUser[] | null>>;
} | null>(null);

export interface IUser {
  username: string;
  picture: string;
  lastSeen: number;
  id: string;
}

const ContextProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<ITodo[] | null>(null);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [users, setUsers] = useState<IUser[] | null>(null);

  useEffect(() => {
    let unsub: Unsubscribe | null = null;
    onAuthStateChanged(auth, async (user) => {
      log && console.log("auth state changed");
      const validUser = await isUserValid(user?.email || null);
      if (!validUser) {
        setUser(null);
        unsub && typeof unsub === "function" && unsub();
      } else {
        log && console.log("subscribing and connecting user");
        log && console.log({ user });
        setUser(user);
        unsub = subscribeToDBChanges(setTodos, setUsers)[0];
        user && registerUser(user, setLastSeen);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (unsub && typeof unsub === "function") return () => unsub!();
  }, []);

  return (
    <Context.Provider
      value={{ user, setUser, todos, setTodos, lastSeen, users, setUsers }}
    >
      {user ? (
        children
      ) : (
        <main>
          <a
            style={{ cursor: "pointer" }}
            onClick={handleSignIn}
            onTouchStart={handleSignIn}
          >
            Se connecter
          </a>
        </main>
      )}
    </Context.Provider>
  );
};

export default ContextProvider;
