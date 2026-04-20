"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const AppShell = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "" : "pt-28"}>{children}</main>
    </>
  );
};

export default AppShell;
