---
id: blog-3
language: en
default: true
date: 2026-01-10
---

# Notes from ICPC Yangon 2019

I competed in ICPC Yangon in 2019. Our team cleared the regional round
and got to the world finals in Porto. Here is what I took from it that
I did not expect to take from it, and that still shapes how I write
production code.

## The thing competitive programming is actually good at

It is not the algorithms. Those help. But the actual superpower ICPC
builds is the discipline of reading a problem until you can state the
constraint in one sentence, and then sitting with the hard part for
twenty minutes before writing a single line of code.

Most production bugs I have shipped share a shape: someone read the
ticket until the obvious part made sense, then started writing. The
hard part — the part that only became visible after you sat with it
for fifteen minutes — never got a name, and the bug shipped inside
the thing that handled the hard part.

## What the regional round actually tests

- Can you read a problem and split it into a part you understand and a
  part that is a known problem?
- Can you write a solution to the known part in twenty minutes that
  compiles first try?
- Can you debug a wrong answer on your own without a teammate
  explaining the bug to you?

That last one is the one I think about most. In ICPC you have
ninety seconds to debug. In a real on-call you have fifteen minutes
and a debugger attached, but the muscle is the same: form a
hypothesis, change one thing, run the test.

## What I would tell my younger self

- Spend a week on the easy problems until you cannot make them
  wrong. The first hour of every contest is deciding if you can trust
  your own templates, and if you cannot, the rest of the day is
  already lost.
- Type less. The teams that win are not the ones that solve the most
  hard problems. They are the ones that solve two medium problems
  with no wrong submissions.
- Read the problem twice. Then read the constraints. Then read the
  problem a third time. The constraint you missed is always the bug.

## What I did not learn

Anything about teamwork. ICPC teaches you to debug on your own. It
does not teach you to argue about design with someone who disagrees.
That part I had to learn the hard way, on a real Android team, on a
real PR review at 11pm.
