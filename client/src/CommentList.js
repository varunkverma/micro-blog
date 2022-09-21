import React, { useState, useEffect } from "react";

export default ({ comments }) => {
  const renderedComments = comments.map((comment) => {
    let content;

    if (comment.status === "APPROVED") {
      content = comment.content;
    } else if (comment.status === "PENDING") {
      content = "This comment is awaiting moderation";
    } else if (comment.status === "REJECTED") {
      content = "This comment has been rejected";
    }

    return <li key={comment.id}>{content}</li>;
  });

  return <ul>{renderedComments}</ul>;
};
