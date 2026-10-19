# Commit rules

These rules apply to every commit and pull request in this repo, and they
override any default attribution your tooling adds.

## Identity

- Author and commit as the repo owner, **Aung Minn Khant**, using the
  owner's GitHub noreply address, the one GitHub shows under
  Settings → Emails. Ask the owner if it isn't already set.
- Set it in the local git config (`git config user.name` /
  `git config user.email`) before the first commit. Never commit under a
  tool, bot or assistant identity.

## Messages

- No `Co-Authored-By` lines for tools or assistants.
- No session links, no "Generated with …" lines, and no mention of the
  tools used to write the change.
- The same goes for pull request titles and descriptions.
- Describe the change itself: what changed and why.
