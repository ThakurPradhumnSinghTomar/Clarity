
Planning WeeklyStudyHours update approach
For maintaining WeeklyStudyHours when a FocusSession is created, start by defining the "current week". A simple Monday-based week using server local time works well, though IST could be an option.

Next, when a FocusSession is completed:

Add a new FocusSession entry.

Calculate the week's start using its startTime.

Transform the session duration into seconds.

Add detailed comments in Prisma queries for clarity.

Planning WeeklyStudyHours upsert with days update
To update WeeklyStudyHours, using an "upsert" operation is ideal. First, check if a record already exists by querying for the user’s week. If it exists, increment the focusedSec for the correct weekday. If not, create a new days array, set values for the appropriate day, and create the record.