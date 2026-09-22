// src/scheduler/scheduler.executor.ts

import { runAnalysis } from "./runAnalysis"
import { runBmkg } from "./runBmkg"
import { runBnpb } from "./runBnpb"
import { runNews } from "./runNews"

type JobHandler = () => Promise<unknown>

const jobs: Record<string, JobHandler> = {
  NEWS: runNews,
  BMKG: runBmkg,
  BNPB: runBnpb,
  ANALYSIS: runAnalysis,
}


export async function executeJob(jobType: string) {
  const job = jobs[jobType]

  if (!job) {
    throw new Error(
      `Job type "${jobType}" tidak ditemukan`
    )
  }

  await job()
}