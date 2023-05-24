import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import ErrorPage from "./ErrorPage.tsx";
import "./style/index.css";
import ContextProvider from "./ContextProvider.tsx";
import Form from "./Form.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "new",
    element: <Form todo={null} />,
  },
]);

// . EXAMPLE OF GOAL
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Root />,
//     errorElement: <ErrorPage />,
//     loader: rootLoader,
//     action: rootAction,
//     children: [
//       {
//         path: "contacts/:contactId",
//         element: <Contact />,
//         loader: contactLoader,
//       },
//       {
//         path: "contacts/:contactId/edit",
//         element: <EditContact />,
//         loader: contactLoader,
//         action: editAction,
//       },
//     ],
//   },
// ]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ContextProvider>
      <RouterProvider router={router} />
    </ContextProvider>
  </React.StrictMode>
);
