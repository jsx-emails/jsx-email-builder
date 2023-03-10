import fs from "fs";
import { join } from "path";

export function watchForChanges(options) {
  const { callback, path } = options;
  const fullPath = join(process.cwd(), path);
  fs.watch(fullPath, { recursive: true }, callback);
}
