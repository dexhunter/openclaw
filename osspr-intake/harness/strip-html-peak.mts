import { stripHtmlFromMarkdown } from "../../packages/markdown-core/src/strip-html.ts";
import { reportPeakBytes } from "./peak-stats.mts";

// Assistant text with a few inline tags around a long prose run. Matches the
// strip-markdown cases that keep visible text and drop authored tags.
const markdown = `<b>${"hello ".repeat(30_000)}</b> and <i>tail</i>`;

reportPeakBytes(
  "stripHtmlFromMarkdown",
  () => {
    stripHtmlFromMarkdown(markdown);
  },
  { input_chars: markdown.length },
);
