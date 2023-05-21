import React from "react";
import Todo, { ITodo } from "./Todo";

interface ITaskListProps {
  tasks: ITodo[] | null;
}

const TaskList: React.FC<ITaskListProps> = ({ tasks }) => {
  return tasks && tasks.length ? (
    <ul>
      {tasks
        .sort((a, b) => (a.createdAt.toDate() > b.createdAt.toDate() ? -1 : 1))
        .map((t) => (
          <Todo todo={t} key={t.id} />
        ))}
    </ul>
  ) : (
    <p>Aucune tâche pour le moment.</p>
  );
};

export default TaskList;
