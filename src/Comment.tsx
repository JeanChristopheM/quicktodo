import React from "react";
import { Timestamp } from "firebase/firestore";

import "./style/Comment.scss";

export interface IComment {
  comment: string;
  author: string;
  createdAt: Timestamp;
  id: string;
}

interface ICommentProps {
  comment: IComment;
}

const Comment: React.FC<ICommentProps> = ({ comment }) => {
  return (
    <div className="comment">
      <div className="author">
        <span>{comment.author.slice(0, 1).toLocaleUpperCase()}</span>
        <p className="timestamp">
          {comment.createdAt.toDate().toLocaleDateString().slice(0, 5)}
        </p>
      </div>
      <div className="body">{comment.comment}</div>
    </div>
  );
};

export default Comment;
