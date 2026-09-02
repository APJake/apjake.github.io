/**
 * Single source of truth for every string on the page.
 * Everything here is drawn from the CV — nothing is invented.
 */

export const person = {
  wordmark: "JAKE",
  name: "Aung Min Khant",
  role: "Senior Mobile Developer",
  location: "Da Nang, Vietnam",
  email: "apjake.me@gmail.com",
  github: "https://github.com/apjake",
  linkedin: "https://linkedin.com/in/apjake",
  telegram: "https://t.me/AP_Jake",
};

export const hero = {
  // Authored line breaks: these hold at every viewport, they are not wrapped.
  lines: ["ANDROID", "ENGINEER", "WHO BUILDS", "USEFUL THINGS"],
  // Mobile splits the last line so the type can stay large. See the design log.
  linesMobile: ["ANDROID", "ENGINEER", "WHO BUILDS", "USEFUL", "THINGS"],
  disciplines: ["Kotlin", "Compose", "Flutter"],
  proof: ["2M+ Downloads", "4 Yrs", "Da Nang, VN"],
};

export type Project = {
  index: string;
  name: string;
  description: string;
  detail: string;
  meta: string[];
  /** TODO: Play Store URLs still outstanding — see the design log. */
  href: string | null;
  /** TODO: real Play Store screenshot; slot is sized 1080x1920. */
  shot: string | null;
};

/**
 * Single source of truth for product facts. The three arrays below
 * (`projects`, `workGroups`, `caseStudies`) carry overlapping products but
 * have different shapes. They all read from this map so a fact stays in
 * sync across the homepage, the work page, and the case study.
 */
export type ProductFacts = {
  slug: string;
  name: string;
  oneLiner: string;
  period: string;
  company: string;
  downloads: string;
  platforms?: string;
  stack: string;
  /** External link target (Play Store, official site, or GitHub). */
  href: string | null;
  /** Local path under /public, e.g. "/shots/cdg-zig.webp". */
  screenshot?: string;
};

export const productFacts: Record<string, ProductFacts> = {
  "cdg-zig": {
    slug: "cdg-zig",
    name: "CDG Zig",
    oneLiner:
      "ComfortDelGro's taxi and bus booking app for Singapore. Behind the passenger app — booking, live driver tracking, fare estimates, multi-stop rides and cashless payment.",
    period: "Oct 2023 – Present",
    company: "Codigo",
    downloads: "1M+ Downloads",
    stack: "Kotlin · Compose · Maps SDK",
    href: "https://play.google.com/store/apps/details?id=com.codigo.comfort",
    screenshot: "/shots/cdg-zig.webp",
  },
  "gogoopo": {
    slug: "gogoopo",
    name: "GoGooPo",
    oneLiner:
      "A city guide for the Burmese community in Bangkok. One Flutter codebase across Android, iOS and web, with an API and data model I wrote myself so every surface reads the same content.",
    period: "Dec 2023 – Present",
    company: "Built and run by me",
    downloads: "",
    platforms: "Android · iOS · Web",
    stack: "Flutter · Ktor · MongoDB",
    href: "https://gogoopo.com/",
    // No screenshot yet — GoGooPo has no Play Store listing, and the gogoopo.com
    // hero asset is a 1360x1020 logo, not a phone capture. Falls back to the
    // placeholder bracket frame until a portrait screenshot is available.
  },
  "shwe-nar-sin": {
    slug: "shwe-nar-sin",
    name: "Shwe Nar Sin",
    oneLiner:
      "A Myanmar audiobook and music app. I built the music streaming feature — free and paid playback, with telco billing.",
    period: "Freelance",
    company: "Freelance",
    downloads: "1M+ Downloads · 4.4 Rating",
    stack: "Android · Kotlin",
    href: "https://play.google.com/store/apps/details?id=com.bit.shwenarsin",
    screenshot: "/shots/shwe-nar-sin.webp",
  },
  "jar-gyi": {
    slug: "jar-gyi",
    name: "Jar Gyi",
    oneLiner:
      "A personal debt tracker. Everything stays on the device — Room for storage, no account, no sync, and it works with no network at all.",
    period: "2025 — Now",
    company: "Built and run by me",
    downloads: "",
    platforms: "Android",
    stack: "Kotlin · Room · Offline only",
    href: "https://play.google.com/store/apps/details?id=com.apjake.akywesayin",
    screenshot: "/shots/jar-gyi.webp",
  },
  "fwd-sg": {
    slug: "fwd-sg",
    name: "FWD SG",
    oneLiner:
      "Life insurance on Android. Policy viewing, claims with document upload and biometric login. I also split the app into modules and cut its load time by about 25%.",
    period: "Oct 2022 – Oct 2023",
    company: "Codigo",
    downloads: "100K+ Downloads · 4.7 Rating",
    stack: "Kotlin",
    href: "https://play.google.com/store/apps/details?id=com.fwd.sg",
  },
  "better-hr": {
    slug: "better-hr",
    name: "Better HR",
    oneLiner:
      "Attendance, leave and payroll for Myanmar businesses. I was the only Android developer on it — every feature, every fix and every release was mine.",
    period: "Jun 2022 – Dec 2022",
    company: "Better HR",
    downloads: "100K+ Downloads",
    stack: "Kotlin",
    href: "https://play.google.com/store/apps/details?id=co.nexlabs.betterhr",
    screenshot: "/shots/better-hr.webp",
  },
  "aio-esports": {
    slug: "aio-esports",
    name: "AiO eSports",
    oneLiner:
      "A fan app for the Myanmar eSports scene — follow teams, players and casters, vote, and donate.",
    period: "Freelance",
    company: "Freelance",
    downloads: "",
    stack: "Android · Kotlin",
    href: "https://play.google.com/store/apps/details?id=com.confident.aiogaming",
  },
  "aio-partner": {
    slug: "aio-partner",
    name: "AiO Partner",
    oneLiner:
      "The companion app for the same ecosystem, letting teams manage their own profiles.",
    period: "Freelance",
    company: "Freelance",
    downloads: "",
    stack: "Android · Kotlin",
    href: "https://play.google.com/store/apps/details?id=mm.com.allinone.partner",
  },
  "hiking": {
    slug: "hiking",
    name: "Hiking",
    oneLiner:
      "A hiking notes app for a student client. Hive for local storage, so a trip stays saved and readable with no network.",
    period: "Nov 2023",
    company: "Freelance",
    downloads: "",
    platforms: "Android · iOS",
    stack: "Flutter · Hive",
    href: "https://github.com/APJake/android-hiking-notes-app",
  },
};

