---
id: blog-1
language: en
default: true
date: 2026-04-15
updatedAt: 2026-04-20
---

# Building CDG Zig's booking flow in Compose

The booking flow on CDG Zig used to be ten XML layouts and a stack of
fragments. Picking a destination, choosing a vehicle, confirming the
fare, watching the driver on the map — every screen was its own little
island. There was a lot of duplicated UI code, and the screens people
touch on every single trip were slower to draw than they needed to be.

## Why we moved

There were two reasons. The first was that the booking flow was the
single most-touched surface in the app, and the second was that the
new screens we wanted to add (multi-stop rides, fare estimates) did not
fit the old layouts at all without forcing a lot of awkward XML into
the hierarchy.

> Compose was the right call not because XML is bad — it is not — but
> because state-driven UI maps onto booking state much more naturally
> when you can read the screen as a function of the booking object.

## What I changed

- Replaced the five `Fragment` classes for the booking flow with a
  single `NavHost` and a stack of `Composable` screens.
- Pulled the shared pieces (date pickers, payment rows, address cards)
  out into a small library the rest of the app already uses.
- Moved map interactions off `MapView` and onto the new Compose
  interop layer, which let us drop the lifecycle glue that used to
  live in every screen.

## The numbers

| Metric | Before | After |
|---|---|---|
| Screen render (p95) | 180 ms | 125 ms |
| Crash rate (per 1k) | 0.41 | 0.33 |
| Lines of UI code | 3,200 | 1,840 |

The crash-rate number was the part I cared about most. Compose did not
magically fix the crashes — the team wrote the unit and UI tests that
had been missing, and the team triaged the top Crashlytics issues. What
made the change stick was the habit: crash and ANR reports get checked
after every release, so a regression surfaces in days instead of
weeks.

## What I would do differently

I would have started with the design system, not the screens. The
first three weeks of the migration were spent building the same
buttons and rows that already existed in two other parts of the app.
Pulling the shared pieces out first would have cut the migration time
roughly in half.
