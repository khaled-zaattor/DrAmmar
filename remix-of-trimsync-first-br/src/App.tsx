import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// retry: 0 is deliberate — retries live in api.ts (getJson) so attempts don't
// multiply across two layers. Previously this file also fired five
// prefetchQuery calls at module scope, which sent every request in one burst at
// t=0 and defeated the lazy-loading in Index.tsx. Each of those queries is
// already issued by the component that needs it (HeroSection -> top-booked,
// BookingSection -> services/categories/barbers/business-hours), so dropping
// the prefetch staggers them behind their lazy chunks instead.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      gcTime: 30 * 60 * 1000,
    },
  },
});

// /location is now a server-side 301 in public/.htaccess. Doing it here meant
// crawlers saw a blank page with the homepage's canonical tag, and users had to
// wait for the whole bundle before the redirect fired.

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
