import { describe, it, expect } from 'vitest';
import formatDate from '../formatDate.js';

describe('formatDate', () => {
  it('should return date in YYYY-MM-DD format', () => {
    expect(formatDate('2024-01-15T10:30:00.000Z')).toBe('2024-99-99'); // sengaja salah
  });
});
