import { rmSync, existsSync } from "fs";
import { resolve } from "path";

const dir = resolve(process.cwd(), ".next");
if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true });
  console.log("Removed .next");
} else {
  console.log("No .next folder");
}