export const projects: Project[] = [
  {
    index: "01",
    name: productFacts["jar-gyi"].name,
    description: productFacts["jar-gyi"].oneLiner,
    detail:
      "Personal debt tracker. Room for local storage, no account, no network — every entry stays on the device.",
    meta: ["Android", "Kotlin · Room · Offline only", "Built and run by me · 2025 — Now"],
    href: productFacts["jar-gyi"].href,
    shot: productFacts["jar-gyi"].screenshot ?? null,
  },
  {
    index: "02",
    name: productFacts["cdg-zig"].name,
    description: productFacts["cdg-zig"].oneLiner,
    detail:
      "Integrated the in-app chat as a shared internal library used by both the passenger and driver apps.",
    meta: ["1M+ Downloads", "Kotlin · Compose · Maps SDK", "Codigo · Oct 2023 – Present"],
    href: "/work/cdg-zig/",
    shot: productFacts["cdg-zig"].screenshot ?? null,
  },
  {
    index: "03",
    name: productFacts["better-hr"].name,
    description: productFacts["better-hr"].oneLiner,
    detail: "Sole Android developer — every feature, every fix and every release was mine.",
    meta: ["100K+ Downloads", "Kotlin", "Better HR · Jun 2022 – Dec 2022"],
    href: productFacts["better-hr"].href,
    shot: productFacts["better-hr"].screenshot ?? null,
  },
  {
    index: "04",
    name: productFacts["shwe-nar-sin"].name,
    description: productFacts["shwe-nar-sin"].oneLiner,
    detail: "Freelance. One of the first products I shipped that went past a million installs.",
    meta: ["1M+ Downloads · 4.4 Rating", "Android · Kotlin", "Freelance"],
    href: productFacts["shwe-nar-sin"].href,
    shot: productFacts["shwe-nar-sin"].screenshot ?? null,
  },
];

export type Role = {
  years: string;
  yearsNote: string;
  company: string;
  role: string;
  place: string;
  detail?: string;
  products?: { name: string; years: string; text: string }[];
};

export type WorkEntry = {
  name: string;
  line: string;
  meta: string[];
  href: string | null;
};

export type WorkGroup = { title: string; note: string; entries: WorkEntry[] };

export type CaseStudy = {
  slug: string;
  name: string;
  tagline: string;
  facts: { label: string; value: string }[];
  intro: string;
  owns: string[];
  moves: { metric: string; metricNote: string; title: string; text: string }[];
  beyond: string;
  stack: { title: string; items: string[] }[];
};

