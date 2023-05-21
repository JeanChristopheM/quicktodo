import React from "react";
import Todo, { ITodo } from "./Todo";

interface ITaskListProps {
  tasks: ITodo[] | null;
}

const TaskList: React.FC<ITaskListProps> = ({ tasks }) => {
  return tasks && tasks.length ? (
    <ul>
      {tasks
        .sort((a, b) => {
          const aDate = a.status
            ? a.createdAt.toDate()
            : a.lastEditedAt?.toDate() || a.createdAt.toDate();
          const bDate = b.status
            ? b.createdAt.toDate()
            : b.lastEditedAt?.toDate() || b.createdAt.toDate();
          return aDate > bDate ? -1 : 1;
        })
        .map((t) => (
          <Todo todo={t} key={t.id} />
        ))}
    </ul>
  ) : (
    <p>Aucune tâche pour le moment.</p>
  );
};

export default TaskList;
