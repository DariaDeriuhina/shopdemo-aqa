import type { ConsoleMessage, Page, Request, Response } from '@playwright/test';

type Event = {
  kind: string;
  elapsedMs: number;
  message?: string;
  url?: string;
  method?: string;
  status?: number;
};
export function startBrowserDiagnostics(page: Page) {
  const events: Event[] = [];
  const started = Date.now();
  let dropped = 0;
  const safeUrl = (value: string) => {
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`;
    } catch {
      return value.split(/[?#]/)[0];
    }
  };
  const add = (entry: Omit<Event, 'elapsedMs'>) => {
    if (events.length >= 200) {
      dropped++;
      return;
    }
    events.push({ ...entry, elapsedMs: Date.now() - started });
  };
  const onConsole = (message: ConsoleMessage) => {
    if (['error', 'warning'].includes(message.type()))
      add({ kind: `console-${message.type()}`, message: message.text().slice(0, 2000) });
  };
  const onError = (error: Error) =>
    add({ kind: 'pageerror', message: error.message.slice(0, 2000) });
  const onFailure = (request: Request) =>
    add({
      kind: 'requestfailed',
      method: request.method(),
      url: safeUrl(request.url()),
      message: request.failure()?.errorText,
    });
  const onResponse = (response: Response) => {
    if (response.status() >= 400)
      add({
        kind: 'http-error',
        method: response.request().method(),
        url: safeUrl(response.url()),
        status: response.status(),
      });
  };
  page.on('console', onConsole);
  page.on('pageerror', onError);
  page.on('requestfailed', onFailure);
  page.on('response', onResponse);
  return () => {
    page.off('console', onConsole);
    page.off('pageerror', onError);
    page.off('requestfailed', onFailure);
    page.off('response', onResponse);
    return { pageUrl: safeUrl(page.url()), events, dropped };
  };
}
