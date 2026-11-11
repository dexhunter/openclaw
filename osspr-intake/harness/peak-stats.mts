import { spawnSync } from "node:child_process";

/** Full spread of a sample list: (max - min) / median, as a percent. */
export function summarizeSamples(samples: number[]) {
  const sorted = [...samples].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
  const noisePct = median === 0 ? 0 : ((sorted[sorted.length - 1]! - sorted[0]!) / median) * 100;
  return {
    samples,
    median,
    noise_pct: Math.round(noisePct * 1000) / 1000,
  };
}

/**
 * Each sample is a fresh process. In-process repeats reuse a heap that V8
 * collects mid-call, so the same workload swings by more than the win.
 */
export function reportPeakBytes(
  functionName: string,
  work: () => void,
  extra: Record<string, number> = {},
) {
  if (process.env.OSSPR_PEAK_CHILD === "1") {
    if (typeof globalThis.gc !== "function") {
      throw new Error("peak harness requires node --expose-gc");
    }
    globalThis.gc();
    const before = process.memoryUsage().heapUsed;
    work();
    const after = process.memoryUsage().heapUsed;
    process.stdout.write(String(Math.max(0, after - before)));
    return;
  }

  const samples: number[] = [];
  for (let index = 0; index < 5; index += 1) {
    const child = spawnSync(
      process.execPath,
      ["--expose-gc", "--import", "./scripts/tsx.mjs", process.argv[1] ?? ""],
      {
        cwd: process.cwd(),
        env: { ...process.env, OSSPR_PEAK_CHILD: "1" },
        encoding: "utf8",
      },
    );
    if (child.status !== 0) {
      process.stderr.write(child.stderr ?? "");
      throw new Error(`peak child exited ${child.status}`);
    }
    samples.push(Number(child.stdout.trim()));
  }
  console.log(
    JSON.stringify({
      metric_kind: "peak_memory_bytes",
      function: functionName,
      ...extra,
      ...summarizeSamples(samples),
    }),
  );
}
