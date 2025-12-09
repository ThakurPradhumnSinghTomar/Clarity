export type Student = {
    name: string
    totalHours: number
    uid: string
    image: string
};

export interface LeaderboardProps {
    students: Student[];
}
