import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Report",
  description: "Real-time surf conditions and scoring for your local breaks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/vku1unt.css" />
      </head>
      <body style={{ backgroundColor: "#050B19", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
