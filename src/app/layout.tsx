import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import SplitLayout from "./SplitLayout";
import { getAllPokemon, getAllMoves, getAllAbilities } from "@/lib/dex";
import { getAllLocations } from "@/lib/locations";

const ubuntu = Ubuntu({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
    <html lang="en" className={`${ubuntu.variable} ${ubuntuMono.variable} h-full antialiased`}>
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
