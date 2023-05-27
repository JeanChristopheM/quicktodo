import { Timestamp } from "firebase/firestore";
import React from "react";
import "./style/Todo.scss";
import { updateTodo } from "./firebase";
import { formatDate, renderMailToIcon } from "./utils";

export interface ITodo {
  id: string;
  name: string;
  comment: string;
  author: string;
  createdAt: Timestamp;
  lastEditedAt: Timestamp | null;
  lastEditor: string | null;
  status: boolean;
}

const Todo: React.FC<{ todo: ITodo }> = ({ todo }) => {
  const { id, name, comment, author, createdAt, status } = todo;
  return (
    <li key={id} className="todoCard">
      <div className="title">
        <h3 id="name">
          {`${name}`}
          <span>{` (${status ? "fait" : "à faire"})`}</span>
        </h3>
        <label className="switch">
          <input
            type="checkbox"
            checked={status}
            onChange={() => updateTodo({ ...todo, status: !todo.status })}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <p id="comment">{comment}</p>
      {todo.lastEditedAt && (
        <p id="info">
          Édité par: <span>{renderMailToIcon(todo?.lastEditor || "")}</span> le{" "}
          {formatDate(todo.lastEditedAt)}
        </p>
      )}
      <p id="info">
        Créé par: <span>{renderMailToIcon(author)}</span> le{" "}
        {formatDate(createdAt)}
      </p>
    </li>
  );
};

export default Todo;
