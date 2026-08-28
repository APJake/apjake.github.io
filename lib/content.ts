/**
 * Single source of truth for every string on the page.
 * Everything here is drawn from the CV — nothing is invented.
 */

export const person = {
  wordmark: "JAKE",
  name: "Aung Min Khant",
  role: "Android Engineer",
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

export const projects: Project[] = [
  {
    index: "01",
    name: "CDG Zig",
    description:
      "ComfortDelGro's taxi and bus booking app for Singapore. I own the passenger app end to end — booking, live driver tracking, fare estimates, multi-stop rides and cashless payment.",
    detail:
      "Led the migration from XML layouts to Jetpack Compose. Screen rendering about 30% faster, crash rate down about 20%.",
    meta: ["1M+ Downloads", "Kotlin · Compose · Maps SDK", "Codigo · 2023 — Now"],
    href: null,
    shot: null,
  },
  {
    index: "02",
    name: "BKK Guide MM",
    description:
      "A city guide for the Burmese community in Bangkok. One Flutter codebase across Android, iOS and web — and the backend is mine too.",
    detail:
      "Wrote the API and MongoDB data model myself, so the app and the web version run on the same content. Burmese and English throughout.",
    meta: ["Android · iOS · Web", "Flutter · Ktor · MongoDB", "Built and run by me · 2023 — Now"],
    href: null,
    shot: null,
  },
  {
    index: "03",
    name: "Shwe Nar Sin",
    description:
      "A Myanmar audiobook and music app. I built the music streaming feature — free and paid playback, with telco billing.",
    detail: "Freelance. One of the first products I shipped that went past a million installs.",
    meta: ["1M+ Downloads · 4.4 Rating", "Android · Kotlin", "Freelance"],
    href: null,
    shot: null,
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
        name: "BKK Guide MM",
        line: "A city guide for the Burmese community in Bangkok. One Flutter codebase across Android, iOS and web, with an API and data model I wrote myself so every surface reads the same content.",
        meta: ["Android · iOS · Web", "Flutter · Ktor · MongoDB", "2023 — Now"],
        href: null,
      },
      {
        name: "Jar Gyi",
        line: "A personal debt tracker. Everything stays on the device — Room for storage, no account, no sync, and it works with no network at all.",
        meta: ["Android", "Kotlin · Room · Offline only", "2025 — Now"],
        href: null,
      },
    ],
  },
  {
    title: "Client & company work",
    note: "Products I owned or shipped features on, for a studio or a client.",
    entries: [
      {
        name: "CDG Zig",
        line: "ComfortDelGro's taxi and bus booking app for Singapore. I own the passenger app end to end, led its move to Jetpack Compose, and built the internal library other project teams now reuse.",
        meta: ["1M+ Downloads", "Kotlin · Compose · Maps SDK", "Codigo · 2023 — Now"],
        href: null,
      },
      {
        name: "FWD SG",
        line: "Life insurance on Android. Policy viewing, claims with document upload and biometric login. I also split the app into modules and cut its load time by about 25%.",
        meta: ["100K+ Downloads · 4.7 Rating", "Kotlin", "Codigo · 2022 — 2023"],
        href: null,
      },
      {
        name: "Better HR",
        line: "Attendance, leave and payroll for Myanmar businesses. I was the only Android developer on it — every feature, every fix and every release was mine.",
        meta: ["100K+ Downloads", "Kotlin", "Better HR · 2022"],
        href: null,
      },
      {
        name: "Shwe Nar Sin",
        line: "A Myanmar audiobook and music app. I built the music streaming feature, covering free and paid playback with telco billing.",
        meta: ["1M+ Downloads · 4.4 Rating", "Android · Kotlin", "Freelance"],
        href: null,
      },
      {
        name: "AiO eSports",
        line: "A fan app for the Myanmar eSports scene — follow teams, players and casters, vote, and donate.",
        meta: ["Android", "Kotlin", "Freelance"],
        href: null,
      },
      {
        name: "AiO Partner",
        line: "The companion app for the same ecosystem, letting teams manage their own profiles.",
        meta: ["Android", "Kotlin", "Freelance"],
        href: null,
      },
      {
        name: "Hiking",
        line: "A hiking notes app for a student client. Hive for local storage, so a trip stays saved and readable with no network.",
        meta: ["Android · iOS", "Flutter · Hive", "Freelance · 2023"],
        href: null,
      },
    ],
  },
];

export const roles: Role[] = [
  {
    years: "2022 — Now",
    yearsNote: "Current",
    company: "Codigo",
    role: "Senior Android Developer",
    place: "Singapore product studio · remote from Da Nang",
    products: [
      {
        name: "CDG Zig",
        years: "2023 — Now",
        text: "Own the passenger app end to end. Led the migration from XML to Jetpack Compose, and built the internal Android library — network layer, shared UI, common utilities — that other project teams now reuse instead of rebuilding.",
      },
      {
        name: "FWD SG",
        years: "2022 — 2023",
        text: "Policy viewing, claims with document upload, biometric login. Split a single-module app into multiple modules so the team could work in parallel, and cut app load time by about 25%.",
      },
    ],
  },
  {
    years: "2022",
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
  "People's Choice · Hackathon Yangon 2018",
  "Computer Science · UCS Yangon",
];

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
