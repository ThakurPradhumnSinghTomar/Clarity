import { ClockProps } from '@repo/types'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../button';
import { useSession } from "next-auth/react" 


/*

🧠 What is useUnmountClear?

It’s just a custom hook whose only job is:

👉 When the component unmounts (user leaves the page / component removed), it clears the interval automatically.

Because if you don’t do this, your interval can continue running in the background → creating a “ghost Timer”.


*/

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

    const [type,setType] = useState("Stopwatch");
    const [initial,setInitial] = useState(3600);
    const [focusDuration,setFocusDuration] = useState(0);
    const [stopwatchRunning, setStopwatchRunning] = useState(false);
    const [TimerRunning, setTimerRunning] = useState(false);
    const [sessionSaved,setSessionSaved] = useState(false);
    const [startTime, setStartTime] = useState<Date|null>(null);
    const [endTime, setEndTime] = useState<Date|null>(null);
    const [timer,setTimer] = useState(0);
    const [edit,setEdit] = useState(false);
    const [tags,setTags] = useState(null);
    const [isSessionStarted,setIsSessionStarted] = useState<boolean>(false);
    const { data: session } = useSession()
    const token = session?.accessToken // Your backend JWT token

    useEffect(() => {
        if (initial < 1) {
            if (intervalRef.current) {
            setTimerRunning(false)
            clearInterval(intervalRef.current)
            intervalRef.current = null
            }
        }
        }, [initial])
    
    //the value inside useRef stays persistent across renders.
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    useUnmountClear(intervalRef);
    const hours = (type == "Stopwatch"? Math.floor(focusDuration / 3600) : Math.floor(initial / 3600));
    const minutes = (type=="Stopwatch"?Math.floor((focusDuration % 3600) / 60):Math.floor((initial % 3600)/60));
    const seconds = (type=="Stopwatch"?focusDuration % 60:initial % 60);
  

    function handleStartFocusingClick(){
        if(!isSessionStarted){
            setIsSessionStarted(true);
            const start = new Date();
            setStartTime(start);
        }

        if(type == "Stopwatch"){
            setStopwatchRunning(true);

             if (intervalRef.current) return; // prevent multiple intervals

             intervalRef.current = setInterval(() => {
             setFocusDuration(v => v + 1);
              }, 1000);
        }
        else if (type == "Timer"){

            if (intervalRef.current) return; // prevent multiple intervals

                setTimerRunning(true);

             intervalRef.current = setInterval(() => {
             setFocusDuration(v => v + 1);
             setInitial(v=>v-1);
              }, 1000);

        }
        else{

        }
        
    }

    function handleStopFocusingClick(){

        const endtime = new Date();

        setEndTime(endtime);

        if(type == "Stopwatch"){

             if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            }
            setStopwatchRunning(false);
            
        }
        else if (type == "Timer"){

            if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            }
            setTimerRunning(false);

        }
        else{

        }
        
    }

    

    async function handleSaveSessionClick(){

        //send cutrrent duration and tag here to backend
        setSessionSaved(true);
        setIsSessionStarted(false);
        const endtime = endTime || new Date();
        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/save-focus-sesssion`,{
                method : "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${session?.accessToken}`
                },
                body : JSON.stringify({
                    startTime : startTime,
                    endTime : endTime,
                    durationSec : focusDuration,
                    tag : tags,
                    note : null
                })
            });

            if(!response.ok){
                console.log("unable to save focus session");
                return ;
            }

            console.log("focus session saved succesfully...");


             alert(`congratulations,focus duration of ${focusDuration} saved...`);
              setFocusDuration(0);
             setInitial(3600);
            setStartTime(null);
            setSessionSaved(false);

            return true;

        }
        catch(error){
            console.log("unable to save focus session, got a error : "+error);
            return ;

        }

        
    }

    function handleReset(){
        setFocusDuration(0);
        if(type == "Stopwatch"){

             if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            }
            setStopwatchRunning(false);
            
        }
        else if (type == "Timer"){

            setInitial(3600);
            if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            }

            setTimerRunning(false);

        }
        else{

        }
    }


    
  return (
        <div className='min-h-screen flex justify-center'>
            <div className='flex-col'>
                <div className="md:w-100 md:h-100 w-80 h-80 rounded-full bg-[#a4a7a8] dark:bg-[#1a2333] text-gray-200 flex items-center justify-center shadow-2xl border-2 border-cyan-950 mt-10 m-8">
                <div className='flex-col justify-between'>

                    <div className='flex justify-center items-center md:mb-20 mb-15 font-bold'>
                        {type}
                    </div>
                    <div className='flex justify-around text-7xl'>
                        <div>{hours>9?`${hours}`: `0${hours}`}</div>
                        <div>:</div>
                        <div>{minutes%60>9?`${minutes%60}`: `0${minutes%60}`}</div>
                        <div>:</div>
                        <div>{seconds%60>9?`${seconds%60}`: `0${seconds%60}`}</div>
                    </div>

                    <div className='flex justify-center'>
                        <div className='flex justify-center items-center md:mt-20 mt-15 ml-4 font-bold cursor-pointer p-2 px-4 dark:bg-[#0F172A] rounded-2xl' onClick={()=>(setEdit(true))}>
                        Edit🛠️
                        </div>

                        {
                            edit&&(<div className='absolute top-50 min-h-100 w-100 rounded-2xl z-50 bg-[#8a9092] dark:bg-[#272f3c] shadow-2xl'>
                            <div className='flex p-4 pl-2 justify-around font-bold'>
                                <div className={`rounded-2xl cursor-pointer ${type == "Stopwatch"? "p-4 bg-blue-800 shadow-2xl" : "pt-4"}`} onClick={()=>(setType("Stopwatch"))}>Stopwatch</div>
                                <div className={`rounded-2xl cursor-pointer ${type == "Timer"? "p-4 bg-blue-800 shadow-2xl" : "pt-4"}`}  onClick={()=>(setType("Timer"))}>Timer</div>
                            </div>

                            <div>
                                {type=="Stopwatch"?
                                    <div className='p-6 flex justify-center'><p>To save session, you can stop focusing  and click on save session</p>

                                    </div>
                                    :
                                    
                                    <div className='flex-col'>
                                        <div className='flex-col justify-center gap-4 m-4'>
                                            <div className='font-bold p-2'><h1>Set Timer</h1></div>
                                            <div><input
                                                    type="number"
                                                    placeholder="30 minutes"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300
                                                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                                                dark:bg-gray-900 dark:text-white dark:border-gray-700"
                                                    onChange={(e) => {
                                                        const v = Number(e.target.value)
                                                        if (v < 0.1) {
                                                        setInitial(0)
                                                        return
                                                        }
                                                        setInitial(v * 60)
                                                    }}
                                                    />

                                            </div>

                                            
                                        </div>  
                                    </div>}

                                    <div className='m-4'>
                                        <h1 className='m-2'>Add tag to session :</h1>
                                        <input type="text" className='w-full px-3 py-2 rounded-lg border border-gray-300 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                dark:bg-gray-900 dark:text-white dark:border-gray-700' placeholder='College Study'/>
                                    </div>

                                    <div className='flex justify-center items-center '>
                                        <p className='font-bold border-black border-2  m-4 w-10 h-10 cursor-pointer text-2xl rounded-full flex justify-center items-center bg-[#272f3c] transition-transform duration-200 hover:scale-105' onClick={()=>(setEdit(false))}>X</p>
                                    </div>
                            </div>

                        </div>)
                        }

                        <div className='flex justify-center items-center md:mt-20 mt-12 ml-4 font-bold cursor-pointer text-3xl' onClick={handleReset}>
                            🔄️
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-around'>
                <div className='flex justify-center'>
                {stopwatchRunning||TimerRunning?
                    <button onClick={handleStopFocusingClick} className='bg-green-500 font-bold p-4 dark:text-white rounded-2xl mt-4 fade-slide-up cursor-pointer'>Stop Focusing</button>: 
                    <button onClick={handleStartFocusingClick} className='bg-green-500 font-bold p-4 dark:text-white rounded-2xl mt-4 fade-slide-up cursor-pointer'>Start Focusing</button>}
                </div>

               <button
                className="
                    bg-green-500 font-bold p-4 rounded-2xl mt-4 fade-slide-up 
                    dark:text-white
                    disabled:opacity-40
                    disabled:bg-green-400
                    disabled:cursor-not-allowed 
                    disabled:hover:bg-green-500
                    cursor-pointer
                "
                disabled={!(focusDuration > 0 && (!stopwatchRunning && !TimerRunning))}
                onClick={handleSaveSessionClick}
                >
                Save Session
                </button>
            </div>
            </div> 
        </div> 
         )
}

export default Clock