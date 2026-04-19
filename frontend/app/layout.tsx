import "./globals.css";
import { UserProvider } from "./auth/userContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
