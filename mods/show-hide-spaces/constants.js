/** Shared value with the ids of hidden spaces. Shared values are kept across restarts. */
export const HIDDEN_KEY = "show-hide.spaces.hidden";

/** How long an id must be missing before the hidden list forgets it. */
export const PRUNE_AFTER_MS = 60000;
