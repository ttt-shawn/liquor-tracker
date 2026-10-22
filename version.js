// Single source of truth for the app version. Every release: bump APP_VERSION
// and add a CHANGELOG entry at the TOP. See VERSIONING.md.
var APP_VERSION = '1.3.1';
var CHANGELOG = [
 {version:'1.3.1', date:'2026-10-21', changes:['Updates now load right away when you open the app (network-first offline cache)','Saved offline copy is only used when you have no signal']},
 {version:'1.3.0', date:'2026-10-21', changes:['Back Up to File: saves your log as a .json file via the share sheet (or Downloads)','Restore from File with Merge (skips duplicates) or Replace','Backup files are checked before loading, so a bad file can\'t wreck your log','New FAQ entries for backup and restore']},
 {version:'1.2.0', date:'2026-10-21', changes:['FAQ: tap the blue ? in the top right','Includes questions emailed in by users']},
 {version:'1.1.0', date:'2026-10-21', changes:['Sort the price log by Name, Size, or $/oz','Tap the same sort again to flip the order','Remembers your sort choice (cheapest per ounce first by default)']},
 {version:'1.0.0', date:'2026-10-21', changes:['Initial release','Live cost-per-ounce calculator','Bottle size presets (Nip, Half, Fifth, Liter, Handle) plus custom ml','Saved price log stored on your phone, with delete','Works offline and installs to your Home Screen with its own icon']}
];
if (typeof module !== 'undefined') module.exports = {APP_VERSION:APP_VERSION, CHANGELOG:CHANGELOG};
