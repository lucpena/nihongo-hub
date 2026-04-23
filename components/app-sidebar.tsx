"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
// const data = {
//   user: {
//     name: "user",
//     email: "user@example.com",
//     avatar: "",
//   },
//   teams: [
//     {
//       name: "Nihongo Hub",
//       logo: GalleryVerticalEnd,
//       plan: "",
//     }
//   ],
//   navMain: [
//     {
//       title: "Cards",
//       url: "#",
//       icon: SquareTerminal,
//       // isActive: true,
//       items: [
//         {
//           title: "N4 Vocabulary",
//           url: "#",
//         },
//         {
//           title: "N4 Grammar",
//           url: "#",
//         },
//         {
//           title: "N4 Kanji",
//           url: "#",
//         },
//         {
//           title: "2k Most Common Words",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "AI",
//       url: "#",
//       icon: Bot,
//       items: [
//         {
//           title: "Chat",
//           url: "#",
//         },
//         {
//           title: "Rate my Nihongo",
//           url: "#",
//         },
//         {
//           title: "Give me examples",
//           url: "#",
//         },
//         {
//           title: "JLPT Questions",
//           url: "#",
//         },
//       ],
//     },

//     {
//       title: "Settings",
//       url: "#",
//       icon: Settings2,
//       items: [
//         {
//           title: "General",
//           url: "#",
//         },
//         {
//           title: "Team",
//           url: "#",
//         },
//         {
//           title: "Billing",
//           url: "#",
//         },
//         {
//           title: "Limits",
//           url: "#",
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       name: "Upload Cards",
//       url: "#",
//       icon: Frame,
//     },
//     {
//       name: "Sales & Marketing",
//       url: "#",
//       icon: PieChart,
//     },
//     {
//       name: "Travel",
//       url: "#",
//       icon: Map,
//     },
//   ],
// }

let navMain = [];

// 1. We declare the shape of the data coming from layout
interface DeckData {
  _id: string;
  deck_name: string;
}

export function AppSidebar({ 
  user, 
  decks, 
  ...props 
}: { user: any, decks: DeckData[] } & React.ComponentProps<typeof Sidebar>) {

  const dynamicNavMain = [
    {
      title: "My Decks",
      url: "#",
      icon: SquareTerminal,
      isActive: true, // Keeps the folder open by default
      // Here we map your MongoDB decks into Shadcn UI items
      items: decks.map((deck) => ({
        title: deck.deck_name,
        url: `/study/${deck._id}`, // Connects to the dynamic route we created
      })),
    },
    {
      title: "AI Tools",
      url: "#",
      icon: Bot,
      items: [
        { title: "Chat", url: "#" },
        { title: "Rate my Nihongo", url: "#" },
        { title: "Give me examples", url: "#" },
        { title: "JLPT Questions", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ];

  // 3. Static data for Teams and Projects
  const staticTeams = [
    {
      name: "Nihongo Hub",
      logo: GalleryVerticalEnd,
      plan: "",
    }
  ];

  const staticProjects = [
    {
      name: "Upload Cards",
      url: "/decks/import", // Linked to the actual page you built!
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticTeams} />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Pass our dynamically constructed arrays */}
        <NavMain items={dynamicNavMain} />
        <NavProjects projects={staticProjects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
