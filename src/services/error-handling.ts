// Copyright (C) 2025 Keygraph, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version 3
// as published by the Free Software Foundation.

import {
  ErrorCode,
  type PentestErrorType,
  type PentestErrorContext,
  type PromptErrorResult,
} from '../types/errors.js';
import {
  matchesBillingApiPattern,
  matchesBillingTextPattern,
} from '../utils/billing-detection.js';

export class PentestError extends Error {
  override name = 'PentestError' as const;
  type: PentestErrorType;
  retryable: boolean;
  context: PentestErrorContext;
  timestamp: string;
  /** Optional specific error code for reliable classification */
  code?: ErrorCode;

  constructor(
    message: string,
    type: PentestErrorType,
    retryable: boolean = false,
    context: PentestErrorContext = {},
    code?: ErrorCode
  ) {
    super(message);
    this.type = type;
    this.retryable = retryable;
    this.context = context;
    this.timestamp = new Date().toISOString();
    if (code !== undefined) {
      this.code = code;
    }
  }
}

export function handlePromptError(
  promptName: string,
  error: Error
): PromptErrorResult {
  return {
    success: false,
    error: new PentestError(
      `Failed to load prompt '${promptName}': ${error.message}`,
      'prompt',
      false,
      { promptName, originalError: error.message }
    ),
  };
}

const RETRYABLE_PATTERNS = [
  // Network and connection errors
  'network',
  'connection',
  'timeout',
  'econnreset',
  'enotfound',
  'econnrefused',
  // Rate limiting
  'rate limit',
  '429',
  'too many requests',
  // Server errors
  'server error',
  '5xx',
  'internal server error',
  'service unavailable',
  'bad gateway',
  // Gemini API errors
  'resource exhausted',
  'quota exceeded',
  'unavailable',
  // Max turns
  'max turns',
  'maximum turns',
];

// Patterns that indicate non-retryable errors (checked before default)
const NON_RETRYABLE_PATTERNS = [
  'authentication',
  'invalid prompt',
  'out of memory',
  'permission denied',
  'session limit reached',
  'invalid api key',
];

// Conservative retry classification - unknown errors don't retry (fail-safe default)
export function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  if (NON_RETRYABLE_PATTERNS.some((pattern) => message.includes(pattern))) {
    return false;
  }

  return RETRYABLE_PATTERNS.some((pattern) => message.includes(pattern));
}

/**
 * Classifies errors by ErrorCode for reliable, code-based classification.
 */
function classifyByErrorCode(
  code: ErrorCode,
  retryableFromError: boolean
): { type: string; retryable: boolean } {
  switch (code) {
    // Billing errors - retryable (wait for cap reset or credits added)
    case ErrorCode.SPENDING_CAP_REACHED:
    case ErrorCode.INSUFFICIENT_CREDITS:
      return { type: 'BillingError', retryable: true };

    case ErrorCode.API_RATE_LIMITED:
      return { type: 'RateLimitError', retryable: true };

    // Config errors - non-retryable (need manual fix)
    case ErrorCode.CONFIG_NOT_FOUND:
    case ErrorCode.CONFIG_VALIDATION_FAILED:
    case ErrorCode.CONFIG_PARSE_ERROR:
      return { type: 'ConfigurationError', retryable: false };

    // Prompt errors - non-retryable (need manual fix)
    case ErrorCode.PROMPT_LOAD_FAILED:
      return { type: 'ConfigurationError', retryable: false };

    // Git errors - non-retryable (indicates workspace corruption)
    case ErrorCode.GIT_CHECKPOINT_FAILED:
    case ErrorCode.GIT_ROLLBACK_FAILED:
      return { type: 'GitError', retryable: false };

    // Validation errors - retryable (agent may succeed on retry)
    case ErrorCode.OUTPUT_VALIDATION_FAILED:
    case ErrorCode.DELIVERABLE_NOT_FOUND:
      return { type: 'OutputValidationError', retryable: true };

    // Agent execution - use the retryable flag from the error
    case ErrorCode.AGENT_EXECUTION_FAILED:
      return { type: 'AgentExecutionError', retryable: retryableFromError };

    default:
      // Unknown code - fall through to string matching
      return { type: 'UnknownError', retryable: retryableFromError };
  }
}

/**
 * Classifies errors for Temporal workflow retry behavior.
 */
export function classifyErrorForTemporal(error: unknown): { type: string; retryable: boolean } {
  // === CODE-BASED CLASSIFICATION (Preferred for internal errors) ===
  if (error instanceof PentestError && error.code !== undefined) {
    return classifyByErrorCode(error.code, error.retryable);
  }

  // === STRING-BASED CLASSIFICATION (Fallback for external errors) ===
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

  // === BILLING ERRORS (Retryable with long backoff) ===
  if (matchesBillingApiPattern(message) || matchesBillingTextPattern(message)) {
    return { type: 'BillingError', retryable: true };
  }

  // === PERMANENT ERRORS (Non-retryable) ===

  // Authentication (401) - bad API key won't fix itself
  if (
    message.includes('authentication') ||
    message.includes('api key') ||
    message.includes('401') ||
    message.includes('authentication_error')
  ) {
    return { type: 'AuthenticationError', retryable: false };
  }

  // Permission (403) - access won't be granted
  if (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('403')
  ) {
    return { type: 'PermissionError', retryable: false };
  }

  // === OUTPUT VALIDATION ERRORS (Retryable) ===
  if (
    message.includes('failed output validation') ||
    message.includes('output validation failed')
  ) {
    return { type: 'OutputValidationError', retryable: true };
  }

  // Invalid Request (400)
  if (
    message.includes('invalid_request_error') ||
    message.includes('malformed') ||
    message.includes('validation')
  ) {
    return { type: 'InvalidRequestError', retryable: false };
  }

  // Configuration errors
  if (
    message.includes('enoent') ||
    message.includes('no such file') ||
    message.includes('cli not installed')
  ) {
    return { type: 'ConfigurationError', retryable: false };
  }

  // Execution limits
  if (
    message.includes('max turns') ||
    message.includes('budget') ||
    message.includes('execution limit') ||
    message.includes('error_max_turns') ||
    message.includes('error_max_budget')
  ) {
    return { type: 'ExecutionLimitError', retryable: false };
  }

  // === TRANSIENT ERRORS (Retryable) ===
  return { type: 'TransientError', retryable: true };
}
