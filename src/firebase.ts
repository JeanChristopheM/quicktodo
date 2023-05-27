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
  collectionGroup,
} from "firebase/firestore";

import type { ITodo } from "./Todo";

import { firebaseConfig } from "./env";
import { IComment } from "./Comment";

// . Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const isUserValid = async (email: string | null) => {
  if (!email) return false;
  const location = window.location.href;

  try {
    const response = await fetch(
      location.includes("192.168.1.48")
        ? "http://192.168.1.48:5173/api/check-email"
        : location.includes("localhost")
        ? "http://localhost:3000/api/check-email"
        : "http://squaredcub.zapto.org:5173/api/check-email",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({ email }),
      }
    );

    const { isValidUser } = await response.json();
    console.log(`${email} is ${isValidUser.toString()}`);
    return isValidUser;
  } catch (e) {
    console.warn(e);
    return false;
  }
};

// . Auth utils
export const handleSignIn = async () => {
  try {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithPopup(auth, provider).then(async (result) => {
        const validUser = await isUserValid(result.user.email || null);
        if (!validUser) alert("Invalid user");
      });
    });
  } catch (error) {
    console.error("Error signing in with Google:", error);
  }
};

// . Store utils
export const subscribeToDBChanges = (
  setTodos: React.Dispatch<React.SetStateAction<ITodo[] | null>>
) => {
  return [
    onSnapshot(
      collection(db, "todos"),
      (snapshot) => {
        console.log("database change detected");
        snapshot.docChanges().forEach((change) => {
          const todo = {
            ...change.doc.data(),
            id: change.doc.id,
            comments: [] as IComment[],
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
            setTodos((todos) => {
              if (!todos) return [todo];
              const oldTodo = todos.find((t) => t.id === todo.id);
              return todos.map((t) =>
                t.id === todo.id
                  ? { ...todo, comments: oldTodo?.comments || [] }
                  : t
              );
            });
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
    ),
    onSnapshot(collectionGroup(db, "comments"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const comment = {
          ...change.doc.data(),
          id: change.doc.id,
        } as IComment;

        if (change.type === "added") {
          console.log("New comment: ", comment);
          setTodos((todos) => {
            if (!todos) return todos;
            const todo = todos.find(
              (t) => t.id === change.doc.ref.parent.parent?.id
            );
            if (!todo) return todos;
            if (todo.comments.find((c) => c.id === comment.id)) return todos;
            return [
              ...todos.filter((t) => t.id !== todo.id),
              { ...todo, comments: [...todo.comments, comment] },
            ];
          });
        }
      });
    }),
  ];
};

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
