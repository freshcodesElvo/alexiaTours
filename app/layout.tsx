import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Alexia's Tours - Best Kenya Safaris & Beach Vacations",
  description: "Discover Kenya safaris, beach vacations, cultural excursions, hotel bookings and airport transfers with Alexia's Tours.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
