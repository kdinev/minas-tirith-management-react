import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Theme first, overrides after. Without the theme CSS every Ignite UI component
// renders unstyled with broken icons.
import "igniteui-webcomponents/themes/dark/material.css";
import "./theme.css";

import App from "./app/app";
import { routes } from "./app/app-routes";

const basename = import.meta.env.VITE_BASENAME || "/";

const router = createBrowserRouter(
  [
    {
      element: <App />,
      children: [...routes],
    },
  ],
  { basename },
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
