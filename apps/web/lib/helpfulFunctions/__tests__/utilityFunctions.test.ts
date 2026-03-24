import { formatStudyTime } from '../formatStudyTime';
import { getRandomColor } from '../roomsRelated/getRandomColour';
import { transformRoomData } from '../transformRoomData';

describe('formatStudyTime', () => {
  it('formats minutes into hours and minutes', () => {
    expect(formatStudyTime(125)).toBe('2h 5m');
  });

  it('formats zero minutes correctly', () => {
    expect(formatStudyTime(0)).toBe('0h 0m');
  });

  it('formats minutes under one hour correctly', () => {
    expect(formatStudyTime(59)).toBe('0h 59m');
  });
});

describe('getRandomColor', () => {
  const validColors = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#10b981',
    '#f59e0b',
    '#ef4444',
  ];

  it('returns one of the predefined colors', () => {
    const color = getRandomColor();
    expect(validColors).toContain(color);
  });

  it('can produce deterministic output with mocked Math.random', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.99);

    expect(getRandomColor()).toBe('#ef4444');

    randomSpy.mockRestore();
  });
});

describe('transformRoomData', () => {
  it('transforms room data into the UI-friendly shape', () => {
    const room = {
      id: 'room-1',
      name: 'Study Group',
      memberCount: 3,
      focusingCount: 2,
      updatedAt: '2026-03-20T10:00:00.000Z',
    };

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const transformed = transformRoomData(room as any);

    expect(transformed).toEqual({
      id: 'room-1',
      name: 'Study Group',
      memberCount: 3,
      focusingCount: 2,
      lastActive: new Date('2026-03-20T10:00:00.000Z').toLocaleDateString(),
      color: '#6366f1',
    });

    randomSpy.mockRestore();
  });
});
