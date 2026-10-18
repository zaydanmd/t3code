// @effect-diagnostics nodeBuiltinImport:off -- These detection tests use real temporary files and the synchronous existence check used at Electron startup.
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { detectOmarchyGlass } from "./OmarchyGlass.ts";

describe("detectOmarchyGlass", () => {
  let home: string;

  beforeEach(() => {
    home = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "t3-omarchy-glass-"));
  });

  afterEach(() => {
    NodeFS.rmSync(home, { recursive: true, force: true });
  });

  const createToggle = (stateHome: string) => {
    const directory = NodePath.join(stateHome, "omarchy", "toggles", "hypr");
    NodeFS.mkdirSync(directory, { recursive: true });
    NodeFS.writeFileSync(NodePath.join(directory, "window-glassy.lua"), "");
  };

  it("detects an existing toggle on Linux", () => {
    createToggle(NodePath.join(home, ".local", "state"));
    expect(
      detectOmarchyGlass({ platform: "linux", env: { HOME: home }, exists: NodeFS.existsSync }),
    ).toBe(true);
  });

  it("returns false when the toggle is absent", () => {
    expect(
      detectOmarchyGlass({ platform: "linux", env: { HOME: home }, exists: NodeFS.existsSync }),
    ).toBe(false);
  });

  it.each(["darwin", "win32"] as const)("ignores an existing toggle on %s", (platform) => {
    createToggle(NodePath.join(home, ".local", "state"));
    expect(detectOmarchyGlass({ platform, env: { HOME: home }, exists: NodeFS.existsSync })).toBe(
      false,
    );
  });

  it("uses XDG_STATE_HOME instead of the home fallback", () => {
    const stateHome = NodePath.join(home, "custom-state");
    createToggle(NodePath.join(home, ".local", "state"));
    const env = { HOME: home, XDG_STATE_HOME: stateHome };
    expect(detectOmarchyGlass({ platform: "linux", env, exists: NodeFS.existsSync })).toBe(false);
    createToggle(stateHome);
    expect(detectOmarchyGlass({ platform: "linux", env, exists: NodeFS.existsSync })).toBe(true);
  });

  it("falls back to HOME/.local/state for empty XDG_STATE_HOME", () => {
    createToggle(NodePath.join(home, ".local", "state"));
    expect(
      detectOmarchyGlass({
        platform: "linux",
        env: { HOME: home, XDG_STATE_HOME: "" },
        exists: NodeFS.existsSync,
      }),
    ).toBe(true);
  });

  it("does not probe a relative path when both state home and HOME are missing", () => {
    expect(
      detectOmarchyGlass({
        platform: "linux",
        env: {},
        exists: () => {
          throw new Error("No absolute state directory is available");
        },
      }),
    ).toBe(false);
  });
});
