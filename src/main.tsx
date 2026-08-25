import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Theme first, overrides after. Without the theme CSS every Ignite UI component
// renders unstyled with broken icons.
import "igniteui-webcomponents/themes/dark/material.css";
import "./theme.css";

import App from "./app/app";
import { routes } from "./app/app-routes";

// Vite derives BASE_URL from the `base` config, so the router prefix and the
// built asset URLs come from one value and cannot drift apart — which matters on
// GitHub Pages, where the site is served from /<repo>/ rather than the root.
// VITE_BASENAME stays supported as an explicit override.
const basename = import.meta.env.VITE_BASENAME || import.meta.env.BASE_URL;

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
