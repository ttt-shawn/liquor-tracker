# Versioning

The app uses semantic versioning: **MAJOR.MINOR.PATCH** (e.g. `1.3.1`).

- **MAJOR**: big overhauls, or changes to saved data/backup format that aren't backward compatible.
- **MINOR**: new features (reset PATCH to 0).
- **PATCH**: bug fixes, wording, styling, and small tweaks.

## Every release
1. Bump `APP_VERSION` in `version.js` (the single source of truth).
2. Add an entry at the **top** of `CHANGELOG` in `version.js`: `{version, date:'YYYY-MM-DD', changes:[...]}` in plain user-facing language.
3. That's it: the service worker cache name is `'liquor-' + APP_VERSION`, so bumping the version refreshes the offline cache. The footer label, What's New view (`#changelog`), and one-time update toast all read from `version.js`.
4. Run `node test.js` (checks version.js is consistent), commit, push.
