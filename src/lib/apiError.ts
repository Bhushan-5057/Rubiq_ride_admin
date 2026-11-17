type ErrorRecord = Record<string, unknown>;

interface BackendValidationError {
  msg?: string;
  message?: string;
  path?: string;
  location?: string;
  [key: string]: unknown;
}

export interface ParsedApiError {
  status?: number;
  message: string;
  stack?: string;
  method?: string;
  endpoint?: string;
  validationErrors: BackendValidationError[];
  raw: unknown;
}

const asRecord = (value: unknown): ErrorRecord | null =>
  value && typeof value === "object" ? (value as ErrorRecord) : null;

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const asValidationErrors = (value: unknown): BackendValidationError[] =>
  Array.isArray(value)
    ? value.map((item) => {
        const record = asRecord(item);
        return record ? (record as BackendValidationError) : { message: String(item) };
      })
    : [];

export const parseApiError = (error: unknown): ParsedApiError => {
  const errorRecord = asRecord(error);
  const responseRecord = asRecord(errorRecord?.response);
  const dataRecord = asRecord(responseRecord?.data);
  const configRecord = asRecord(errorRecord?.config);

  const primaryValidationErrors = asValidationErrors(dataRecord?.errors);
  const secondaryValidationErrors = asValidationErrors(dataRecord?.validationErrors);
  const tertiaryValidationErrors = asValidationErrors(dataRecord?.error);
  const validationErrors =
    primaryValidationErrors.length > 0
      ? primaryValidationErrors
      : secondaryValidationErrors.length > 0
      ? secondaryValidationErrors
      : tertiaryValidationErrors;

  const message =
    asString(dataRecord?.message) ||
    asString(dataRecord?.error) ||
    asString(errorRecord?.message) ||
    "Unknown API error";

  const stack = asString(dataRecord?.stack) || asString(errorRecord?.stack);
  const method = asString(configRecord?.method)?.toUpperCase();
  const endpoint = asString(configRecord?.url);
  const status =
    typeof responseRecord?.status === "number" ? (responseRecord.status as number) : undefined;

  return {
    status,
    message,
    stack,
    method,
    endpoint,
    validationErrors,
    raw: error,
  };
};

const formatValidationError = (validationError: BackendValidationError) => {
  const msg =
    asString(validationError.msg) ||
    asString(validationError.message) ||
    JSON.stringify(validationError);
  const path = asString(validationError.path) || "unknown-path";
  const location = asString(validationError.location) || "unknown-location";
  return `- [${location}] ${path}: ${msg}`;
};

export const formatParsedApiError = (parsed: ParsedApiError): string => {
  if (parsed.validationErrors.length) {
    return parsed.validationErrors.map(formatValidationError).join(", ");
  }
  return parsed.message;
};

export const formatApiError = (error: unknown): string =>
  formatParsedApiError(parseApiError(error));

export const logApiError = (error: unknown, context?: string): ParsedApiError => {
  const parsed = parseApiError(error);
  const header = context
    ? `[API ERROR] ${context}`
    : `[API ERROR] ${parsed.method || "REQUEST"} ${parsed.endpoint || ""}`.trim();

  console.groupCollapsed(header);
  console.error(formatParsedApiError(parsed));
  console.error("Raw Error:", parsed.raw);
  console.groupEnd();

  return parsed;
};

export const getApiErrorMessage = (error: unknown, context?: string): string => {
  const parsed = logApiError(error, context);
  return formatParsedApiError(parsed);
};

export const formatBackendErrorPayload = (
  payload: unknown,
  status?: number,
  context?: string
): string => {
  const syntheticError = {
    message: "Backend error payload",
    response: {
      status,
      data: payload,
    },
  };
  return getApiErrorMessage(syntheticError, context);
};
