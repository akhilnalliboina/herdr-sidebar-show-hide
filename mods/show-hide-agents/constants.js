/** Shared value with the addresses of hidden agents. Shared values are kept across restarts. */
export const HIDDEN_KEY = "show-hide.agents.hidden";

/** How long an id must be missing before the hidden list forgets it. */
export const PRUNE_AFTER_MS = 60000;
