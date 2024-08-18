// Success and Standard Status Codes
export const SUCCESS = 200;
export const UNAUTHORIZED = 401;
export const FORBIDDEN = 403;

// Unauthorized and Forbidden
export const ACCESS_TOKEN_NOT_MATCH = 1000;

// Validation Errors
export const NOT_EMPTY = 2000;
export const VALIDATE_ERROR = 2001;

// Account Errors
export const ACCOUNT_NOT_EXIST = 3000;
export const ACCOUNT_EXIST = 3001;

// User Errors
export const USER_NOT_FOUND = 4000;
export const CREATE_USER_ERROR = 4001;
export const DELETE_USER_ERROR = 4002;

// Login Errors
export const LOGIN_ERROR = 5000;

// Register Errors
export const REGISTER_ERROR = 6000;

// Password Errors
export const PASSWORD_NOT_MATCH = 7000;
export const UPDATE_PASSWORD_ERROR = 7001;

// Verification Code Errors
export const VERIFICATION_CODE_EXPIRED = 8000;
export const VERIFICATION_CODE_NOT_MATCH = 8001;
export const VERIFICATION_CODE_NOT_EXIST = 8002;

// Update Errors
export const UPDATE_ERROR = 9000;

// Unknown Error
export const UNKNOWN_ERROR = 10009;