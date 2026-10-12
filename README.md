# prompt-enhancer

A Claude Code mod that rewrites a rough prompt into a clear one before you send it. Type what you mean, press a key, and the prompt box holds a version a model will understand the first time: the goal up front, your facts kept, nothing invented.

```
fix the login thing, its broken again after the refactor
```

becomes something like

```
Fix the login flow, which broke again after the recent refactor. Find what
the refactor changed in the login path, fix the cause, and confirm login
works again.
```

## Use it

**From the band above the prompt.** Type a draft, focus the band (`ctrl+x tab`) and pick one:

- `e` **Enhance**: replaces the draft with the rewrite so you can edit it before sending
- `s` **Enhance & send**: rewrites and sends straight away

While it works the band says *Enhancing prompt…*. An empty box is never sent to the model.

**From a command.**

```
/enhance <rough prompt>
```

The rewrite lands in the prompt box; press Enter to send or edit it first. If the box can't take it, the rewrite is printed instead.

## What the rewrite does

- Leads with the goal, in plain direct language
- Keeps every fact, file name, constraint and preference you gave, and never adds requirements you didn't state
- Makes vague asks specific only where your draft makes the meaning clear
- Stays proportionate: a one-liner becomes a few clear lines, not a template. No "You are an expert…", no headings, no filler
- Keeps your voice: first person stays first person

The draft is passed as text to rewrite, not instructions to follow. The rewrite is a Sonnet call at low effort (60 s timeout), which costs a little on each use. The full instructions are the `SYSTEM` prompt in `hooks/register.tsx`.

The band shares its space with other mods: it draws whatever is beneath it and adds its own row underneath, and stays out of the way while a survey is showing.

## Install

```
claude plugin marketplace add santiagoaugment/prompt-enhancer
claude plugin install prompt-enhancer@santi-mods --scope user
```

## Develop

```
claude plugin test .
```

The tests (`hooks/*.test.ts`) cover `/enhance`, both band buttons, the empty-draft guard and stacking with other mods' bands.

To ship a change: run the tests, bump the version in `.claude-plugin/plugin.json`, commit, tag `v<version>` and push it, then run `claude plugin marketplace update santi-mods` and `claude plugin update prompt-enhancer@santi-mods`.
