import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = vi.hoisted(() => ({
  user: { upsert: vi.fn() },
  meeting: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../db.js', () => ({ prisma: mockPrisma }));

import { resolveMeetingId } from './meeting-resolver.js';

describe('resolveMeetingId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for empty input', async () => {
    expect(await resolveMeetingId('')).toBeNull();
  });

  it('resolves by internal Meeting.id', async () => {
    mockPrisma.meeting.findUnique.mockResolvedValueOnce({ id: 'internal-123' });

    const result = await resolveMeetingId('internal-123');
    expect(result).toBe('internal-123');
    expect(mockPrisma.meeting.findUnique).toHaveBeenCalledWith({
      where: { id: 'internal-123' },
      select: { id: true },
    });
  });

  it('resolves by Zoom meeting UUID', async () => {
    mockPrisma.meeting.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'resolved-456' });

    const result = await resolveMeetingId('zoom-uuid-abc');
    expect(result).toBe('resolved-456');
  });

  it('returns null when not found and createIfMissing is false', async () => {
    mockPrisma.meeting.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const result = await resolveMeetingId('unknown', { createIfMissing: false });
    expect(result).toBeNull();
  });

  it('creates meeting when not found and createIfMissing is true', async () => {
    mockPrisma.meeting.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.user.upsert.mockResolvedValueOnce({ id: 'system-user' });
    mockPrisma.meeting.upsert.mockResolvedValueOnce({ id: 'new-meeting-789' });

    const result = await resolveMeetingId('new-zoom-id', {
      createIfMissing: true,
      defaultTitle: 'Test Lecture',
    });

    expect(result).toBe('new-meeting-789');
    expect(mockPrisma.meeting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { zoomMeetingId: 'new-zoom-id' },
        create: expect.objectContaining({
          zoomMeetingId: 'new-zoom-id',
          title: 'Test Lecture',
          ownerId: 'system-user',
        }),
      }),
    );
  });

  it('uses default title when none provided', async () => {
    mockPrisma.meeting.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockPrisma.user.upsert.mockResolvedValueOnce({ id: 'system-user' });
    mockPrisma.meeting.upsert.mockResolvedValueOnce({ id: 'new-id' });

    await resolveMeetingId('some-id', { createIfMissing: true });

    expect(mockPrisma.meeting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          title: 'In-Meeting Session',
        }),
      }),
    );
  });
});
