import React, { useMemo, useState } from "react";
import Todo, { ITodo } from "./Todo";
import { SortPossibility, sortFunctions } from "./utils";

interface ITaskListProps {
  tasks: ITodo[] | null;
}

const TaskList: React.FC<ITaskListProps> = ({ tasks }) => {
  const [sortBy, setSortBy] = useState<SortPossibility>(
    SortPossibility.MOST_RECENT
  );

  const sortedTasks = useMemo(() => {
    return tasks?.sort(sortFunctions[sortBy]);
  }, [tasks, sortBy]);
  if (!tasks || !tasks.length) return <p>Aucune tâche pour le moment.</p>;

  return (
    <ul>
      <label htmlFor="sortby">Trier par : </label>
      <select
        name="sortby"
        id="sortby"
        onChange={(input) =>
          setSortBy(
            (input.target as HTMLSelectElement).value as SortPossibility
          )
        }
      >
        <option value={SortPossibility.MOST_RECENT}>Plus récent</option>
        <option value={SortPossibility.OLDEST}>Plus vieux</option>
        <option value={SortPossibility.LAST_UPDATED}>Updaté en dernier</option>
        <option value={SortPossibility.AUTHOR}>Auteur</option>
        <option value={SortPossibility.STATUS}>Status</option>
      </select>
      {sortedTasks && sortedTasks.map((t) => <Todo todo={t} key={t.id} />)}
    </ul>
  );
};

export default TaskList;
