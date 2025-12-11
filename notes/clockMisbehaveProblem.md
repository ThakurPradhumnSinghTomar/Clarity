###i found a big artitectural bug in my project after making it, actually i am making a timer and stopwatch which user can start in starting of thier focus session and submit thier session to keep track of how much they studied, everything seems to working correctly on some testing in our vs code and i deployed it, but when i actually start using it, i notice a strange thing : 
suppose i start focusing and start my stopwatch in my browser and minimise it to countinue my work, and after returning on stopwatch after 10 minutes, what i noticed that only 2 minutes is passed on stopwatch, why!! and if i observe it when it running, it properly works with increasing second by second , here is its clock component code :
how much big problem is that and how to solve it??

This is a very common and significant problem in web applications! You've discovered that browsers throttle or pause JavaScript timers (setInterval/setTimeout) when tabs are inactive/minimized to save resources. This is browser behavior, not a bug in your code.

Why This Happens:

Inactive tabs: Browsers slow down timers to ~1 second intervals (or pause them entirely)
Minimized windows: Even more aggressive throttling
Mobile background: Timers essentially stop

Instead of counting seconds with setInterval, calculate elapsed time based on timestamps:

Key Changes:

Timestamp-based tracking: Instead of setInterval incrementing a counter, we store when the session started and calculate elapsed time from Date.now()
Accurate across tab switches: Even if the browser throttles the interval, when you return to the tab, it calculates the real elapsed time
Pause/resume support: Tracks accumulated time when paused, so you can stop and restart accurately
100ms update interval: Updates display frequently for smooth visuals, but time calculation is always based on actual timestamps

How It Works:

Start: Records sessionStartTime = new Date()
Every 100ms: Calculates elapsedSeconds = (now - sessionStartTime) / 1000
Display: Shows calculated time, not a counter

This is the standard solution used by all production timer apps (Pomodoro apps, time trackers, etc.). Your time tracking will now be accurate regardless of browser throttling! 🎯