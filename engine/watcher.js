import fs from "fs";
import { join } from "path";

/**
 * @param {object} options
 * @param {(type: string, file: string) => void} options.callback
 * @param {string[]} options.paths
 */
export function watchForChanges(options) {
  const { callback, paths } = options;
  for (const path of paths) {
    const fullPath = join(process.cwd(), path);
    fs.watch(fullPath, { recursive: true }, callback);
  }
}
