import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrainHQ - Тренировка мозга",
  description: "Развивайте свой мозг с научно обоснованными играми для тренировки памяти, внимания и скорости мышления",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
