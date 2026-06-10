import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Components debounce-fetch real APIs (OpenStreetMap); tests must stay offline.
vi.stubGlobal(
  "fetch",
  vi.fn(() =>
    Promise.resolve(new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } }))
  )
);
