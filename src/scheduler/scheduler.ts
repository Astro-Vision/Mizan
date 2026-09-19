import cron from "node-cron"
import { runNews } from "./job/runNews"
import { runBmkg } from "./job/runBmkg"
import { runBnpb } from "./job/runBnpb"
import { runAnalysis } from "./job/runAnalysis"

let started = false

export function startSchedulers() {
  if (started) {
    console.log("[scheduler] Sudah jalan, skip inisialisasi ulang")
    return
  }
  started = true

  cron.schedule("*/5 * * * *", async () => {
    console.log("[scheduler] Running news scrape job")
    try {
      await runNews()
    } catch (err) {
      console.error("[scheduler] News job failed:", err)
    }
  })

  cron.schedule("*/15 * * * *", async () => {
    console.log("[scheduler] Running BMKG scrape job")
    try {
      await runBmkg()
    } catch (err) {
      console.error("[scheduler] BMKG job failed:", err)
    }
  })

  cron.schedule("0,30 * * * *", async () => {
    console.log("[scheduler] Running BNPB scrape job")
    try {
      await runBnpb()
    } catch (err) {
      console.error("[scheduler] BNPB job failed:", err)
    }
  })

  cron.schedule("*/2 * * * *", async () => {
    console.log("[scheduler] Running analysis job")
    try {
      await runAnalysis()
    } catch (err) {
      console.error("[scheduler] Analysis job failed:", err)
    }
  })

  console.log("[scheduler] All jobs scheduled")
}