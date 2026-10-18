export const OMARCHY_GLASS_ARGUMENT = "--t3code-omarchy-glass";

export function detectOmarchyGlass(input: {
  readonly platform: NodeJS.Platform;
  readonly env: NodeJS.ProcessEnv;
  readonly exists: (path: string) => boolean;
}): boolean {
  if (input.platform !== "linux") return false;
  const stateHome =
    input.env.XDG_STATE_HOME || (input.env.HOME ? `${input.env.HOME}/.local/state` : undefined);
  return (
    stateHome !== undefined && input.exists(`${stateHome}/omarchy/toggles/hypr/window-glassy.lua`)
  );
}
