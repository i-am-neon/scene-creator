import { logger } from "./logger";

(function clearLogs() {
  logger.clearLogs();
})();

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Cleared logs");
}
