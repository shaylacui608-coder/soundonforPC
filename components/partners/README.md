# Artist ocean — Scheme 1

Two independent presentation modes share the same ocean and local artwork:

- Featured artist + ocean: http://127.0.0.1:8774/?ocean=spotlight#partners
- Plain image ocean: http://127.0.0.1:8774/?ocean=plain#partners

The bottom “Explore the ocean” / “Meet the artists” button switches modes without reloading; the URL retains the mode on refresh. To make plain the permanent default, change the iframe's mode in ../../index.html to plain and initialize the parent app's mode from `ocean || 'plain'`. No carousel code needs deleting.

All artwork is copied locally from Desktop/logos/06-Artist-showcase. All 24 featured names and pictures match the official homepage showcase; see ARTISTS.md. The same artists.json drives both the featured portrait and the ocean tiles. The section's background is #F3F3F1. Motion pauses on hover/focus, when out of view, and in hidden tabs; reduced-motion preference starts paused. WebGL failure uses a static image grid.

Before this addition the parent index.html, style.css and app.js were backed up under ../../backups/before-partners-ocean/. These are historical snapshots: do not restore them over subsequent unrelated edits; remove just the partners section, its appended CSS and appended parent messaging handler to remove this feature.
