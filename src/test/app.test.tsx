import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "../App";

beforeEach(() => {
  localStorage.clear();
  window.location.hash = "#/";
});

describe("App", () => {
  it("renders the empty trips dashboard", () => {
    render(<App />);
    expect(screen.getByText("My trips")).toBeInTheDocument();
    expect(screen.getByText("No trips yet")).toBeInTheDocument();
  });

  it("creates a trip from the dashboard and lands on its itinerary", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "+ New trip" }));

    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Trip name"), {
      target: { value: "Island Week" },
    });
    fireEvent.change(within(dialog).getByLabelText("Destination"), {
      target: { value: "San Andrés, Colombia" },
    });
    fireEvent.change(within(dialog).getByLabelText("Start"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.change(within(dialog).getByLabelText("End"), {
      target: { value: "2026-07-06" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Create trip" }));

    // Navigation is hash-based; fire the event jsdom won't dispatch automatically.
    fireEvent(window, new HashChangeEvent("hashchange"));

    expect(await screen.findByText(/Island Week/)).toBeInTheDocument();
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 6")).toBeInTheDocument();
    // Essentials packing list is seeded on creation.
    expect(window.localStorage.getItem("thola.state.v1")).toContain("Passport / ID");
  });

  it("validates the trip form", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "+ New trip" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Create trip" }));
    expect(within(dialog).getByText("Give your trip a name.")).toBeInTheDocument();
  });

  it("shows the explore catalog and filters by search", () => {
    window.location.hash = "#/explore";
    render(<App />);
    expect(screen.getByText("Cape Town")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search destinations"), {
      target: { value: "tokyo" },
    });
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
    expect(screen.queryByText("Cape Town")).not.toBeInTheDocument();
  });

  it("shows settings with export/import", () => {
    window.location.hash = "#/settings";
    render(<App />);
    expect(screen.getByRole("button", { name: "Export data" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import backup" })).toBeInTheDocument();
  });
});
