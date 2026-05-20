import { Outlet, ScrollRestoration } from "react-router";
import { TopNav } from "./TopNav";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
