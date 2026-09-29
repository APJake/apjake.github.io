import type { Metadata } from "next";
import AppShell from "@/components/scoreboard/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Kyauk Thin Bone — live scoreboard",
    template: "%s · Kyauk Thin Bone",
  },
  description: "Create a live scoreboard, add up to 20 players and share it with a room code or a link.",
};

export default function KyaukThinBoneLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
