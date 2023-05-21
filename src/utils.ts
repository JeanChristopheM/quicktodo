import { Timestamp } from "firebase/firestore";

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
