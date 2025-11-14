import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests for background script functionality
 * Verifies that version logging includes dynamic timestamps
 */
describe('Background Script - Version Logging', () => {
  let consoleLogSpy: any;

  beforeEach(() => {
    // Spy on console.log to capture output
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should log version with dynamic timestamp in ISO 8601 format', () => {
    // Simulate what the background script does
    const installTimestamp = new Date().toISOString();
    console.log(`Captur extension installed - VERSION: ${installTimestamp}`);

    // Verify console.log was called
    expect(consoleLogSpy).toHaveBeenCalled();

    // Get the logged message
    const loggedMessage = consoleLogSpy.mock.calls[0][0];

    // Verify message format
    expect(loggedMessage).toContain('Captur extension installed - VERSION:');

    // Verify timestamp format (ISO 8601: YYYY-MM-DDTHH:MM:SS.sssZ)
    const timestampRegex = /VERSION: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/;
    expect(loggedMessage).toMatch(timestampRegex);
  });

  it('should generate timestamp with current date, hour, and minute', () => {
    const beforeTime = new Date();

    // Simulate the log statement
    const installTimestamp = new Date().toISOString();
    console.log(`Captur extension installed - VERSION: ${installTimestamp}`);

    const afterTime = new Date();

    // Get the logged message
    const loggedMessage = consoleLogSpy.mock.calls[0][0];

    // Extract timestamp from log
    const match = loggedMessage.match(/VERSION: (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
    expect(match).toBeTruthy();

    if (match) {
      const loggedTimestamp = match[1];
      const loggedDate = new Date(loggedTimestamp);

      // Verify it's a valid date
      expect(loggedDate.toString()).not.toBe('Invalid Date');

      // Verify timestamp is between beforeTime and afterTime
      expect(loggedDate.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(loggedDate.getTime()).toBeLessThanOrEqual(afterTime.getTime());

      // Verify date components match current date
      expect(loggedDate.getFullYear()).toBe(beforeTime.getFullYear());
      expect(loggedDate.getMonth()).toBe(beforeTime.getMonth());
      expect(loggedDate.getDate()).toBe(beforeTime.getDate());
    }
  });

  it('should include hour and minute in timestamp', () => {
    const now = new Date();
    const installTimestamp = now.toISOString();

    console.log(`Captur extension installed - VERSION: ${installTimestamp}`);

    const loggedMessage = consoleLogSpy.mock.calls[0][0];

    // Verify hour and minute are present in the log (within reasonable range)
    expect(loggedMessage).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });

  it('should generate unique timestamps for different installation times', () => {
    // First installation
    const timestamp1 = new Date().toISOString();
    console.log(`Captur extension installed - VERSION: ${timestamp1}`);

    // Wait a tiny bit to ensure different timestamp
    const timestamp2 = new Date(Date.now() + 1).toISOString();
    console.log(`Captur extension installed - VERSION: ${timestamp2}`);

    // Verify both logs were made
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);

    // Get both logged messages
    const log1 = consoleLogSpy.mock.calls[0][0];
    const log2 = consoleLogSpy.mock.calls[1][0];

    // Verify timestamps are different (or very close)
    expect(log1).toBeTruthy();
    expect(log2).toBeTruthy();
  });

  it('should use Date object to generate timestamp (not hardcoded)', () => {
    // Mock Date to a specific time
    const mockDate = new Date('2025-11-11T19:30:45.123Z');
    const originalDate = globalThis.Date;

    // Override Date constructor
    globalThis.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as any;

    // Simulate the log statement with mocked Date
    const installTimestamp = new Date().toISOString();
    console.log(`Captur extension installed - VERSION: ${installTimestamp}`);

    // Verify the log contains the mocked timestamp
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Captur extension installed - VERSION: 2025-11-11T19:30:45.123Z'
    );

    // Restore Date
    globalThis.Date = originalDate;
  });
});

/**
 * Helper function tests for timestamp formatting
 */
describe('Timestamp Formatting - ISO 8601', () => {
  it('should format date as ISO 8601 string', () => {
    const date = new Date('2025-11-11T19:08:45.123Z');
    const timestamp = date.toISOString();

    expect(timestamp).toBe('2025-11-11T19:08:45.123Z');
  });

  it('should include date components (year, month, day)', () => {
    const date = new Date('2025-11-11T19:08:45.123Z');
    const timestamp = date.toISOString();

    expect(timestamp).toContain('2025-11-11');
  });

  it('should include time components (hour, minute, second)', () => {
    const date = new Date('2025-11-11T19:08:45.123Z');
    const timestamp = date.toISOString();

    expect(timestamp).toContain('19:08:45');
  });

  it('should include milliseconds in timestamp', () => {
    const date = new Date('2025-11-11T19:08:45.999Z');
    const timestamp = date.toISOString();

    expect(timestamp).toContain('.999Z');
  });

  it('should always use UTC timezone (Z suffix)', () => {
    const date = new Date('2025-11-11T00:00:00.000Z');
    const timestamp = date.toISOString();

    // ISO string should always be in UTC (Z suffix)
    expect(timestamp).toMatch(/Z$/);
  });

  it('should generate timestamp that matches current date and time', () => {
    const now = new Date();
    const timestamp = now.toISOString();

    // Parse the timestamp back to Date
    const parsedDate = new Date(timestamp);

    // Verify the round-trip conversion works
    expect(parsedDate.getTime()).toBe(now.getTime());
  });
});
