# Sadia Akbar Beg — Portfolio

Static site (HTML, CSS, vanilla JS). No build step.

## Add contact details
Open `script.js` and fill in `CONTACT` at the top. The buttons stay hidden until you do.

```js
const CONTACT = { email: 'name@example.com', linkedin: 'https://www.linkedin.com/in/...' };
```

## Publish on GitHub Pages
Push `index.html`, `style.css`, `script.js` and `.nojekyll`, then
Settings → Pages → Deploy from a branch → `main` / `(root)`.

Preview locally with `python3 -m http.server 8000`.
