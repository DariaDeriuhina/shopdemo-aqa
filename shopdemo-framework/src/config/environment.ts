import { z } from 'zod';

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const origin = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash
    );
  }, 'BASE_URL must be an HTTP(S) origin without credentials, path, query or fragment');
const integer = (max: number) => z.coerce.number().int().min(1).max(max);
const env = z
  .object({
    BASE_URL: origin.default('http://127.0.0.1:3000'),
    START_WEB_SERVER: z.enum(['0', '1']).optional(),
    APP_MODE: z.enum(['development', 'production']).optional(),
    BROWSERS: z
      .string()
      .default('chromium')
      .transform((value) => value.split(',').map((s) => s.trim()))
      .pipe(z.array(z.enum(['chromium', 'firefox', 'webkit'])).nonempty())
      .transform((value) => [...new Set(value)]),
    WORKERS: integer(16).optional(),
    RETRIES: z.coerce.number().int().min(0).max(2).optional(),
  })
  .parse(process.env);
const url = new URL(env.BASE_URL);
const local = localHosts.has(url.hostname);
const startWebServer = env.START_WEB_SERVER === undefined ? local : env.START_WEB_SERVER === '1';
if (startWebServer && (!local || url.protocol !== 'http:')) {
  throw new Error(
    'The managed server requires a loopback HTTP BASE_URL; use START_WEB_SERVER=0 for an existing server.',
  );
}
export const environment = {
  baseURL: url.origin,
  startWebServer,
  port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
  hostname: url.hostname === '[::1]' ? '::1' : url.hostname,
  isCI: !!process.env.CI && !['0', 'false'].includes(process.env.CI),
  browsers: env.BROWSERS,
  workers: env.WORKERS,
  retries: env.RETRIES,
  appMode: env.APP_MODE,
};
