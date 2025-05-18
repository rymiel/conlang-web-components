export class CustomApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type HTTPMethod = "GET" | "POST" | "DELETE";
type Body = FormData | Record<string, string | undefined> | string;

const normalize = (endpoint: string) => (endpoint.startsWith("/") ? endpoint.substring(1) : endpoint);

interface ApiClientConfig {
  base?: {
    dev?: string;
    prod?: string;
  };
  language: string;
  version: string;
}

class ApiClient {
  #base: string;
  #language: string;
  #version: string;

  constructor(config: { base: string; language: string; version: string }) {
    this.#base = config.base;
    this.#language = config.language;
    this.#version = config.version;
  }

  async general<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
    return this.#baseFetch(`/api/v0/${normalize(endpoint)}`, method, body);
  }
  async lang<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
    return this.#baseFetch(`/api/v1/${this.#language}/${normalize(endpoint)}`, method, body);
  }

  async #baseFetch<T>(endpoint: string, method?: HTTPMethod, body?: Body): Promise<T> {
    const headers = new Headers();
    const key = localStorage.getItem("token");
    let formBody;
    if (key !== null) {
      headers.set("Authorization", key);
    }
    headers.set("X-Solerian-Client", `cwc/1.0 ${this.#language}/${this.#version} rymiel`);
    if (body instanceof FormData) {
      formBody = body;
    } else if (typeof body === "string") {
      formBody = body;
    } else if (body !== undefined) {
      formBody = new FormData();
      for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          const v = body[key];
          if (v !== undefined) {
            formBody.set(key, v);
          }
        }
      }
    }
    method ??= "GET";
    const response = await fetch(this.#base + endpoint, { method, body: formBody, headers, credentials: "include" });
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new CustomApiError(text, response.status);
      } else {
        throw error;
      }
    }
  }

  async version(): Promise<string> {
    const req = await fetch(`${this.#base}/version`);
    return req.text();
  }
}

const DEFAULT_DEV_BASE = "http://localhost:3000";
const DEFAULT_PROD_BASE = "https://solerian-api.rymiel.space";
export function createApiClient(config: ApiClientConfig): ApiClient {
  const dev = config.base?.dev ?? DEFAULT_DEV_BASE;
  const prod = config.base?.prod ?? DEFAULT_PROD_BASE;
  const base = document.location.hostname === "localhost" ? dev : prod;
  return new ApiClient({ ...config, base });
}
