"use server";
import { logger } from "@/lib/logger";
import elevenlabs from "../init-eleven-labs";
import { LibraryVoiceResponse, VoicesGetSharedRequest } from "elevenlabs/api";

const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds
const MAX_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function fetchAllVoices() {
  try {
    const allVoices: LibraryVoiceResponse[] = [];
    let hasMore = true;
    let currentPage = 1;

    while (hasMore) {
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < MAX_RETRIES) {
        try {
          const params: VoicesGetSharedRequest = {
            language: "en",
            page_size: 100,
            page: currentPage,
            category: "high_quality",
          };

          // Log that we're about to make a request
          await logger.info("Fetching voices page", {
            page: currentPage,
            retryAttempt: retryCount + 1,
          });

          const response = await elevenlabs.voices.getShared(params);
          allVoices.push(...response.voices);

          // Update pagination parameters
          hasMore = response.has_more;
          currentPage += 1;
          success = true;

          // Log successful page fetch
          await logger.info("Successfully fetched page", {
            page: currentPage - 1,
            voicesInPage: response.voices.length,
          });

          // Wait between requests
          await sleep(DELAY_BETWEEN_REQUESTS);
        } catch (error) {
          // Check if it's a 500 error
          if (error instanceof Error && error.toString().includes("500")) {
            await logger.info("Reached end of pages (500 error)", {
              page: currentPage,
              totalVoicesSoFar: allVoices.length,
            });
            hasMore = false;
            break;
          }

          retryCount++;
          await logger.warn("Failed to fetch page, retrying", {
            page: currentPage,
            retryAttempt: retryCount,
            error: error instanceof Error ? error.message : String(error),
          });

          if (retryCount < MAX_RETRIES) {
            // Wait longer between retries (exponential backoff)
            await sleep(DELAY_BETWEEN_REQUESTS * Math.pow(2, retryCount));
          } else {
            throw error;
          }
        }
      }
    }

    await logger.info("Successfully fetched all voices", {
      totalVoices: allVoices.length,
      totalPages: currentPage - 1,
    });

    return allVoices;
  } catch (error) {
    await logger.error("Failed to fetch all voices", {
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const voices = await fetchAllVoices();
      console.log("Total voices:", voices.length);
      console.log("First few voices:", voices.slice(0, 3));
    } catch (error) {
      console.error("Error fetching voices:", error);
    }
  })();
}

