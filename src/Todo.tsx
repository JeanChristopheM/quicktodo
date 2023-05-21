import { Timestamp } from "firebase/firestore";
import React from "react";
import "./Todo.css";
import { updateTodo } from "./firebase";
import { formatDate } from "./utils";

export interface ITodo {
  id: string;
  name: string;
  comment: string;
  author: string;
  createdAt: Timestamp;
  lastEditedAt: Timestamp | null;
  lastEditor: string;
  status: boolean;
}

const Todo: React.FC<{ todo: ITodo }> = ({ todo }) => {
  const { id, name, comment, author, createdAt, status } = todo;
  return (
    <li key={id} className="todoCard">
      <h3 id="name">{name}</h3>
      <p id="comment">{comment}</p>
      <h2 id="status">{status ? "FAIT" : "À FAIRE"}</h2>
      <p id="info">
        Par: {author} le {formatDate(createdAt)}
      </p>
      <button onClick={() => updateTodo({ ...todo, status: !todo.status })}>
        Changer status
      </button>
    </li>
  );
};

export default Todo;