/**
 * Written strictly from the CV. Where a figure is approximate there it stays
 * approximate here — "about 30%", not "30%".
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: "cdg-zig",
    name: "CDG Zig",
    tagline:
      "ComfortDelGro's taxi and bus booking app for Singapore, and the Android side of it I run.",
    facts: [
      { label: "Role", value: "Senior Android Developer" },
      { label: "Studio", value: "Codigo" },
      { label: "Period", value: "Oct 2023 – Present" },
      { label: "Scale", value: "1M+ downloads" },
    ],
    intro:
      "CDG Zig is how people in Singapore book a ComfortDelGro taxi or bus. I run the Android side — architecture, features, testing and releases — and care about leaving code the next developer can work with.",
    owns: [
      "Booking",
      "Live driver tracking on Google Maps",
      "Fare estimates",
      "Multi-stop rides",
      "Cashless payment",
    ],
    moves: [
      {
        metric: "~30%",
        metricNote: "faster screen rendering",
        title: "Moved the booking flow off XML and onto Compose",
        text: "I led the migration and rebuilt the main booking screens along the way. The rewrite paid for itself twice: a lot of duplicated UI code disappeared with it, and the screens people touch on every single trip got quicker to draw.",
      },
      {
        metric: "~20%",
        metricNote: "fewer crashes",
        title: "Brought the crash rate down, then kept it down",
        text: "Unit and UI tests where they were missing, then straight through the top Crashlytics issues in order. What made it stick was the habit rather than the fixes: crash and ANR reports get checked after every release, so a regression surfaces in days instead of in store reviews.",
      },
      {
        metric: "1 library",
        metricNote: "several teams build on it",
        title: "Pulled the shared pieces out into something reusable",
        text: "The network layer, the shared UI components and the common utilities were all going to be rewritten by whichever team needed them next. They are an internal library now, and other project teams build on it instead of starting again. It is the part of this work that outlives my tickets.",
      },
    ],
    beyond:
      "Alongside the code: I review the team's pull requests, keep the Android coding standards, and help newer developers get their work merged.",
    stack: [
      { title: "Language & UI", items: ["Kotlin", "Jetpack Compose", "XML Views", "Material 3"] },
      { title: "Platform", items: ["Google Maps SDK", "Coroutines & Flow", "ViewModel", "Navigation", "Room"] },
      { title: "Quality", items: ["JUnit", "MockK", "Compose UI tests", "Crashlytics", "Firebase Performance"] },
      { title: "Release", items: ["Gradle (Kotlin DSL)", "Play Console staged rollouts", "GitHub Actions"] },
    ],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}

/**
 * The full index behind the homepage's three. Jar Gyi is described from its
 * own privacy policy, which is the only material that exists for it.
 */
export const workGroups: WorkGroup[] = [
  {
    title: "Products I run",
    note: "Built on my own time, and still mine to keep running.",
    entries: [
      {
        name: productFacts["gogoopo"].name,
        line: productFacts["gogoopo"].oneLiner,
        meta: ["Android · iOS · Web", "Flutter · Ktor · MongoDB", "Dec 2023 – Present"],
        href: productFacts["gogoopo"].href,
      },
      {
        name: productFacts["jar-gyi"].name,
        line: productFacts["jar-gyi"].oneLiner,
        meta: ["Android", "Kotlin · Room · Offline only", "2025 — Now"],
        href: productFacts["jar-gyi"].href,
      },
    ],
  },
  {
    title: "Client & company work",
    note: "Products I shipped on, for a studio or a client.",
    entries: [
      {
        name: productFacts["cdg-zig"].name,
        line:
          "ComfortDelGro's taxi and bus booking app for Singapore. Behind the passenger app — led the move to Jetpack Compose, and built the internal library other project teams now reuse.",
        meta: ["1M+ Downloads", "Kotlin · Compose · Maps SDK", "Codigo · Oct 2023 – Present"],
        href: "/work/cdg-zig/",
      },
      {
        name: productFacts["fwd-sg"].name,
        line: productFacts["fwd-sg"].oneLiner,
        meta: ["100K+ Downloads · 4.7 Rating", "Kotlin", "Codigo · Oct 2022 – Oct 2023"],
        href: productFacts["fwd-sg"].href,
      },
      {
        name: productFacts["better-hr"].name,
        line: productFacts["better-hr"].oneLiner,
        meta: ["100K+ Downloads", "Kotlin", "Better HR · Jun 2022 – Dec 2022"],
        href: productFacts["better-hr"].href,
      },
      {
        name: productFacts["shwe-nar-sin"].name,
        line: productFacts["shwe-nar-sin"].oneLiner,
        meta: ["1M+ Downloads · 4.4 Rating", "Android · Kotlin", "Freelance"],
        href: productFacts["shwe-nar-sin"].href,
      },
      {
        name: productFacts["aio-esports"].name,
        line: productFacts["aio-esports"].oneLiner,
        meta: ["Android", "Kotlin", "Freelance"],
        href: productFacts["aio-esports"].href,
      },
      {
        name: productFacts["aio-partner"].name,
        line: productFacts["aio-partner"].oneLiner,
        meta: ["Android", "Kotlin", "Freelance"],
        href: productFacts["aio-partner"].href,
      },
      {
        name: productFacts["hiking"].name,
        line: productFacts["hiking"].oneLiner,
        meta: ["Android · iOS", "Flutter · Hive", "Freelance · Nov 2023"],
        href: productFacts["hiking"].href,
      },
    ],
  },
];

