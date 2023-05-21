import React from "react";
import { ITodo } from "./Todo";
import "./Form.css";

interface IFormProps {
  todo: ITodo | null;
}

const Form: React.FC<IFormProps> = ({ todo }) => {
  return (
    <form>
      <label htmlFor="name">Name</label>
      <input type="text" name="name" defaultValue={todo?.name} />
    </form>
  );
};

export default Form;
