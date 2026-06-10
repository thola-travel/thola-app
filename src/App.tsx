import { Compass, Luggage, Settings } from "lucide-react";
import { StoreProvider } from "./store/store";
import { ToastProvider } from "./components/Toast";
import { useRoute, type Route } from "./lib/router";
import { TripsPage } from "./pages/TripsPage";
import { TripDetailPage } from "./pages/TripDetailPage";
import { ExplorePage } from "./pages/ExplorePage";
import { SettingsPage } from "./pages/SettingsPage";

const NAV_ITEMS = [
  { hash: "#/", label: "Trips", Icon: Luggage, page: "trips" },
  { hash: "#/explore", label: "Explore", Icon: Compass, page: "explore" },
  { hash: "#/settings", label: "Settings", Icon: Settings, page: "settings" },
] as const;

function isActive(route: Route, page: string): boolean {
  if (page === "trips") return route.page === "trips" || route.page === "trip";
  return route.page === page;
}

function PageContent({ route }: { route: Route }) {
  switch (route.page) {
    case "trips":
      return <TripsPage />;
    case "trip":
      return <TripDetailPage tripId={route.tripId} tab={route.tab} />;
    case "explore":
      return <ExplorePage />;
    case "settings":
      return <SettingsPage />;
  }
}

export default function App() {
  const route = useRoute();

  return (
    <StoreProvider>
      <ToastProvider>
        <div className="app">
          <header className="topbar">
            <div className="topbar-inner">
              <a className="brand" href="#/">
                <Compass size={21} aria-hidden className="brand-mark" />
                <span className="brand-name">Thola</span>
                <span className="brand-tag">discover · plan · go</span>
              </a>
              <nav className="topnav" aria-label="Primary">
                {NAV_ITEMS.map((item) => (
                  <a key={item.hash} href={item.hash} className={isActive(route, item.page) ? "active" : ""}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main className="main">
            <PageContent route={route} />
          </main>

          <nav className="bottomnav" aria-label="Primary mobile">
            {NAV_ITEMS.map((item) => (
              <a key={item.hash} href={item.hash} className={isActive(route, item.page) ? "active" : ""}>
                <item.Icon size={21} aria-hidden />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}
