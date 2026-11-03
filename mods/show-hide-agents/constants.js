/** Shared value with the addresses of hidden agents. Shared values are kept across restarts. */
export const HIDDEN_KEY = "show-hide.agents.hidden";

/** How long an id must be missing before the hidden list forgets it. */
export const PRUNE_AFTER_MS = 60000;

/**
 * Shared on/off value: hidden rows are shown, dimmed, in both lists. One key flips it for
 * Spaces and Agents together, so it lives outside either list's hidden key.
 */
export const REVEAL_KEY = "show-hide.reveal";
