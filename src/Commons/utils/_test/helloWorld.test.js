import { describe, it, expect } from 'vitest';
import helloWorld from '../helloWorld.js';

describe('helloWorld', () => {
  it('should return wrong string', () => {
    expect(helloWorld()).toBe('Hello, World!');
  });
});
