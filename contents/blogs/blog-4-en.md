---
id: blog-4
language: en
default: true
date: 2026-10-19
---

# Shipping one Android app in English, Myanmar and Thai

Translating an app sounds like a strings job: copy `strings.xml`, hand
it to someone who speaks the language, done. Then the Myanmar build
clips half its buttons, the Thai build breaks a word in the middle of a
syllable, and a "1 items" shows up in English. Here is what I check now
whenever an app has to speak English, Myanmar and Thai.

## Strings: one folder per language, no concatenation

- `values/` holds English, which is also the fallback for anything
  missing. `values-my/` is Myanmar and `values-th/` is Thai.
- Never build a sentence out of pieces. "Paid " + name + " today" only
  works in English; Myanmar and Thai put the verb and the name in a
  different order. Use one string with placeholders:
  `<string name="paid_today">Paid %1$s today</string>`.
- Give translators context with a comment above each string. "Back" as
  a button and "back" as a body part are two different words in Thai.

## Plurals are not the same everywhere

English needs `one` and `other`. Myanmar and Thai do not change the noun
for quantity, so they only use `other`. Declare plurals properly anyway,
so each language gets the rules it needs:

```xml
<plurals name="items_count">
    <item quantity="one">%d item</item>
    <item quantity="other">%d items</item>
</plurals>
```

In `values-my/` and `values-th/` the same entry has a single `other`
item. Calling `pluralStringResource(R.plurals.items_count, n, n)` then
does the right thing in all three.

## Letting people pick the language

Many people in Myanmar and Thailand keep their phone in English but
would rather read an app in their own language, or the other way
round. Android 13 added per-app language settings, and AppCompat
brings the same API to older versions:

```kotlin
AppCompatDelegate.setApplicationLocales(
    LocaleListCompat.forLanguageTags("my")
)
```

Add a `locales_config.xml` listing `en`, `my` and `th`, and the app also
shows up in the system's App languages screen.

## The script is the hard part

> Translation gets the words right. Typography decides whether
> anyone can actually read them.

- **Unicode, not Zawgyi.** Older Myanmar content is often in Zawgyi, a
  font hack that reuses Unicode code points. Store and ship Unicode
  only, and convert any imported text before it reaches the database.
- **Taller glyphs.** Myanmar and Thai stack marks above and below the
  line. Fixed heights and tight `lineHeight` values clip them, so let
  text measure itself and test with the longest string.
- **No spaces between words.** Neither language puts spaces between
  words, so line breaking needs a dictionary. Android handles it, but
  only if you don't force `maxLines = 1` with ellipsis on body text.
- **Numbers and dates.** Format them with the user's locale
  (`NumberFormat`, `DateTimeFormatter`) instead of hand-written
  patterns; Thai devices may use the Buddhist calendar year.

## Testing it

Turn on pseudo-locales to catch hard-coded text and layouts that can't
grow. Take a screenshot of every main screen in all three languages.
And before release, have a native speaker read the app on a real
phone — not just the spreadsheet of strings.

## What I would do differently

I would add the Myanmar and Thai folders on day one, even with just
placeholder text. Every layout built against English alone has to be
fixed later, and that is always slower than building it to stretch
from the start.
