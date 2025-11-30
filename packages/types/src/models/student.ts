export type Student = {
    name: string
    studyHours: number
    uid: string
    profileImg: string
};

export interface LeaderboardProps {
    students: Student[];
}