export const roles: Role[] = [
  {
    years: "Oct 2022 – Present",
    yearsNote: "Current",
    company: "Codigo",
    role: "Senior Android Developer",
    place: "Singapore product studio · remote from Da Nang",
    products: [
      {
        name: "CDG Zig",
        years: "Oct 2023 – Present",
        text: "Run the passenger app end to end. Led the migration from XML to Jetpack Compose, and built the internal Android library — network layer, shared UI, common utilities — that other project teams now reuse instead of rebuilding.",
      },
      {
        name: "FWD SG",
        years: "Oct 2022 – Oct 2023",
        text: "Policy viewing, claims with document upload, biometric login. Split a single-module app into multiple modules so the team could work in parallel, and cut app load time by about 25%.",
      },
    ],
  },
  {
    years: "Jun 2022 – Dec 2022",
    yearsNote: "Yangon",
    company: "Better HR",
    role: "Mid-Senior Android Developer",
    place: "Yangon, Myanmar · 100K+ downloads",
    detail:
      "The only Android developer on the product — features, fixes and every Play Store release were mine. Set up Git Flow and a proper release process, which got releases out about 25% faster, and shipped something new nearly every week across attendance, leave and payroll.",
  },
  {
    years: "Since 2019",
    yearsNote: "Ongoing",
    company: "Freelance",
    role: "Android & Flutter",
    place: "Myanmar · Thailand · Vietnam",
    detail:
      "Shwe Nar Sin, AiO eSports and AiO Partner for clients — plus the products I build and still run myself. This is where most of what I know about shipping actually came from.",
  },
];

export const recognition = [
  "ICPC 2019 Champion · Regional & National",
  "People's Choice · Hackathon Yangon 2018 · Dinger",
  "Computer Science · UCS Yangon",
];

/**
 * Derived totals. Anything that needs to say "nine products" or "2M+ downloads"
 * in JSX reads from here so the copy can never silently desync if the arrays
 * grow or the metric changes.
 */
export const totals = {
  products: workGroups.reduce((n, g) => n + g.entries.length, 0),
  downloads: "2M+",
};

export const library = {
  label: "The thing I am most pleased with",
  title: "An internal library other teams run on",
  text: "At Codigo I pulled the network layer, the shared UI components and the common utilities out of one product and into a library. Other project teams build on it now instead of starting from scratch. It is the part of my work that outlives the tickets I was assigned.",
};

export const capabilities = [
  {
    title: "Android",
    items: ["Kotlin", "Java", "Jetpack Compose", "XML Views", "Coroutines & Flow", "ViewModel", "Navigation", "Room", "DataStore", "WorkManager", "Material 3", "Maps SDK", "FCM", "Deep links"],
  },
  {
    title: "Cross-platform",
    items: ["Flutter (Android, iOS, Web)", "Dart", "Provider / Riverpod / Bloc", "go_router", "Dio", "Hive", "freezed", "Kotlin Multiplatform", "Platform channels"],
  },
  {
    title: "Architecture & quality",
    items: ["MVVM", "MVI", "Clean Architecture", "Multi-module apps", "Hilt / Dagger", "Retrofit & OkHttp", "JUnit", "MockK", "Espresso", "Compose UI tests", "Code review"],
  },
  {
    title: "Ship & monitor",
    items: ["Gradle (Kotlin DSL, flavours)", "GitHub Actions", "Fastlane", "R8 / ProGuard", "Play Console staged rollouts", "Crashlytics", "Firebase Performance", "Remote Config"],
  },
  {
    title: "Backend, when it is mine",
    items: ["Ktor", "Node.js", "MongoDB", "REST API design", "Firebase Auth", "Certificate pinning", "Biometric login", "Encrypted local storage"],
  },
];

export const contact = {
  headline: ["LET'S BUILD", "SOMETHING."],
  note: "Open to Android and Flutter roles in Vietnam, Thailand, or remote. The fastest way to reach me is email.",
};
