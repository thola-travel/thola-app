import { AppIcon } from "./components/AppIcon";
import { StoreProvider } from "./store/store";
import { ToastProvider } from "./components/Toast";
import { useRoute, type Route } from "./lib/router";
import { TripsPage } from "./pages/TripsPage";
import { TripDetailPage } from "./pages/TripDetailPage";
import { ExplorePage } from "./pages/ExplorePage";
import { SettingsPage } from "./pages/SettingsPage";

const NAV_ITEMS = [
  { hash: "#/", label: "Trips", icon: "luggage", page: "trips" },
  { hash: "#/explore", label: "Explore", icon: "compass", page: "explore" },
  { hash: "#/settings", label: "Settings", icon: "gear", page: "settings" },
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
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
          <filter id="watercolor" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
          </filter>
        </svg>
        <div className="app">
          <header className="topbar">
            <div className="topbar-inner">
              <a className="brand" href="#/">
                <AppIcon id="compass" size={24} className="brand-mark" />
                <span className="brand-name">MIzDon Travels</span>
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
                <AppIcon id={item.icon} size={22} />
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}
