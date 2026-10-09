import fs from "node:fs";
import path from "node:path";
import { runCompleteEvaluation, formatEvaluationReportMarkdown } from "../src/lib/feed/validation/reportGenerator";

console.log("==================================================");
console.log("FEEDSMITH — RECOMMENDATION QUALITY & VALIDATION LAB");
console.log("==================================================");
console.log("Running evaluation across synthetic test personas...");

const run = runCompleteEvaluation();
const reportMarkdown = formatEvaluationReportMarkdown(run);

const outputPath = path.resolve(process.cwd(), "recommendation-quality-report.md");
fs.writeFileSync(outputPath, reportMarkdown, "utf8");

console.log(reportMarkdown);
console.log("==================================================");
console.log(`Evaluation report successfully generated at:\n${outputPath}`);
console.log("==================================================");

