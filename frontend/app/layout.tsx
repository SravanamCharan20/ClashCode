import "./globals.css";
import { UserProvider } from "./auth/userContext";
import SocketManager from "../sockets/socketManager";
import AppShell from "../components/AppShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <SocketManager />
          <AppShell>{children}</AppShell>
        </UserProvider>
      </body>
    </html>
  );
}
