import { appendFileSync } from 'node:fs';
import type { FullConfig, FullResult, Reporter, Suite } from '@playwright/test/reporter';

// A small CI adapter; HTML, JUnit and traces remain native Playwright reports.
export default class GitHubSummaryReporter implements Reporter {
  private suite?: Suite;

  onBegin(_config: FullConfig, suite: Suite) {
    this.suite = suite;
  }

  onEnd(result: FullResult) {
    const destination = process.env.GITHUB_STEP_SUMMARY;
    if (!destination) return;
    const counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
    for (const test of this.suite?.allTests() ?? []) counts[test.outcome()]++;
    appendFileSync(
      destination,
      [
        '## Playwright results',
        '',
        `Run status: **${result.status}**. Duration: ${(result.duration / 1000).toFixed(1)}s.`,
        '',
        '| Expected | Unexpected | Flaky | Skipped |',
        '| ---: | ---: | ---: | ---: |',
        `| ${counts.expected} | ${counts.unexpected} | ${counts.flaky} | ${counts.skipped} |`,
        '',
        'Counts represent test cases, not retry attempts. Flaky tests fail the CI gate.',
        '',
        process.env.UPLOAD_REPORTS === 'true'
          ? 'HTML/JUnit reports and failure attachments are uploaded by the following artifact step; check that step for upload status.'
          : 'Report uploads are disabled. Run the workflow with `upload_reports` enabled for downloadable HTML/JUnit reports and failure attachments.',
        '',
      ].join('\n'),
    );
  }

  printsToStdio() {
    return false;
  }
}
