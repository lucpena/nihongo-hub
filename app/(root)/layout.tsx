import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

// imports to get user
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/database/mongodb";
import User from "@/models/user.model";

import Deck from "@/models/deck.model";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nihongo Hub",
  description: "A collection of tools and resources for learning Japanese.",
};

export default async function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  let userData = null;

  // available decks for current user
  interface DeckData {
    _id: string;
    deck_name: string;
  }
  let serializedDecks: DeckData[] = [];

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    // console.log("1. Token encontrado no cookie?:", token ? "Sim" : "Não");

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
        userId: string;
        iat?: number;
        exp?: number;
      };
      // console.log("2. O que tem dentro do token?", decoded);

      await dbConnect();
      const userDoc = await User.findById(decoded.userId).lean();
      const decks = await Deck.find({ userId: decoded.userId }).lean();
      
      // console.log("User:", userDoc);
      console.log("User Decks:", decks);

      if (userDoc) {
        userData = {
          id: userDoc._id.toString(),
          name: userDoc.name || "Usuário",
          email: userDoc.email || "no e-mail",
          avatar: userDoc.profilePicture || "",
          level: userDoc.level || 1,
          experience: userDoc.experience || 0,
          totalStudyTime: userDoc.totalStudyTime || 0,
         };
        //  console.log("4. Objeto userData montado com sucesso:", userData);

        // Serializa os dados para enviar ao Client Component em segurança
        serializedDecks = decks.map(deck => ({
          _id: deck._id.toString(),
          deck_name: deck.deck_name,
        }));

      } else {
         console.log("⛔ Error, no user found with id.");
      }
    }
  } catch (error) {
    console.error("⛔ Error:", error);
  }

  // fallback
  const fallbackUser = userData || {
    name: "Not logged in",
    email: "Login to save progress",
    avatar: "",
    level: 1,
    experience: 0
  }

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar user={fallbackUser} decks={serializedDecks} />
            <main>
              <SidebarTrigger />
              {children}
            </main>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}