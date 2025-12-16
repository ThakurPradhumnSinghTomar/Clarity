"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../button';
import { useSession } from "next-auth/react" 

const useUnmountClear = (ref: React.MutableRefObject<NodeJS.Timeout | null>) => {
  useEffect(() => {
    return () => {
      if (ref.current) {
        clearInterval(ref.current);
        ref.current = null;
      }
    };
  }, [ref]);
};

const Clock = () => {
    const [type, setType] = useState("Stopwatch");
    const [timerDuration, setTimerDuration] = useState(3600); // Target duration for timer
    const [isRunning, setIsRunning] = useState(false);
    const [isSavingSession, setisSavingSession] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [pausedAt, setPausedAt] = useState<Date | null>(null);
    const [accumulatedTime, setAccumulatedTime] = useState(0); // Time accumulated before pause
    const [currentTime, setCurrentTime] = useState(0); // Current elapsed/remaining time
    const [edit, setEdit] = useState(false);
    const [tags, setTags] = useState<string | null>(null);
    const { data: session } = useSession()

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    useUnmountClear(intervalRef);

    // Calculate display time
    const displayTime = type === "Stopwatch" ? currentTime : Math.max(0, timerDuration - currentTime);
    const hours = Math.floor(displayTime / 3600);
    const minutes = Math.floor((displayTime % 3600) / 60);
    const seconds = displayTime % 60;


  async function setUserFocusing(isFocusing: boolean) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/focusing`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify({ isFocusing }),
    }
  );

  if (!response.ok) {
    console.log("Failed to update focusing state");
    return;
  }

  console.log("Focusing state updated");
}
    // Timer completion check
    useEffect(() => {
        if (type === "Timer" && isRunning && currentTime >= timerDuration) {
            handleTimerComplete();
        }
    }, [currentTime, timerDuration, isRunning, type]);

    // Update current time based on actual elapsed time
    useEffect(() => {
        if (!isRunning || !sessionStartTime) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Update immediately
        updateCurrentTime();

        // Then update every 100ms for smooth display
        intervalRef.current = setInterval(() => {
            updateCurrentTime();
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, sessionStartTime, accumulatedTime]);

    const updateCurrentTime = () => {
        if (!sessionStartTime) return;
        
        const now = new Date();
        const elapsedMs = now.getTime() - sessionStartTime.getTime();
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const totalSeconds = accumulatedTime + elapsedSeconds;
        
        setCurrentTime(totalSeconds);
    };

    async function handleStartFocusingClick() {
        if (!isRunning) {
            const now = new Date();
            setSessionStartTime(now);
            setPausedAt(null);
            setIsRunning(true);
            await setUserFocusing(true);
        }
    }

    async function handleStopFocusingClick() {
        if (isRunning && sessionStartTime) {
            const now = new Date();
            setPausedAt(now);
            
            // Calculate and store accumulated time
            const elapsedMs = now.getTime() - sessionStartTime.getTime();
            const elapsedSeconds = Math.floor(elapsedMs / 1000);
            setAccumulatedTime(prev => prev + elapsedSeconds);
            
            setIsRunning(false);
            await setUserFocusing(false);
            setSessionStartTime(null);
        }
    }

    async function handleTimerComplete() {
        setIsRunning(false);
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        
        await handleSaveSessionClick();
    }

    async function handleSaveSessionClick() {
        if (currentTime === 0) return;

        setisSavingSession(true);
        
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/save-focus-sesssion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    startTime: sessionStartTime || pausedAt,
                    endTime: new Date(),
                    durationSec: currentTime,
                    tag: tags,
                    note: null
                })
            });

            if (!response.ok) {
                console.log("unable to save focus session");
                return;
            }

            const res = await response.json();
            console.log("focus session saved successfully...", res.data.focusSession);

            alert(`Congratulations, focus duration of ${Math.floor(currentTime / 60)} minutes saved!`);
            
            // Reset everything
            handleReset();
            await setUserFocusing(false);

            setisSavingSession(false);

            return true;

        } catch (error) {
            console.log("unable to save focus session, got an error: " + error);
            setisSavingSession(false);
            return;
        }
    }

    function handleReset() {
        setIsRunning(false);
        setCurrentTime(0);
        setAccumulatedTime(0);
        setSessionStartTime(null);
        setPausedAt(null);
        
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    return (
        <div className='min-h-screen flex justify-center bg-white dark:bg-black'>
            <div className='flex-col'>
                <div className="md:w-100 md:h-100 w-80 h-80 rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white flex items-center justify-center shadow-2xl border-2 border-gray-300 dark:border-zinc-800 mt-10 m-8">
                    <div className='flex-col justify-between'>
                        <div className='flex justify-center items-center md:mb-20 mb-15 font-bold text-lg'>
                            {type}
                        </div>
                        <div className='flex justify-around text-7xl font-bold'>
                            <div>{hours > 9 ? `${hours}` : `0${hours}`}</div>
                            <div>:</div>
                            <div>{minutes > 9 ? `${minutes}` : `0${minutes}`}</div>
                            <div>:</div>
                            <div>{seconds > 9 ? `${seconds}` : `0${seconds}`}</div>
                        </div>

                        <div className='flex justify-center'>
                            <div className='flex justify-center items-center md:mt-20 mt-15 ml-4 font-bold cursor-pointer p-2 px-4 bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 rounded-2xl transition-colors' onClick={() => setEdit(true)}>
                                Edit🛠️
                            </div>

                            {edit && (
                                <div className='absolute top-50 min-h-100 w-100 rounded-2xl z-50 bg-gray-100 dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-800'>
                                    <div className='flex p-4 pl-2 justify-around font-bold'>
                                        <div className={`rounded-2xl cursor-pointer transition-all ${type == "Stopwatch" ? "p-4 bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg" : "pt-4 text-gray-900 dark:text-white"}`} onClick={() => setType("Stopwatch")}>Stopwatch</div>
                                        <div className={`rounded-2xl cursor-pointer transition-all ${type == "Timer" ? "p-4 bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg" : "pt-4 text-gray-900 dark:text-white"}`} onClick={() => setType("Timer")}>Timer</div>
                                    </div>

                                    <div>
                                        {type == "Stopwatch" ?
                                            <div className='p-6 flex justify-center text-gray-900 dark:text-white'>
                                                <p>To save session, you can stop focusing and click on save session</p>
                                            </div>
                                            :
                                            <div className='flex-col'>
                                                <div className='flex-col justify-center gap-4 m-4'>
                                                    <div className='font-bold p-2 text-gray-900 dark:text-white'><h1>Set Timer</h1></div>
                                                    <div>
                                                        <input
                                                            type="number"
                                                            placeholder="30 minutes"
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700
                                                                focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white
                                                                bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                                                            onChange={(e) => {
                                                                const v = Number(e.target.value)
                                                                if (v < 0.1) {
                                                                    setTimerDuration(0)
                                                                    return
                                                                }
                                                                setTimerDuration(v * 60)
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        }

                                        <div className='m-4'>
                                            <h1 className='m-2 text-gray-900 dark:text-white font-medium'>Add tag to session:</h1>
                                            <input 
                                                type="text" 
                                                className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-700
                                                    focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white
                                                    bg-white dark:bg-zinc-800 text-gray-900 dark:text-white' 
                                                placeholder='College Study'
                                                value={tags || ''}
                                                onChange={(e) => setTags(e.target.value)}
                                            />
                                        </div>

                                        <div className='flex justify-center items-center'>
                                            <p className='font-bold border-gray-900 dark:border-white border-2 m-4 w-10 h-10 cursor-pointer text-2xl rounded-full flex justify-center items-center bg-gray-900 dark:bg-white text-white dark:text-black transition-transform duration-200 hover:scale-105' onClick={() => setEdit(false)}>X</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className='flex justify-center items-center md:mt-20 mt-12 ml-4 font-bold cursor-pointer text-3xl hover:scale-110 transition-transform' onClick={handleReset}>
                                🔄️
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-around gap-4'>
                    <div className='flex justify-center'>
                        {isRunning ?
                            <button onClick={handleStopFocusingClick} className='bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-2xl mt-4 fade-slide-up cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors'>Stop Focusing</button> :
                            <button onClick={handleStartFocusingClick} className='bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-2xl mt-4 fade-slide-up cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors'>Start Focusing</button>
                        }
                    </div>

                    <button
                        className="
                            bg-gray-900 dark:bg-white text-white dark:text-black font-bold p-4 rounded-2xl mt-4 fade-slide-up
                            hover:bg-gray-800 dark:hover:bg-gray-100
                            disabled:opacity-40
                            disabled:bg-gray-500 dark:disabled:bg-gray-400
                            disabled:cursor-not-allowed 
                            disabled:hover:bg-gray-500 dark:disabled:hover:bg-gray-400
                            cursor-pointer
                            transition-colors
                        "
                        disabled={!(currentTime > 0 && !isRunning && !isSavingSession)}
                        onClick={handleSaveSessionClick}
                    >
                        {isSavingSession ? "saving session" : "save session"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Clock