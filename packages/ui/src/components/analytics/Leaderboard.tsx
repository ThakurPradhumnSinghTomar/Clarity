import React from 'react';
import { Trophy, Clock } from 'lucide-react';

interface Student {
  name: string;
  image?: string;
  totalHours: number;
  isFocusing?: boolean;
}

interface LeaderboardProps {
  students: Student[];
}

const Leaderboard = ({ students }: LeaderboardProps) => {
  const formatStudyTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedStudents = [...students].sort((a, b) => b.totalHours - a.totalHours);

  return (
    <div className="mt-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-[var(--color-text)]" size={24} />
          <div>
            <h3 className="text-lg font-semibold">Leaderboard</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Simple ranking by study time.
            </p>
          </div>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)]">
          {sortedStudents.length} members
        </span>
      </div>

      {sortedStudents.length > 1 && (
        <ul className="divide-y divide-[var(--color-border)] px-6 py-2">
          {sortedStudents.map((student, index) => (
            <li key={student.name + index} className="flex items-center gap-4 py-4">
              <span className="w-6 text-sm font-semibold text-[var(--color-text-subtle)]">
                {index + 1}
              </span>

              {student.image ? (
                <img
                  src={student.image}
                  alt={student.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-sm font-semibold text-[var(--color-text)]">
                  {getInitials(student.name)}
                </div>
              )}

              <div className="flex-1">
                <p className="text-sm font-semibold">{student.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {student.isFocusing ? 'Focusing now..🔥' : 'Offline'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
                <Clock size={14} />
                <span>{formatStudyTime(student.totalHours)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {sortedStudents.length <= 1 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <Trophy size={48} className="text-[var(--color-text-subtle)] mb-4" />
          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
            No Rankings Yet
          </h3>
          <p className="text-[var(--color-text-muted)] text-center">
            {sortedStudents.length === 0
              ? 'Start studying to appear on the leaderboard!'
              : 'Need more than 1 member in room for rankings...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
