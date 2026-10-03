import type { Metadata } from "next";
import BillApp from "@/components/who-ate-what/BillApp";

export const metadata: Metadata = {
  title: "Who Ate What — split the bill fairly",
  description:
    "Split a group dinner bill fairly: 2–50 people, shared dishes, dish and bill discounts, service charge and tax. Everyone's share adds up to the total.",
};

export default function WhoAteWhatPage() {
  return <BillApp />;
}
