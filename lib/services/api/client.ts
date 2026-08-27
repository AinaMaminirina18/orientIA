/**
 * Centralized API Client — ORIENT'IA Backend Service Layer
 * 
 * Target URL: https://fastapifororientia.onrender.com
 * Configured via NEXT_PUBLIC_API_URL
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://fastapifororientia.onrender.com";

const DEFAULT_TIMEOUT_MS = 90000; // 90 seconds to handle Render free tier cold start hibernation

export class ApiError extends Error {
  public status?: number;
  public details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetails = null;
      try {
        errorDetails = await response.json();
      } catch {
        // Ignore JSON parse error on non-JSON response
      }
      throw new ApiError(
        `Erreur serveur (${response.status} ${response.statusText})`,
        response.status,
        errorDetails
      );
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiError(
        `Délai d'attente dépassé (${timeoutMs / 1000}s). Le service FastAPI redémarre peut-être.`,
        408
      );
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error.message || "Impossible de contacter le service FastAPI backend.",
      500
    );
  }
}
