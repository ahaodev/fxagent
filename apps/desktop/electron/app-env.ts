/**
 * Reads a desktop environment knob. The name is FXAGENT_<NAME>; the legacy PI_APP_<NAME>
 * is honored when the new name is unset, so existing launch scripts and shells keep working.
 */
export function readAppEnv(name: string, env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env[`FXAGENT_${name}`] ?? env[`PI_APP_${name}`];
}
