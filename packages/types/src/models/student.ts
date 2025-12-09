export type Student = {
    name: string
    totalHours: number
    uid: string
    profileImg: string
};

export interface LeaderboardProps {
    students: Student[];
}
