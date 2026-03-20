import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplitLayout from "./SplitLayout";
import { getAllPokemon, getAllMoves, getAllAbilities } from "@/lib/dex";
import { getAllLocations } from "@/lib/locations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RenPlat Dex",
  description: "Pokédex for Pokémon Renegade Platinum",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pokemon = getAllPokemon();
  const moves = getAllMoves();
  const abilities = getAllAbilities();
  const locations = getAllLocations();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full bg-[var(--background)] text-[var(--text-primary)]">
        <SplitLayout
          pokemon={pokemon}
          moves={moves}
          abilities={abilities}
          locations={locations}
        >
          {children}
        </SplitLayout>
      </body>
    </html>
  );
}
