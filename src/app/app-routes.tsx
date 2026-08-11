import type { RouteObject } from "react-router-dom";
import StewardsTable from "./pages/stewards-table";
import Garrisons from "./pages/garrisons";
import ChainOfCommand from "./pages/chain-of-command";
import Provisions from "./pages/provisions";
import Armoury from "./pages/armoury";
import Allies from "./pages/allies";
import MordorWatch from "./pages/mordor-watch";
import NotFound from "./pages/not-found";

/** Paths here must match `navSections` in `./shell/nav.ts`. */
export const routes: RouteObject[] = [
  { index: true, element: <StewardsTable /> },
  { path: "garrisons", element: <Garrisons /> },
  { path: "command", element: <ChainOfCommand /> },
  { path: "provisions", element: <Provisions /> },
  { path: "armoury", element: <Armoury /> },
  { path: "allies", element: <Allies /> },
  { path: "mordor", element: <MordorWatch /> },
  { path: "*", element: <NotFound /> },
];
