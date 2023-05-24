import React, { FormEvent, useContext } from "react";
import { ITodo } from "./Todo";
import "./style/Form.css";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./ContextProvider";
import { createTodo } from "./firebase";

interface IFormProps {
  todo: ITodo | null;
}

const Form: React.FC<IFormProps> = ({ todo }) => {
  const context = useContext(Context);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = context?.user;
    if (!user) return;
    const castedEvent = e as unknown as { target: HTMLInputElement[] };
    const name = castedEvent.target[0].value;
    const comment = castedEvent.target[1].value;

    const res = await createTodo({ user, data: { name, comment } as ITodo });

    setTimeout(() => {
      navigate("/");
    }, 200);
  };

  return (
    <>
      <Link to="/">
        <button>Back</button>
      </Link>
      <form onSubmit={handleSubmit}>
        <div className="form_input">
          <label htmlFor="name">
            <span>Name</span>
            <input type="text" name="name" defaultValue={todo?.name} />
          </label>
        </div>
        <div className="form_input">
          <label htmlFor="name">
            <span>Commentaire</span>
            <textarea name="comment" defaultValue={todo?.comment} />
          </label>
        </div>
        <button type="submit">Créer</button>
      </form>
    </>
  );
};

export default Form;
