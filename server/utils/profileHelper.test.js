import { describe, it, expect } from 'vitest';
import { getProfilePath, getPartition } from './profileHelper';

describe('profileHelper Utils', () => {
  describe('getPartition', () => {
    it('should return 1 for userId 1', () => {
      expect(getPartition(1)).toBe(1);
    });
    
    it('should return 2 for userId 1001', () => {
      expect(getPartition(1001)).toBe(2);
    });

    it('should return 1 for userId 999', () => {
        expect(getPartition(999)).toBe(1);
    });
  });

  describe('getProfilePath', () => {
    it('should return null if no profileUuid is provided', () => {
      expect(getProfilePath(1, null)).toBeNull();
    });

    it('should return correct path for userId 1 and uuid', () => {
      const userId = 1;
      const uuid = 'test-uuid';
      const expected = `storage/profiles/1/test-uuid.webp`;
      expect(getProfilePath(userId, uuid)).toBe(expected);
    });
    
    it('should return correct path for userId 1500 and uuid', () => {
        const userId = 1500;
        const uuid = 'another-uuid';
        const expected = `storage/profiles/2/another-uuid.webp`;
        expect(getProfilePath(userId, uuid)).toBe(expected);
      });
  });
});
