// The only place the GitHub Pages address lives. Override with SITE_URL when the repo moves.
export const SITE_URL = (process.env.SITE_URL || "https://alinazariii.github.io/Paavaraghi/").replace(/\/?$/, "/");
export const BASE_PATH = new URL(SITE_URL).pathname;
export const docsRoot = new URL("../docs/", import.meta.url).pathname;
