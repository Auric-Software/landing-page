# Prism landing page

Static launch page for Prism, served by GitHub Pages at
https://prism.auricsoftware.com. No build step or dependencies.

## Preview

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Files

- `index.html` — copy and structure.
- `styles.css` — page layout; colors, fonts, spacing, and motion come from the
  vendored Auric design tokens.
- `site.js` — launch-list form, entrance reveals, demo video controls.
- `assets/` — approved draft 13 demo video (1080p, 60 fps), its matching
  poster frame, and the social preview image. The video and poster were copied
  from `../prism-latest/artifacts/demo/draft-13/`. The filenames include
  `draft-13` to avoid stale GitHub Pages asset caches; query strings alone
  did not refresh the video. Legacy filenames remain for cached page copies.
- `vendor/auric-design/` — Auric Design 0.3.0, copied from the Auric website. Do
  not edit; update from the `auric-design` repo with `npm run sync`.

## Launch list

The form has no backend. `site.js` posts the address to
[FormSubmit](https://formsubmit.co), which emails it to
founders@auricsoftware.com. The endpoint is the `SIGNUP_ENDPOINT` constant, which
uses FormSubmit's alias for that address so the address isn't in the page source.

founders@auricsoftware.com is a Google Group. It must allow posts from anyone on
the web (which also requires the organization-wide Groups for Business setting
allowing incoming email from outside the organization); otherwise Gmail bounces
FormSubmit's messages as "NoSuchUser". If the recipient changes, submit to
`https://formsubmit.co/ajax/<new address>` once, click the activation link
FormSubmit emails, and use the alias it provides.

## Hosting

GitHub Pages publishes the root of `main`. `CNAME` holds the custom domain and
`.nojekyll` serves files as-is. DNS needs a CNAME record:

| Host | Type | Value |
| --- | --- | --- |
| `prism` | CNAME | `auric-software.github.io` |
