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
  deleteDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import type { ITodo } from "./Todo";

import { firebaseConfig } from "./env";
import { IComment } from "./Comment";
import { IUser } from "./ContextProvider";

// . Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const log = false;

export const isUserValid = async (email: string | null) => {
  if (!email) return false;
  const location = window.location.href;

  try {
    const response = await fetch(
      location.includes("192.168.1.48")
        ? "http://192.168.1.48:5173/api/check-email"
        : location.includes("localhost")
        ? "http://localhost:3000/api/check-email"
        : location.includes("192.168.1.33")
        ? "http://192.168.1.33:3000/api/check-email"
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
    log && console.log(`${email} is ${isValidUser.toString()}`);
    return isValidUser;
  } catch (e) {
    log && console.warn(e);
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
    log && console.error("Error signing in with Google:", error);
  }
};

export const registerUser = async (
  user: User,
  setLastSeen: (x: number) => void
) => {
  try {
    const lastSeen = (await getDoc(doc(db, "users", user.uid)))?.data()
      ?.lastSeen?.seconds;

    lastSeen && setLastSeen(lastSeen);

    await setDoc(doc(db, "users", user.uid), {
      username: user.displayName,
      picture: user.photoURL,
      lastSeen: new Date(),
    });
    log && console.log("Transaction successfully committed!");
  } catch (error) {
    log && console.error("Error registering user:", error);
  }
};
// . Store utils
export const subscribeToDBChanges = (
  setTodos: React.Dispatch<React.SetStateAction<ITodo[] | null>>,
  setUsers: React.Dispatch<React.SetStateAction<IUser[] | null>>
) => {
  return [
    onSnapshot(
      collection(db, "todos"),
      (snapshot) => {
        log && console.log("database change detected");
        snapshot.docChanges().forEach((change) => {
          const todo = {
            ...change.doc.data(),
            id: change.doc.id,
            comments: [] as IComment[],
          } as ITodo;

          if (change.type === "added") {
            log && console.log("New todo: ", todo);
            setTodos((todos) => {
              if (!todos) return [todo];
              return todos.some((t) => t.id === todo.id)
                ? todos
                : [...todos, todo];
            });
          }
          if (change.type === "modified") {
            log && console.log("Modified todo: ", todo);
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
            log && console.log("Removed city: ", change.doc.data());
            setTodos((todos) =>
              todos ? todos.filter((t) => t.id !== todo.id) : null
            );
          }
        });
      },
      (error) => log && console.log(error)
    ),
    onSnapshot(collectionGroup(db, "comments"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const comment = {
          ...change.doc.data(),
          id: change.doc.id,
        } as IComment;

        if (change.type === "added") {
          log && console.log("New comment: ", comment);
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
        if (change.type === "removed") {
          log && console.log("Comment removed2: ", comment);
          setTodos((todos) => {
            if (!todos) return todos;
            const todo = todos.find(
              (t) => t.id === change.doc.ref.parent.parent?.id
            );
            if (!todo) return todos;
            return [
              ...todos.filter((t) => t.id !== todo.id),
              {
                ...todo,
                comments: [...todo.comments.filter((c) => c.id !== comment.id)],
              },
            ];
          });
        }
      });
    }),
    onSnapshot(collectionGroup(db, "users"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const user = {
          ...change.doc.data(),
          id: change.doc.id,
        } as IUser;

        if (change.type === "added") {
          log && console.log("New user: ", user);
          setUsers((users) => {
            if (!users) return [user];
            return users.some((t) => t.id === user.id)
              ? users
              : [...users, user];
          });
        }
        if (change.type === "modified") {
          log && console.log("Modified user: ", user);
          setUsers((users) => {
            if (!users) return [user];
            return users.map((t) => (t.id === user.id ? { ...user } : t));
          });
        }
        if (change.type === "removed") {
          log && console.log("Removed user: ", change.doc.data());
          setUsers((users) =>
            users ? users.filter((t) => t.id !== user.id) : null
          );
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
      author: user.displayName,
      createdAt: new Date(),
      lastEditedAt: null,
      lastEditor: null,
      status: false,
    });
    log && console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    log && console.error("Error adding document: ", e);
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
        lastEditor: auth.currentUser?.displayName,
      } as { [key in string]: any });
    });
    log && console.log("Transaction successfully committed!");
  } catch (e) {
    log && console.log("Transaction failed: ", e);
  }
};

export const deleteComment = async (todoId: string, commentId: string) => {
  try {
    const sfDocRef = doc(db, "todos", todoId, "comments", commentId);
    await deleteDoc(sfDocRef);
    log && console.log("Comment successfully deleted!");
  } catch (e) {
    log && console.log("Transaction failed: ", e);
  }
};
