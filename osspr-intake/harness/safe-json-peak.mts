import { safeJsonStringify } from "../../src/utils/safe-json.ts";
import { reportPeakBytes } from "./peak-stats.mts";

// Node Buffer values hit Buffer#toJSON before the Uint8Array branch, so a
// diagnostic record materializes one JS number per payload byte.
const payload = { data: Buffer.alloc(2 * 1024 * 1024, 7) };

reportPeakBytes(
  "safeJsonStringify",
  () => {
    safeJsonStringify(payload);
  },
  { input_bytes: payload.data.byteLength },
);
