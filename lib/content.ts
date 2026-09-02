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
    href: "/work/jar-gyi/",
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
    href: "/work/better-hr/",
    shot: productFacts["better-hr"].screenshot ?? null,
  },
  {
    index: "04",
    name: productFacts["shwe-nar-sin"].name,
    description: productFacts["shwe-nar-sin"].oneLiner,
    detail: "Freelance. One of the first products I shipped that went past a million installs.",
    meta: ["1M+ Downloads · 4.4 Rating", "Android · Kotlin", "Freelance"],
    href: "/work/shwe-nar-sin/",
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
  /** External links — Play Store, official site, or source repo. At least one required. */
  links: { label: string; href: string }[];
  /** Optional gallery of paths under /public, e.g. ["/shots/cdg-zig.webp"]. */
  gallery?: string[];
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
    links: [{ label: "Open in Play Store", href: productFacts["cdg-zig"].href! }],
    gallery: productFacts["cdg-zig"].screenshot ? [productFacts["cdg-zig"].screenshot] : undefined,
  },
  {
    slug: "gogoopo",
    name: "GoGooPo",
    tagline: "A city guide for the Burmese community in Bangkok, in one Flutter codebase across Android, iOS and web.",
    facts: [
      { label: "Role", value: "Built and run by me" },
      { label: "Studio", value: "Solo" },
      { label: "Period", value: "Dec 2023 – Present" },
      { label: "Scale", value: "Android · iOS · Web" },
    ],
    intro:
      "GoGooPo is a city guide I built and still run for Burmese people living in Bangkok. One Flutter codebase serves the Android app, the iOS app and the web version, and I wrote the backend API and the MongoDB data model myself so every surface reads the same content.",
    owns: [
      "Flutter app (Android, iOS, Web)",
      "Ktor backend API",
      "MongoDB data model",
      "Firebase Remote Config",
      "Burmese & English localization",
    ],
    moves: [
      {
        metric: "3 platforms",
        metricNote: "1 Flutter codebase",
        title: "One codebase, three surfaces",
        text: "The same Dart ships to Android, iOS and the web. The layout was designed to reflow cleanly between phone and browser so I never had to maintain a parallel build.",
      },
      {
        metric: "1 model",
        metricNote: "MongoDB, all surfaces",
        title: "Wrote the data model and the API myself",
        text: "The backend and the MongoDB data model are mine, which means the app, the web and any future client read the same content without a translation layer in between.",
      },
      {
        metric: "0 rebuilds",
        metricNote: "for content changes",
        title: "Remote Config for live edits",
        text: "Firebase Remote Config handles the copy, the feature flags and the settings that change more often than the release cadence. Shipping a string change no longer needs a build.",
      },
    ],
    beyond: "Alongside the code: I keep the Burmese and English translations in sync and answer the support inbox myself.",
    stack: [
      { title: "Language & UI", items: ["Flutter", "Dart", "Responsive layouts"] },
      { title: "State & data", items: ["Provider", "MongoDB driver", "freezed"] },
      { title: "Backend", items: ["Ktor", "REST API", "Firebase Auth", "Firebase Remote Config"] },
    ],
    links: [{ label: "Open gogoopo.com", href: productFacts["gogoopo"].href! }],
  },
  {
    slug: "shwe-nar-sin",
    name: "Shwe Nar Sin",
    tagline: "A Myanmar audiobook and music app. I built the music streaming feature — free and paid, with telco billing.",
    facts: [
      { label: "Role", value: "Freelance Android Developer" },
      { label: "Studio", value: "Freelance" },
      { label: "Period", value: "Freelance" },
      { label: "Scale", value: "1M+ downloads · 4.4★" },
    ],
    intro:
      "Shwe Nar Sin is a Myanmar audiobook and music app with over a million downloads on Google Play. My part was the music streaming feature, with both free and paid playback and telco billing integrated for the Myanmar carriers.",
    owns: ["Music streaming player", "Free / paid playback", "Telco billing integration"],
    moves: [
      {
        metric: "1M+",
        metricNote: "downloads",
        title: "Music for over a million installs",
        text: "The music feature shipped into an app that has passed a million downloads on Google Play with a 4.4 star rating. It is one of the first products I shipped that reached that scale.",
      },
      {
        metric: "2 modes",
        metricNote: "free and paid",
        title: "Free and paid, with telco billing on the paid side",
        text: "The player handles the free stream and the paid stream as different code paths, with the carrier-billing flow on the paid side. The billing edge cases (interrupted streams, retries) were the part that ate the most time.",
      },
      {
        metric: "Android",
        metricNote: "native Kotlin",
        title: "Native Android, no Flutter",
        text: "Before GoGooPo this was a Kotlin project, and the player talks to the platform media APIs directly. That was the right call for tight audio control and reliable background playback.",
      },
    ],
    beyond: "A freelance project for a Myanmar client — my main contribution was the music feature end to end, from the player to the billing callback.",
    stack: [
      { title: "Language & platform", items: ["Kotlin", "Android Media APIs", "Foreground services"] },
      { title: "Streaming", items: ["HTTP streaming", "ExoPlayer-era playback", "Background audio"] },
      { title: "Billing", items: ["Telco carrier billing", "In-app callback handling"] },
    ],
    links: [{ label: "Open in Play Store", href: productFacts["shwe-nar-sin"].href! }],
    gallery: productFacts["shwe-nar-sin"].screenshot ? [productFacts["shwe-nar-sin"].screenshot] : undefined,
  },
  {
    slug: "jar-gyi",
    name: "Jar Gyi",
    tagline: "A personal debt tracker that keeps every record on the device. No account, no network, no surprises.",
    facts: [
      { label: "Role", value: "Built and run by me" },
      { label: "Studio", value: "Solo" },
      { label: "Period", value: "2025 — Now" },
      { label: "Scale", value: "Android" },
    ],
    intro:
      "Jar Gyi is a small debt-tracker I built for myself, then put on the Play Store. Everything you enter stays in the app's Room database on the device — there is no account, no server, and no network call carrying debt data anywhere.",
    owns: ["Debt record CRUD", "Local Room storage", "Offline-only operation", "Optional notifications for due dates"],
    moves: [
      {
        metric: "0 bytes",
        metricNote: "leave the device",
        title: "Privacy by construction",
        text: "There is no server in the architecture. The Room database, the export, the notifications — they all read and write on the device. The privacy policy I published with the listing is short because the data flow is short.",
      },
      {
        metric: "1 store",
        metricNote: "Room, no sync",
        title: "Single source of truth, on the device",
        text: "All debt records live in one Room database. No cloud mirror, no conflict resolution, no migration story. If you uninstall, the data is gone — that is intentional and it is in the policy.",
      },
      {
        metric: "0 required",
        metricNote: "permissions",
        title: "Crash reporting only, no ads, no tracking",
        text: "Firebase Crashlytics is on because the app has to keep working, but the policy is explicit: no debt data is sent, no ads are served, and Storage and Notifications are opt-in. Most features run with no permissions granted.",
      },
    ],
    beyond: "The privacy policy is the spec — every behaviour on this page is something the policy already promises.",
    stack: [
      { title: "Language & UI", items: ["Kotlin", "Jetpack Compose", "Material 3"] },
      { title: "Storage", items: ["Room", "Android internal storage"] },
      { title: "Operations", items: ["WorkManager (exports)", "Notifications (opt-in)"] },
      { title: "Reliability", items: ["Firebase Crashlytics (anonymised)"] },
    ],
    links: [{ label: "Open in Play Store", href: productFacts["jar-gyi"].href! }],
    gallery: productFacts["jar-gyi"].screenshot ? [productFacts["jar-gyi"].screenshot] : undefined,
  },
  {
    slug: "fwd-sg",
    name: "FWD SG",
    tagline: "FWD's life insurance app for Singapore, and the Android side I owned through its biggest rewrite.",
    facts: [
      { label: "Role", value: "Senior Android Developer" },
      { label: "Studio", value: "Codigo" },
      { label: "Period", value: "Oct 2022 – Oct 2023" },
      { label: "Scale", value: "100K+ downloads · 4.7★" },
    ],
    intro:
      "FWD SG is the life insurance app for Singapore. I owned the Android side for a year, building the policy and claims features, splitting the app into modules, and cutting load time along the way.",
    owns: ["Policy viewing", "Claims with document upload", "Biometric login", "Multi-module split", "Startup performance"],
    moves: [
      {
        metric: "100K+",
        metricNote: "downloads · 4.7★",
        title: "100K+ installs, 4.7-star app",
        text: "FWD SG is one of the bigger apps in the portfolio by Play Store reach — 100K+ downloads, 4.7 star average. The features I built are the ones people use most on the app.",
      },
      {
        metric: "~25%",
        metricNote: "faster cold start",
        title: "Cut app load time by about 25%",
        text: "Deprecated libraries were the obvious weight, but the real wins were the slow startup code paths. Replaced the worst offenders and the app got to its first screen about 25% faster.",
      },
      {
        metric: "1 → many",
        metricNote: "modules",
        title: "Split a monolith so the team could move in parallel",
        text: "FWD SG started life as a single-module app, and parallel work was painful. I split it into modules by feature, which let the team merge into different surfaces at the same time without colliding.",
      },
    ],
    beyond: "I worked under the Codigo banner for both CDG Zig and FWD SG; FWD SG is the earlier of the two.",
    stack: [
      { title: "Language & UI", items: ["Kotlin", "XML Views", "Material 3"] },
      { title: "Architecture", items: ["Multi-module Gradle", "MVVM", "Hilt"] },
      { title: "Quality", items: ["JUnit", "MockK", "Espresso", "Crashlytics"] },
      { title: "Security", items: ["Biometric login", "Certificate pinning", "Encrypted local storage"] },
    ],
    links: [{ label: "Open in Play Store", href: productFacts["fwd-sg"].href! }],
  },
  {
    slug: "better-hr",
    name: "Better HR",
    tagline: "Attendance, leave and payroll for Myanmar businesses, and the only Android seat on the project.",
    facts: [
      { label: "Role", value: "Mid-Senior Android Developer" },
      { label: "Studio", value: "Better HR" },
      { label: "Period", value: "Jun 2022 – Dec 2022" },
      { label: "Scale", value: "100K+ downloads" },
    ],
    intro:
      "Better HR is an attendance, leave and payroll app for Myanmar businesses with 100K+ downloads. I was the only Android developer on the product — every feature, every fix, and every Play Store release was mine.",
    owns: ["Attendance tracking", "Leave management", "Payroll flows", "Release pipeline", "Git Flow setup"],
    moves: [
      {
        metric: "1",
        metricNote: "Android seat",
        title: "The only Android developer on the product",
        text: "Better HR's Android side had a single seat. Every feature, every bug fix and every release — mine. The cost of that was context-switching across the whole app; the upside was full ownership of the code that shipped.",
      },
      {
        metric: "~25%",
        metricNote: "faster releases",
        title: "Set up Git Flow and a proper release process",
        text: "Releases were ad-hoc when I arrived. I introduced Git Flow, replaced the deprecated libraries, and got a release cadence in place. Releases went out about 25% faster after the cleanup.",
      },
      {
        metric: "Weekly",
        metricNote: "feature cadence",
        title: "Shipped a new feature nearly every week",
        text: "Across attendance, leave and payroll I worked with the product team to ship something new almost every week. That pace was the test that the new release process actually held.",
      },
    ],
    beyond: "A solo Android role in Yangon — the first job where I owned the whole client-side of a product.",
    stack: [
      { title: "Language & UI", items: ["Kotlin", "XML Views", "Material 3"] },
      { title: "Architecture", items: ["MVVM", "Modularisation", "Hilt"] },
      { title: "Build & release", items: ["Git Flow", "Play Console staged rollouts", "Gradle"] },
      { title: "Reliability", items: ["Crashlytics", "JUnit", "Espresso"] },
    ],
    links: [{ label: "Open in Play Store", href: productFacts["better-hr"].href! }],
    gallery: productFacts["better-hr"].screenshot ? [productFacts["better-hr"].screenshot] : undefined,
  },
  {
    slug: "aio-esports",
    name: "AiO eSports",
    tagline: "A fan app for the Myanmar eSports scene — follow teams, players and casters, vote, and donate.",
    facts: [
      { label: "Role", value: "Freelance Android Developer" },
      { label: "Studio", value: "Freelance" },
      { label: "Period", value: "Freelance" },
      { label: "Scale", value: "Android" },
    ],
    intro:
      "AiO eSports is a fan app for the Myanmar eSports scene. It lets the community follow teams, players and casters, vote on matches, and donate to the people they support.",
    owns: ["Team & player profiles", "Voting", "Donation flow", "Caster directory"],
    moves: [
      {
        metric: "1 scene",
        metricNote: "Myanmar eSports",
        title: "Built for the local community",
        text: "The app is shaped around the teams, players and casters that exist in the Myanmar eSports scene specifically — the profile model, the vote surfaces and the donation flow are all built around that audience.",
      },
      {
        metric: "4 surfaces",
        metricNote: "teams · players · casters · fans",
        title: "Follow, vote, donate — the three core actions",
        text: "Three of the four entities (team, player, caster) are first-class content types with their own profile pages. Fans are the people who take the fourth action: follow, vote or donate.",
      },
      {
        metric: "1 store",
        metricNote: "Android",
        title: "Native Android, no Flutter",
        text: "Shipped as a native Android app, before Flutter was part of my stack. The donation flow went through Play's billing APIs.",
      },
    ],
    beyond: "A freelance project for a Myanmar client; the companion app, AiO Partner, lets the teams themselves manage their profiles.",
    stack: [
      { title: "Language & UI", items: ["Kotlin", "Android Views"] },
      { title: "Backend integration", items: ["REST client", "Play Billing (donations)"] },
      { title: "Reliability", items: ["Crashlytics", "Play Console staged rollouts"] },
    ],
    links: [{ label: "Open in Play Store", href: productFacts["aio-esports"].href! }],
  },
  {
    slug: "aio-partner",
    name: "AiO Partner",
    tagline: "The companion app for the AiO ecosystem — teams and talent manage their own profiles from the same backend.",
    facts: [
      { label: "Role", value: "Freelance Android Developer" },
      { label: "Studio", value: "Freelance" },
      { label: "Period", value: "Freelance" },
      { label: "Scale", value: "Android" },
    ],
    intro:
      "AiO Partner is the companion app to AiO eSports, built for the teams and the talent on the other side of the fan flow. Same backend, different audience.",
    owns: ["Team self-service", "Talent self-service", "Profile editing", "Content publishing"],
    moves: [
      {
        metric: "1 model",
        metricNote: "shared with the fan app",
        title: "Reuses the same backend as AiO eSports",
        text: "The same content model that powers the fan app's profile pages drives this one in reverse — teams and talent write to it, fans read from it. Auth and roles are what separates the two clients.",
      },
      {
        metric: "2 audiences",
        metricNote: "teams · talent",
        title: "Teams and talent in one app",
        text: "Two user kinds, one app. Teams manage rosters and updates; casters and players manage their individual profiles. The same app is the right tool because the underlying actions are the same.",
      },
      {
        metric: "1 store",
        metricNote: "Android",
        title: "Native Android, no Flutter",
        text: "Shipped as a native Android app alongside AiO eSports. Shared patterns, shared tooling, shared release process.",
      },
    ],
    beyond: "Same freelance engagement as AiO eSports; the two apps were always designed to ship together.",
    stack: [
      { title: "Language & UI", items: ["Kotlin", "Android Views"] },
      { title: "Backend integration", items: ["REST client", "Shared auth"] },
      { title: "Reliability", items: ["Crashlytics", "Play Console staged rollouts"] },
    ],
    links: [{ label: "Open in Play Store", href: productFacts["aio-partner"].href! }],
  },
  {
    slug: "hiking",
    name: "Hiking",
    tagline: "A hiking-notes app for a student client. Hive keeps every trip saved and readable with no network.",
    facts: [
      { label: "Role", value: "Freelance Flutter Developer" },
      { label: "Studio", value: "Freelance (student client)" },
      { label: "Period", value: "Nov 2023" },
      { label: "Scale", value: "Android · iOS" },
    ],
    intro:
      "Hiking is a small Flutter app I built for a student client — a place to write down hiking trips and read them back later. Hive stores everything locally, so the app works in the places the network does not.",
    owns: ["Trip notes editor", "Hive local storage", "Offline-first reading"],
    moves: [
      {
        metric: "0",
        metricNote: "network calls",
        title: "Offline by design",
        text: "Hive is the database, the API does not exist. Every trip you write is on the device; the app is fully usable in the field, on the trail, with no signal.",
      },
      {
        metric: "1 store",
        metricNote: "Hive (NoSQL)",
        title: "Lightweight local storage for a small app",
        text: "Hive was the right size for this product — a small, typed, on-device store. No schema migrations, no backend, no sync code to maintain.",
      },
      {
        metric: "2 platforms",
        metricNote: "Android · iOS",
        title: "One Flutter codebase, two stores",
        text: "Shipped to Android and iOS from one Flutter codebase, and submitted to both stores. The student client got a real cross-platform delivery, not a port.",
      },
    ],
    beyond: "A small freelance engagement for a student — a good reminder that 'small' still gets the full release treatment.",
    stack: [
      { title: "Language & UI", items: ["Flutter", "Dart"] },
      { title: "State & data", items: ["Hive", "Provider"] },
      { title: "Release", items: ["Play Console", "App Store Connect", "Flutter build pipeline"] },
    ],
    links: [{ label: "View on GitHub", href: productFacts["hiking"].href! }],
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
        href: "/work/gogoopo/",
      },
      {
        name: productFacts["jar-gyi"].name,
        line: productFacts["jar-gyi"].oneLiner,
        meta: ["Android", "Kotlin · Room · Offline only", "2025 — Now"],
        href: "/work/jar-gyi/",
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
        href: "/work/fwd-sg/",
      },
      {
        name: productFacts["better-hr"].name,
        line: productFacts["better-hr"].oneLiner,
        meta: ["100K+ Downloads", "Kotlin", "Better HR · Jun 2022 – Dec 2022"],
        href: "/work/better-hr/",
      },
      {
        name: productFacts["shwe-nar-sin"].name,
        line: productFacts["shwe-nar-sin"].oneLiner,
        meta: ["1M+ Downloads · 4.4 Rating", "Android · Kotlin", "Freelance"],
        href: "/work/shwe-nar-sin/",
      },
      {
        name: productFacts["aio-esports"].name,
        line: productFacts["aio-esports"].oneLiner,
        meta: ["Android", "Kotlin", "Freelance"],
        href: "/work/aio-esports/",
      },
      {
        name: productFacts["aio-partner"].name,
        line: productFacts["aio-partner"].oneLiner,
        meta: ["Android", "Kotlin", "Freelance"],
        href: "/work/aio-partner/",
      },
      {
        name: productFacts["hiking"].name,
        line: productFacts["hiking"].oneLiner,
        meta: ["Android · iOS", "Flutter · Hive", "Freelance · Nov 2023"],
        href: "/work/hiking/",
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
