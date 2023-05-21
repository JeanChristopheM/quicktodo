import { Timestamp } from "firebase/firestore";
import React from "react";
import { updateTodo } from "./firebase";

export interface ITodo {
  id: string;
  name: string;
  comment: string;
  author: string;
  createdAt: Timestamp;
  status: boolean;
}

const Todo: React.FC<{ todo: ITodo }> = ({ todo }) => {
  const { id, name, comment, author, createdAt, status } = todo;
  return (
    <li key={id} style={{ border: "1px solid red" }}>
      <h3>{name}</h3>
      <p>{comment}</p>
      <h2>{status ? "FAIT" : "À FAIRE"}</h2>
      <p>
        <i>{author}</i>
      </p>
      <p>
        <i>{createdAt.toDate().toLocaleDateString()}</i>
      </p>
      <button onClick={() => updateTodo(todo)}>Changer status</button>
    </li>
  );
};

export default Todo;
