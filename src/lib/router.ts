import { useEffect, useState } from "react";

export type Route =
  | { page: "trips" }
  | { page: "trip"; tripId: string; tab: TripTab }
  | { page: "explore" }
  | { page: "settings" };

export type TripTab = "itinerary" | "guide" | "budget" | "packing";

const TRIP_TABS: TripTab[] = ["itinerary", "guide", "budget", "packing"];

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "trip" && parts[1]) {
    const tab = TRIP_TABS.includes(parts[2] as TripTab) ? (parts[2] as TripTab) : "itinerary";
    return { page: "trip", tripId: parts[1], tab };
  }
  if (parts[0] === "explore") return { page: "explore" };
  if (parts[0] === "settings") return { page: "settings" };
  return { page: "trips" };
}

export function routeToHash(route: Route): string {
  switch (route.page) {
    case "trips":
      return "#/";
    case "trip":
      return `#/trip/${route.tripId}/${route.tab}`;
    case "explore":
      return "#/explore";
    case "settings":
      return "#/settings";
  }
}

export function navigate(route: Route): void {
  window.location.hash = routeToHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
