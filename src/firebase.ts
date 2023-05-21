import { initializeApp } from "firebase/app";

import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  runTransaction,
  doc,
  onSnapshot,
} from "firebase/firestore";

import type { ITodo } from "./Todo";

import { allowedEmails, firebaseConfig } from "./env";

// . Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);

// . Auth utils
export const handleSignIn = async () => {
  try {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithPopup(auth, provider).then((result) => {
        if (!isUserValid(result.user)) alert("Invalid user");
      });
    });
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
};

export const isUserValid = (user: User | null) => {
  if (user && user.email && allowedEmails.includes(user.email)) return true;
  console.log("wrong user", user);
  return false;
};

// . Store utils
export const subscribeToDBChanges = (
  setTodos: React.Dispatch<React.SetStateAction<ITodo[] | null>>
) =>
  onSnapshot(
    collection(db, "todos"),
    (snapshot) => {
      console.log("database change detected");
      console.log({ snapshot });
      snapshot.docChanges().forEach((change) => {
        const todo = {
          ...change.doc.data(),
          id: change.doc.id,
        } as ITodo;
        if (change.type === "added") {
          console.log("New todo: ", todo);
          setTodos((todos) => {
            if (!todos) return [todo];
            return todos.some((t) => t.id === todo.id)
              ? todos
              : [...todos, todo];
          });
        }
        if (change.type === "modified") {
          console.log("Modified todo: ", todo);
          setTodos((todos) =>
            todos ? todos.map((t) => (t.id === todo.id ? todo : t)) : null
          );
        }
        if (change.type === "removed") {
          console.log("Removed city: ", change.doc.data());
          setTodos((todos) =>
            todos ? todos.filter((t) => t.id !== todo.id) : null
          );
        }
      });
    },
    (error) => console.log(error)
  );

export const createTodo = async ({
  user,
  data,
}: {
  user: User;
  data: ITodo;
}) => {
  try {
    const docRef = await addDoc(collection(db, "todos"), {
      name: data.name,
      comment: data.comment,
      author: user.email,
      createdAt: new Date(),
      lastEditedAt: null,
      lastEditor: null,
      status: false,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const updateTodo = async (todo: ITodo) => {
  try {
    const sfDocRef = doc(db, "todos", todo.id);
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }

      transaction.update(sfDocRef, {
        ...todo,
        lastEditedAt: new Date(),
        lastEditor: auth.currentUser?.email,
      } as { [key in string]: any });
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
};
