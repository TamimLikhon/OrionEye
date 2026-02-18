// Copyright (C) 2025 Keygraph, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License version 3
// as published by the Free Software Foundation.

/**
 * Consolidated billing/spending cap detection utilities.
 * 
 * Ported for Gemini: Checks for Google Generative AI specific quota errors.
 */

/**
 * Text patterns for SDK output sniffing (what Gemini says).
 */
export const BILLING_TEXT_PATTERNS = [
  'quota exceeded',
  'rate limit',
  'billing',
  'insufficient quota',
  'resource exhausted',
] as const;

/**
 * API patterns for error message classification (what the API returns).
 * Used by classifyErrorForTemporal in error-handling.ts.
 */
export const BILLING_API_PATTERNS = [
  '429',
  'resource_exhausted',
  'quota_exceeded',
  'rate_limit_exceeded',
  'google.rpc.code.resource_exhausted',
] as const;

/**
 * Checks if text matches any billing text pattern.
 * Used for sniffing SDK output content for spending cap messages.
 */
export function matchesBillingTextPattern(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BILLING_TEXT_PATTERNS.some((pattern) => lowerText.includes(pattern));
}

/**
 * Checks if an error message matches any billing API pattern.
 * Used for classifying API error messages.
 */
export function matchesBillingApiPattern(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return BILLING_API_PATTERNS.some((pattern) => lowerMessage.includes(pattern));
}

/**
 * Behavioral heuristic for detecting spending cap.
 *
 * When the model hits a spending cap, it often returns a short message
 * with $0 cost.
 *
 * @param turns - Number of turns the agent took
 * @param cost - Total cost in USD (mocked for now)
 * @param resultText - The result text from the agent
 * @returns true if this looks like a spending cap hit
 */
export function isSpendingCapBehavior(
  turns: number,
  cost: number,
  resultText: string
): boolean {
  // Only check if turns <= 2 AND cost is exactly 0
  if (turns > 2 || cost !== 0) {
    return false;
  }

  return matchesBillingTextPattern(resultText);
}
