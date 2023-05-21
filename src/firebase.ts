// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
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
  getDocs,
  runTransaction,
  doc,
} from "firebase/firestore";
import { ITodo } from "./Todo";
import { allowedEmails, firebaseConfig } from "./env";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const handleSignIn = async () => {
  try {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithPopup(auth, provider);
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
      status: false,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getTodos = async (
  user: User | null,
  todos: ITodo[] | null,
  setTodos: (todos: ITodo[]) => void
) => {
  if (todos && todos.length) return;
  if (!isUserValid(user)) return;

  const docsRef = collection(db, "todos");
  const docsSnap = await getDocs(docsRef);
  const fetchedTodos: ITodo[] = [];
  console.log({ docsSnap });
  docsSnap.forEach((doc) => {
    const data = doc.data();
    fetchedTodos.push({ ...data, id: doc.id } as ITodo);
  });
  console.log({ fetchedTodos });
  setTodos(fetchedTodos);
};

export const updateTodo = async (todo: ITodo) => {
  try {
    const sfDocRef = doc(db, "todos", todo.id);
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }

      const newStatus = !sfDoc.data().status;
      transaction.update(sfDocRef, { status: newStatus });
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
};
