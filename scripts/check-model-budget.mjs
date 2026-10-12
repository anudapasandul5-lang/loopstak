// Fails the build when public/models GLB files exceed the size or texture budget.
// Usage: node scripts/check-model-budget.mjs
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkModels } from "./model-budget-core.mjs";

const modelsDir = resolve(join(dirname(fileURLToPath(import.meta.url)), "..", "public", "models"));
const result = checkModels(modelsDir);

for (const warning of result.warnings) console.warn(`warning: ${warning}`);

if (!result.ok) {
  console.error("Model budget exceeded:");
  for (const error of result.errors) console.error(`  - ${error}`);
  console.error("Files:");
  for (const file of result.files) console.error(`  ${file.path}  ${(file.bytes / 1024).toFixed(1)} KB`);
  process.exit(1);
}

if (result.files.length === 0) {
  console.log("No models yet, budget OK");
  process.exit(0);
}

const totalKb = result.files.reduce((sum, f) => sum + f.bytes, 0) / 1024;
console.log(`Model budget OK: ${result.files.length} file(s), ${totalKb.toFixed(1)} KB total`);
