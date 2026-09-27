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
- `assets/` — demo video (`prism-demo-draft-09.mp4`, re-encoded at 1080p), its
  poster frame, and the social preview image.
- `vendor/auric-design/` — Auric Design 0.3.0, copied from the Auric website. Do
  not edit; update from the `auric-design` repo with `npm run sync`.

## Launch list

The form has no backend. `site.js` posts the address to
[FormSubmit](https://formsubmit.co), which emails it to
founders@auricsoftware.com. The endpoint is the `SIGNUP_ENDPOINT` constant.

**One-time activation:** the first submission sends an activation email to
founders@auricsoftware.com. Click the link in it; submissions are not delivered
until then (the form shows an error until the address is activated). After
activation, FormSubmit also offers a random alias you can use in place of the
address in `SIGNUP_ENDPOINT` to keep it out of the page source.

To switch to Formspree instead, create a form there that notifies
founders@auricsoftware.com and set `SIGNUP_ENDPOINT` to
`https://formspree.io/f/<form-id>`. Formspree returns `{ "ok": true }`, so change
the success check in `submitSignup` accordingly and drop the `_template` and
`_captcha` fields.

## Hosting

GitHub Pages publishes the root of `main`. `CNAME` holds the custom domain and
`.nojekyll` serves files as-is. DNS needs a CNAME record:

| Host | Type | Value |
| --- | --- | --- |
| `prism` | CNAME | `auric-software.github.io` |
