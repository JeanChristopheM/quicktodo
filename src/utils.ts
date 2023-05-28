/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Timestamp } from "firebase/firestore";
import { ITodo } from "./Todo";

export const formatDate = (date: Timestamp) => {
  return `${date.toDate().toLocaleDateString()} @ ${date
    .toDate()
    .getHours()
    .toString()
    .padStart(2, "0")}:${date
    .toDate()
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export enum SortPossibility {
  MOST_RECENT = "mostRecent",
  OLDEST = "oldest",
  LAST_UPDATED = "updatedAt",
  AUTHOR = "author",
  STATUS = "status",
}

export enum FilterPossibility {
  NONE = "none",
  DONE = "done",
  TODO = "todo",
}

export const sortFunctions = {
  [SortPossibility.MOST_RECENT]: (a: ITodo, b: ITodo) =>
    a.createdAt.toDate() > b.createdAt.toDate() ? -1 : 1,
  [SortPossibility.OLDEST]: (a: ITodo, b: ITodo) =>
    a.createdAt.toDate() > b.createdAt.toDate() ? 1 : -1,
  [SortPossibility.LAST_UPDATED]: (a: ITodo, b: ITodo) => {
    const aDate = a.lastEditedAt?.toDate() || a.createdAt.toDate();
    const bDate = b.lastEditedAt?.toDate() || b.createdAt.toDate();
    return aDate > bDate ? -1 : 1;
  },
  [SortPossibility.AUTHOR]: (a: ITodo, b: ITodo) =>
    a.author > b.author ? -1 : 1,
  [SortPossibility.STATUS]: (a: ITodo, b: ITodo) =>
    a.status > b.status ? -1 : 1,
};

export const filterFunctions = {
  [FilterPossibility.NONE]: (t: ITodo) => !!t,
  [FilterPossibility.DONE]: (t: ITodo) => t.status === true,
  [FilterPossibility.TODO]: (t: ITodo) => t.status === false,
};

export const renderMailToIcon = (email: string) => {
  return email.split("@")[0].toLocaleUpperCase();
};
