import React, { useMemo, useState } from "react";
import Todo, { ITodo } from "./Todo";
import {
  FilterPossibility,
  SortPossibility,
  filterFunctions,
  sortFunctions,
} from "./utils";
import "./style/taskList.scss";

interface ITaskListProps {
  tasks: ITodo[] | null;
}

const TaskList: React.FC<ITaskListProps> = ({ tasks }) => {
  const [sortBy, setSortBy] = useState<SortPossibility>(
    SortPossibility.MOST_RECENT
  );
  const [filterBy, setFilterBy] = useState<FilterPossibility>(
    FilterPossibility.NONE
  );

  const computedTasks = useMemo(() => {
    const filteredTasks = tasks?.filter(filterFunctions[filterBy]);
    return filteredTasks?.sort(sortFunctions[sortBy]);
  }, [tasks, sortBy, filterBy]);
  if (!tasks || !tasks.length) return <p>Aucune tâche pour le moment.</p>;

  return (
    <ul>
      <div className="listControls">
        <div className="sortBy">
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
            <option value={SortPossibility.LAST_UPDATED}>
              Updaté en dernier
            </option>
            <option value={SortPossibility.AUTHOR}>Auteur</option>
            <option value={SortPossibility.STATUS}>Status</option>
          </select>
        </div>
        <div className="filterBy">
          <label htmlFor="filterBy">Filtrer par : </label>
          <select
            name="filterBy"
            id="filterBy"
            onChange={(input) =>
              setFilterBy(
                (input.target as HTMLSelectElement).value as FilterPossibility
              )
            }
          >
            <option value={FilterPossibility.NONE}>Tous</option>
            <option value={FilterPossibility.DONE}>Fait</option>
            <option value={FilterPossibility.TODO}>À faire</option>
          </select>
        </div>
      </div>
      <div className="taskList">
        {computedTasks &&
          computedTasks.map((t) => <Todo todo={t} key={t.id} />)}
      </div>
    </ul>
  );
};

export default TaskList;
