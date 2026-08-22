import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((module) => ({
    default: module.Toaster,
  })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      retryDelay: 0,
    },
  },
});

const LocationRedirect = () => {
  useEffect(() => {
    window.location.replace("https://www.google.com/maps/place/Ali's+Barbershop/@27.8286777,-82.6982536,16z/data=!4m10!1m2!2m1!1sAli's+Barbershop,+4201+62nd+North+Unit+9,+Pinellas+Park,+FL+33781!3m6!1s0x88c2e5e61c59b849:0xd1899ae87c607955!8m2!3d27.8288039!4d-82.6914737!15sCkFBbGkncyBCYXJiZXJzaG9wLCA0MjAxIDYybmQgTm9ydGggVW5pdCA5LCBQaW5lbGxhcyBQYXJrLCBGTCAzMzc4MVpAIj5hbGkncyBiYXJiZXJzaG9wIDQyMDEgNjJuZCBub3J0aCB1bml0IDkgcGluZWxsYXMgcGFyayBmbCAzMzc4MZIBCmhhaXJfc2Fsb26aAURDaTlEUVVsUlFVTnZaRU5vZEhsalJqbHZUMnQzTVZwSFduRlNlazVUVlZaV05sUjZhRTFOYkd4eVRqSnJlVlJzUlJBQuABAPoBBAgAEDE!16s%2Fg%2F11xkrdhb2h?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D");
  }, []);
  return null;
};

const App = () => {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/location") return <LocationRedirect />;
  if (path !== "/") return <NotFound />;

  return (
    <QueryClientProvider client={queryClient}>
      <Index />
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
