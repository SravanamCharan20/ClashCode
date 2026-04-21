"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const AppShell = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isArenaPage = pathname?.startsWith("/rooms/arena");

  return (
    <>
      {!isAuthPage && !isArenaPage && <Navbar />}
      <main className={isAuthPage || isArenaPage ? "" : "pt-28"}>{children}</main>
    </>
  );
};

export default AppShell;
