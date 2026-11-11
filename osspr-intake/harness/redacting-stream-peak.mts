import { createRedactingStreamWriter } from "../../src/logging/redacting-stream.ts";
import { reportPeakBytes } from "./peak-stats.mts";

// Log-sized progress text. The secret is absent, so emit still walks every
// character and appends it one unit at a time before a single write.
const text = `progress ${"status update ".repeat(120_000)}`;
const bytes = Buffer.from(text);
const secret = "gw-secret-token";

reportPeakBytes(
  "createRedactingStreamWriter",
  () => {
    const writer = createRedactingStreamWriter(
      {
        write() {
          return true;
        },
      },
      [secret],
    );
    writer.write(bytes);
    writer.flush();
  },
  { input_chars: text.length },
);
