import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Active Tasks",
  description: "Team task boards: plan, assign and finish work together.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
