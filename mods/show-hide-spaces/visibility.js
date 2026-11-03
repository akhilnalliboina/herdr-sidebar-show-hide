import { div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { shared, setShared } from "herdr";
import { PRUNE_AFTER_MS } from "./constants.js";

/**
 * Show/hide mode for a sidebar list: an eye in
 * the header starts the mode, every row then gets its own eye, and the header offers
 * discard and save. Discard puts back the hidden list from the moment the mode started.
 * The list is a shared value, so it survives a restart and both copies of a mod agree.
 */
export class Visibility {
  /** `folder`: the mod's own folder, where its eye icons are (`mods/<name>`). */
  constructor(key, folder) {
    this.key = key;
    this.folder = folder;
    this.editing = false;
    this.before = [];
  }

  hidden() {
    return new Set(shared(this.key) ?? []);
  }

  start() {
    this.before = [...this.hidden()];
    this.editing = true;
  }

  save() {
    this.editing = false;
  }

  discard() {
    setShared(this.key, this.before);
    this.editing = false;
  }

  /** Hiding a row takes `cascade` (the rows under it) along; showing it brings them back. */
  toggle(id, cascade = []) {
    const now = this.hidden();
    const keys = [id, ...cascade];
    if (now.has(id)) keys.forEach((k) => now.delete(k));
    else keys.forEach((k) => now.add(k));
    setShared(this.key, [...now]);
  }

  /**
   * Drops ids that have been gone for a minute, so a closed agent's address cannot hide a
   * new terminal that gets the same address later. The minute matters: right after a start,
   * or while a machine reconnects, the lists are briefly empty and everything looks gone.
   */
  prune(alive) {
    const now = shared(this.key) ?? [];
    const time = Date.now();
    this.missing ??= {};
    for (const id of now) if (alive.has(id)) delete this.missing[id];
    else this.missing[id] ??= time;
    const kept = now.filter((id) => !(time - (this.missing[id] ?? time) > PRUNE_AFTER_MS));
    if (kept.length !== now.length) setShared(this.key, kept);
  }

  /** The eye at the end of a row. A row under a hidden parent shows it but cannot change. */
  rowToggle(t, id, { cascade = [], locked = false } = {}) {
    const off = this.hidden().has(id);
    return div()
      .id(`eye-${id}`)
      .flex_none()
      .p(2)
      .rounded(4)
      .text_color(locked ? t.dim + "80" : off ? t.dim : t.muted)
      .when(!locked, (el) => el.cursor_pointer().hover((s) => s.bg(t.hover).text_color(t.foreground)))
      .tooltip(locked ? "Hidden with the row above" : off ? "Show" : "Hide")
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
      .on_click((_e, cx) => {
        cx.stop_propagation();
        if (locked) return;
        this.toggle(id, cascade);
        cx.notify();
      })
      .child(svg(`${this.folder}/${off ? "eye-off" : "eye"}.svg`).size(13));
  }

  /** The header button that starts the mode; it says how many rows are hidden. */
  startButton(t, count) {
    return h_flex()
      .id("eye-start")
      .flex_none()
      .gap(3)
      .px(4)
      .h(22)
      .items_center()
      .rounded(5)
      .text_size(11)
      .text_color(t.dim)
      .hover((s) => s.bg(t.hover).text_color(t.foreground))
      .tooltip(count ? `Show or hide rows (${count} hidden)` : "Show or hide rows")
      .on_click((_e, cx) => {
        this.start();
        cx.notify();
      })
      .child(svg(`${this.folder}/${count ? "eye-off" : "eye"}.svg`).size(13))
      .when(count > 0, (el) => el.child(String(count)));
  }

  /** The header while the mode is on: its name, then discard and save. */
  editHeader(t) {
    const button = (id, icon, tip, action) =>
      div()
        .id(id)
        .size(22)
        .flex_none()
        .flex()
        .items_center()
        .justify_center()
        .rounded(5)
        .text_color(t.muted)
        .hover((s) => s.bg(t.hover).text_color(t.foreground))
        .tooltip(tip)
        .on_click((_e, cx) => {
          action();
          cx.notify();
        })
        .child(svg(icon).size(13));
    return h_flex()
      .flex_1()
      .gap(6)
      .items_center()
      .child(svg(`${this.folder}/eye.svg`).size(13).text_color(t.dim))
      .child(div().flex_1().text_size(11.5).font_medium().text_color(t.foreground).child("Show/hide"))
      .child(button("eye-discard", "mods/workspace-chrome/x.svg", "Discard", () => this.discard()))
      .child(button("eye-save", "mods/workspace-chrome/check.svg", "Save", () => this.save()));
  }
}
