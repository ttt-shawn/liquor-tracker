// Single source of truth for the app version. Every release: bump APP_VERSION
// and add a CHANGELOG entry at the TOP. See VERSIONING.md.
var APP_VERSION = '1.5.0';
var CHANGELOG = [
 {version:'1.5.0', date:'2026-10-22', changes:['Optional Store field when you log a bottle, with suggestions from stores you\'ve already used','Store shows on each entry in the price log','Filter the log by store (All stores, each store, or No store), and it still sorts by Name, Size, Store, or $/oz','New Store sort groups entries by store, cheapest per ounce first within each','Backups now include the store; older backups and entries without a store still load fine','New FAQ entry on store tagging and filtering']},
 {version:'1.4.0', date:'2026-10-21', changes:['Version number shown at the bottom of the screen','What\'s New page with the full change log (tap the version)','One-time "Updated" note after each update']},
 {version:'1.3.1', date:'2026-10-21', changes:['Updates now load right away when you open the app (network-first offline cache)','Saved offline copy is only used when you have no signal']},
 {version:'1.3.0', date:'2026-10-21', changes:['Back Up to File: saves your log as a .json file via the share sheet (or Downloads)','Restore from File with Merge (skips duplicates) or Replace','Backup files are checked before loading, so a bad file can\'t wreck your log','New FAQ entries for backup and restore']},
 {version:'1.2.0', date:'2026-10-21', changes:['FAQ: tap the blue ? in the top right','Includes questions emailed in by users']},
 {version:'1.1.0', date:'2026-10-21', changes:['Sort the price log by Name, Size, or $/oz','Tap the same sort again to flip the order','Remembers your sort choice (cheapest per ounce first by default)']},
 {version:'1.0.0', date:'2026-10-21', changes:['Initial release','Live cost-per-ounce calculator','Bottle size presets (Nip, Half, Fifth, Liter, Handle) plus custom ml','Saved price log stored on your phone, with delete','Works offline and installs to your Home Screen with its own icon']}
];
if (typeof module !== 'undefined') module.exports = {APP_VERSION:APP_VERSION, CHANGELOG:CHANGELOG};
