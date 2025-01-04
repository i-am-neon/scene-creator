// lib/elevenlabs-error.ts

interface ElevenLabsErrorResponse {
  status?: number;
  message?: string;
  detail?: {
    message?: string;
    remaining_characters?: number;
    character_count?: number;
    character_limit?: number;
    remaining_quota?: number;
    quota_limit?: number;
    voice_limit?: number;
    tier?: string;
    voice_count?: number;
    request_size_bytes?: number;
    max_size_bytes?: number;
    reason?: string;
    exceeded?: boolean;
  };
}

interface ElevenLabsErrorMetadata {
  status?: number;
  detail?: ElevenLabsErrorResponse["detail"];
}

export class ElevenLabsError extends Error implements ElevenLabsErrorMetadata {
  status?: number;
  detail?: ElevenLabsErrorResponse["detail"];

  constructor(error: unknown) {
    const errorMessage = getErrorMessage(error);
    super(errorMessage);

    this.name = "ElevenLabsError";
    this.status = getErrorStatus(error);
    this.detail = getErrorDetail(error);

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ElevenLabsError.prototype);
  }

  toJSON(): ElevenLabsErrorMetadata & { name: string; message: string } {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      detail: this.detail,
    };
  }
}

function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === "object") {
    if ("status" in error && typeof error.status === "number") {
      return error.status;
    }
    // Handle axios-like errors
    if (
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response
    ) {
      return (error.response as { status: number }).status;
    }
  }
  return undefined;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
  }

  return "Unknown ElevenLabs error occurred";
}

function getErrorDetail(
  error: unknown
): ElevenLabsErrorResponse["detail"] | undefined {
  if (error && typeof error === "object") {
    if ("detail" in error) {
      return error.detail as ElevenLabsErrorResponse["detail"];
    }
    // Include the response data if available
    if (
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "data" in error.response
    ) {
      return (error.response as { data: unknown })
        .data as ElevenLabsErrorResponse["detail"];
    }
  }
  return undefined;
}

export function formatElevenLabsError(error: unknown): string {
  const elevenlabsError =
    error instanceof ElevenLabsError ? error : new ElevenLabsError(error);

  const parts = [
    `ElevenLabs API Error:`,
    `Message: ${elevenlabsError.message}`,
  ];

  if (elevenlabsError.status) {
    parts.push(`Status: ${elevenlabsError.status}`);
  }

  if (elevenlabsError.detail) {
    const detail = elevenlabsError.detail;
    parts.push("Details:");

    if (detail.message) {
      parts.push(`  Message: ${detail.message}`);
    }

    if (detail.remaining_characters !== undefined) {
      parts.push(`  Remaining Characters: ${detail.remaining_characters}`);
      parts.push(`  Character Count: ${detail.character_count}`);
      parts.push(`  Character Limit: ${detail.character_limit}`);
    }

    if (detail.remaining_quota !== undefined) {
      parts.push(`  Remaining Quota: ${detail.remaining_quota}`);
      parts.push(`  Quota Limit: ${detail.quota_limit}`);
    }

    if (detail.voice_count !== undefined) {
      parts.push(`  Voice Count: ${detail.voice_count}`);
      parts.push(`  Voice Limit: ${detail.voice_limit}`);
    }

    if (detail.request_size_bytes !== undefined) {
      parts.push(`  Request Size: ${formatBytes(detail.request_size_bytes)}`);
      parts.push(`  Max Size: ${formatBytes(detail.max_size_bytes!)}`);
    }

    if (detail.tier) {
      parts.push(`  Tier: ${detail.tier}`);
    }

    if (detail.reason) {
      parts.push(`  Reason: ${detail.reason}`);
    }
  }

  return parts.join("\n");
}

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}
