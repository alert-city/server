// Success and Standard Status Codes
export const SUCCESS = 200;

// 3xx Redirection Errors
export const MOVED_PERMANENTLY = 301; // Moved Permanently
export const FOUND = 302; // Found

// 4xx Client Errors
export const VALIDATION_ERROR = 400; // Bad Request
export const AUTHORIZATION_ERROR = 401; // Unauthorized
export const FORBIDDEN_ERROR = 403; // Forbidden
export const NOT_FOUND_ERROR = 404; // Not Found
export const METHOD_NOT_ALLOWED = 405; // Method Not Allowed
export const CONFLICT_ERROR = 409; // Conflict
export const PAYLOAD_TOO_LARGE = 413; // Payload Too Large
export const TOO_MANY_REQUESTS = 429; // Too Many Requests

// File Upload and Processing Errors
export const UNSUPPORTED_MEDIA_TYPE = 415; // Unsupported Media Type
export const UNPROCESSABLE_ENTITY = 422; // Unprocessable Entity

// Resource Limitation Errors
export const RATE_LIMIT_EXCEEDED = 429; // Too Many Requests

// 5xx Server Errors
export const INTERNAL_SERVER_ERROR = 500; // Internal Server Error
export const BAD_GATEWAY = 502; // Bad Gateway
export const SERVICE_UNAVAILABLE = 503; // Service Unavailable
export const GATEWAY_TIMEOUT = 504; // Gateway Timeout

// Custom Error Codes
export const ACCOUNT_NOT_ACTIVATED = 1000;
