import "./globals.css";
import { UserProvider } from "./auth/userContext";
import SocketManager from "../sockets/socketManager";

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
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
