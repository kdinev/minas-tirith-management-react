import { afterEach, beforeAll, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import "element-internals-polyfill";
import App from "./app";
import { routes } from "./app-routes";
import { setupTestMocks } from "../setupTests";

beforeAll(() => {
  setupTestMocks();
});

// Vitest is configured without globals, so Testing Library never registers its
// own auto-cleanup. Without this each test leaves its tree in the document and
// the next one's queries find two of everything.
afterEach(cleanup);

/** The shell reads the router, so it has to be mounted inside one. */
function renderAt(path: string) {
  const router = createMemoryRouter([{ element: <App />, children: [...routes] }], {
    initialEntries: [path],
  });
  return render(<RouterProvider router={router} />);
}

test("renders the shell without crashing", () => {
  const wrapper = renderAt("/");
  expect(wrapper).toBeTruthy();
});

test("names the City and the standing threat in the navbar", () => {
  renderAt("/");
  expect(screen.getByText("Minas Tirith")).toBeTruthy();
  expect(screen.getByText(/^Threat \d+$/)).toBeTruthy();
});

test("every section in the drawer resolves to a route", () => {
  for (const path of ["/", "/garrisons", "/command", "/provisions", "/armoury", "/allies", "/mordor"]) {
    const wrapper = renderAt(path);
    // A matched route renders a page heading; the catch-all renders the miss copy.
    expect(wrapper.container.querySelector("h1, h2")).toBeTruthy();
    expect(wrapper.container.textContent).not.toContain("No such despatch");
    wrapper.unmount();
  }
});
