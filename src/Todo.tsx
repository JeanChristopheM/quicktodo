import { Timestamp, addDoc, collection } from "firebase/firestore";
import React, { useContext, useState } from "react";
import "./style/Todo.scss";
import { db, updateTodo } from "./firebase";
import { formatDate, renderMailToIcon } from "./utils";
import Comment, { IComment } from "./Comment";
import { Context } from "./ContextProvider";

export interface ITodo {
  id: string;
  name: string;
  comments: IComment[];
  author: string;
  createdAt: Timestamp;
  lastEditedAt: Timestamp | null;
  lastEditor: string | null;
  status: boolean;
}

const messageIcon =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAADTUlEQVR4nO2a/WtOYRjHP4wxw2aSKMS8DaGIElLKH4DGzOYn5SWNyMuI+E2iRfwkWVqIhkXyMpGXKHkfm9cotlh+MbaRTXd9T53WeR7P9jznOfep51OnVtd9rvt7P+d+ue7rGqRIkSJZDAeWAPuAc8BT4B3QqMf8/QSoVJt8YBiWMBrYA7wA2iM8P/REsj8DdgO5QQxgDnAZ+OsSZH7tg0AhMB3I8XgvR7blwCF9Ned94+sSMCsZA8hVZ07n74FtwMg4fI4CSoEPLr9VcfqMSDdgPfBTHdVpPXRPYB/GVwHwWn00AesS6J++wBk5b9YX6IF/9AS2Ay3q8xSQGa9TM6fvy6H5pSaRPCYDb9T3PSC7q476AY/k6CaQRfLJBm5Jw0PNjk6Rpl3JOLgKZBAcfYBqabkobTGzQy+a7bE/wZMFPJemrbG+NAX4rUNsDPYwTrtma6xr9bpGvgb7KJG2K/9rOE8Na3zeYuPZml9J49xoDSvVyIQZtlIsjaejbXVmbXwF0rGXXoqmWyNtRPka6THs57i0LvYylsm4FPtZJq0HvIzOoZOH/UyU1mtexjoZbV4fDr2ltRYPGoBfhIdmoN7LUK/QOSy0AF+8DDX6XCZIC/XUqpbRxDShXux7ZSzCfgqjbb8LZTyK/ZRL6yIvY6Yu/N8VBti8Phq12M0t1pOKEASNK6TxZLRG04A2HY62hvG1Gsjs/zU+r4bmEmMbG6TN5BNiyvw16ZQfjz3kSVOLtt+YWKuRm+T0AIIn23Vgb+5sirTcldMK8rTPlAaj5UJX0rTprtPeZPoGEsyXuC0ND+JJnWYoKeakTE1JIFlMBd6q7zuJyHSaLe+wHJo7/Rb8JR3Y6UpiVyQiie2mQI5NcsIPzLlVpBKdU+la5VeRx5mriS7fmRTtJ/lvUw1yBD5HnEci2EtVTlsJzAAGe8Rsg2Qr1nSt6VB6qwJm4jNOyW2Bx5RwMjBeT7MO2Ej2x8Auv0ptHRkC/AE+dkjrjwVuSFCDynHmwDoB3AVe6gr9TXPf1FvO6u5jQvChJJkyiV3tmiL7le1rVz7WpnDGkwkSbKbHRgWVzgCccDrivcAW0nQYec1tUxKbT0go0Y3xs/5DwcQ6m0KSjUxBkPwDzwIGrMKmHgUAAAAASUVORK5CYII=";

const Todo: React.FC<{ todo: ITodo }> = ({ todo }) => {
  const [visibleComs, setVisibleComs] = useState<boolean>(false);
  const [visibleComForm, setVisibleComForm] = useState<boolean>(false);

  const context = useContext(Context);

  const { id, name, author, comments, createdAt, status } = todo;

  const handleCreateComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!context?.user) {
      alert("no user connected");
      return;
    }
    const target = (e.target as unknown as HTMLInputElement[])[0];
    const comment = target.value;
    if (!comment || !comment.length) return;
    await addDoc(collection(db, "todos", id, "comments"), {
      comment,
      author: context.user.email,
      createdAt: new Date(),
    });
    target.value = "";
  };

  return (
    <li key={id} className="todoCard">
      <section className="author">
        <span>{author.slice(0, 1).toLocaleUpperCase()}</span>
      </section>

      <section className="title">
        <span>{name}</span>
        <span>{status ? "(FAIT)" : "(À FAIRE)"}</span>
      </section>

      <section className="toggle">
        <label className="switch">
          <input
            type="checkbox"
            checked={status}
            onChange={() => updateTodo({ ...todo, status: !todo.status })}
          />
          <span className="slider round"></span>
        </label>
      </section>

      <section className="comAmount">
        <span>{comments.length}</span>
        <img src={messageIcon} />
      </section>
      <section className="timestamp">
        {createdAt.toDate().toLocaleDateString().slice(0, 5)}
      </section>

      <section className="plus">
        <button
          className="smallButton"
          onClick={() => setVisibleComs((v) => !v)}
        >
          {visibleComs ? "▲" : "▼"}
        </button>
      </section>

      <section className={`coms ${visibleComs ? "visible" : "invisible"}`}>
        {comments.length ? (
          comments
            .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
            .map((c) => <Comment comment={c} key={c.id} />)
        ) : (
          <p>Aucuns commentaires</p>
        )}
        <div className="comForm">
          <form action="submit" onSubmit={handleCreateComment}>
            <textarea
              name="newCom"
              id="newCom"
              rows={visibleComForm ? 2 : 1}
              placeholder="Ajouter un commentaire"
              onFocus={() => setVisibleComForm(true)}
              onBlur={(e) => {
                if (!e.target.value) setVisibleComForm(false);
                if (
                  e.nativeEvent.relatedTarget &&
                  (e.nativeEvent.relatedTarget as HTMLElement)?.id ===
                    "formButton"
                )
                  setTimeout(() => {
                    setVisibleComForm(false);
                  }, 250);
                else setVisibleComForm(false);
              }}
            />
            {visibleComForm && (
              <button type="submit" id="formButton">
                Confirmer
              </button>
            )}
          </form>
        </div>
      </section>

      <section className={`info ${visibleComs ? "visible" : "invisible"}`}>
        {todo.lastEditedAt ? (
          <p>
            {`Édité par: ${renderMailToIcon(
              todo?.lastEditor || ""
            )} le ${formatDate(todo.lastEditedAt)}`}
          </p>
        ) : (
          "Pas encore édité"
        )}
      </section>
    </li>
  );
};

export default Todo;
