# apjake.github.io

Content for the personal site of Aung Min Khant, an Android engineer:
https://apjake.github.io

The site's source code is private. This repo holds:

| Path | What it is |
| --- | --- |
| `contents/blogs/` | Blog posts, one `blog-N-LL.md` per language. `README.md` there is the index. |
| `public/blogs/` | Blog cover images, served at `/blogs/<id>/cover.jpg` |
| `policies/` | App privacy policies, served at `/policies/…` |
| `index.html`, `page.html`, `test.html`, `css/`, `js/`, `img/` | The old hand-written site, kept for reference |

The built site lives on the `gh-pages` branch, and GitHub Pages serves that
branch. Don't edit it by hand: every deploy replaces it.

A push to `main` that touches `contents/`, `public/blogs/` or `policies/` runs
`.github/workflows/notify-build.yml`, which tells the private repo to rebuild
and redeploy.
