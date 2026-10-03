/**
 * Personal mini web apps. These are deliberately kept off the homepage and
 * the nav: they are reachable only through /apps/ and their own routes.
 * Add an entry here and its card appears on /apps/.
 */

export type AppStatus = "live" | "beta" | "building" | "archived";

export type MiniApp = {
  slug: string;
  title: string;
  description: string;
  /** Local path under /public, e.g. "/apps/whosthefirst/cover.svg". */
  image: string;
  status: AppStatus;
  href: string;
};

export const statusLabel: Record<AppStatus, string> = {
  live: "Live",
  beta: "Beta",
  building: "Building",
  archived: "Archived",
};

export const apps: MiniApp[] = [
  {
    slug: "whosthefirst",
    title: "Who's the first",
    description:
      "A party game for 2–20 phones. Open a room, share the code and passcode, wait for GO, and tap. Everyone's reaction time is ranked to the millisecond.",
    image: "/apps/whosthefirst/cover.svg",
    status: "beta",
    href: "/apps/whosthefirst/",
  },
  {
    slug: "kyauk-thin-bone",
    title: "Kyauk Thin Bone",
    description:
      "A live scoreboard for 1–20 players. Keep score match by match or as a running total, and share it with a room code or a link.",
    image: "/apps/kyauk-thin-bone/cover.svg",
    status: "beta",
    href: "/apps/kyauk-thin-bone/",
  },
  {
    slug: "who-ate-what",
    title: "Who Ate What",
    description:
      "A fair bill splitter for 2–50 people. Tap who shared each dish, add dish or bill discounts, service and tax, and get each person's share. It always adds up to the total. Save it as an image or print it.",
    image: "/apps/who-ate-what/cover.svg",
    status: "beta",
    href: "/apps/who-ate-what/",
  },
];
