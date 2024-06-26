import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "clear files which are shouldDeleted",
  { minutes: 1 },
  internal.files.deleteAllFiles
);

export default crons;
