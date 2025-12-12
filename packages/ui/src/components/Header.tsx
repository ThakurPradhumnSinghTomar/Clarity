// components/Header.tsx
import { useState } from 'react';
import { SignOutBtn } from "@repo/ui";
import { useSession } from "next-auth/react" 
import { useRouter } from "next/navigation"
import { ThemeProvider, useTheme } from "@repo/context-providers"; 

const Header = () => {
  const [isOptions, setisOptions] = useState(false);
  const [isMode, setisMode] = useState(false);
  const { data: session } = useSession()
  const router = useRouter()
  
  // Get theme context
  const { mode, setThemeMode } = useTheme();

  // Handler for theme selection
  const handleThemeChange = (newMode: "system" | "light" | "dark") => {
    setThemeMode(newMode);
    setisMode(false); // Close dropdown after selection
  };

  return (
    <div className='bg-white dark:bg-black text-gray-900 dark:text-white px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 shadow-sm'>
      {/* Logo */}
      <div className='font-bold cursor-pointer text-2xl hover:scale-105 transition-transform duration-200'>Rebuild</div>
      
      {/* Navigation */}
      <div className='flex items-center gap-6'>
        {/* Home Link */}
        <div 
          className='hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-all duration-200 font-medium hover:scale-105' 
          onClick={() => router.push("/home")}
        >
          Home
        </div>
        
        {/* Options Dropdown */}
        <div 
          className='relative'
          onMouseEnter={() => setisOptions(true)}
          onMouseLeave={() => setisOptions(false)}
        >
          <div className='hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-all duration-200 font-medium hover:scale-105'>
            Options
          </div>
          
          <div className={`
            absolute top-full left-0 mt-1 min-w-[200px]
            bg-white dark:bg-zinc-900 
            rounded-xl shadow-xl
            border border-gray-200 dark:border-zinc-800
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${isOptions 
              ? 'opacity-100 translate-y-0 visible' 
              : 'opacity-0 -translate-y-2 invisible pointer-events-none'
            }
          `}>
            <div className='py-2'>
              <div 
                className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white' 
                onClick={() => router.push("/home/study-session")}
              >
                Study Session
              </div>
              <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white'>
                Weekly Planner
              </div>
              <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white'>
                Habit Building
              </div>
              <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white'>
                Track Expenses
              </div>
              <div className='px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white border-t border-gray-200 dark:border-zinc-800'>
                <SignOutBtn />
              </div>
            </div>
          </div>
        </div>
      
        {/* Theme Dropdown - UPDATED */}
        <div 
          className='relative'
          onMouseEnter={() => setisMode(true)}
          onMouseLeave={() => setisMode(false)}
        >
          <div className='hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-all duration-200 font-medium hover:scale-105 flex items-center gap-2'>
            <span>Theme</span>
            {/* Show current mode indicator */}
            
          </div>
          
          <div className={`
            absolute top-full right-0 mt-1 min-w-[140px]
            bg-white dark:bg-zinc-900 
            rounded-xl shadow-xl
            border border-gray-200 dark:border-zinc-800
            overflow-hidden
            transition-all duration-300 ease-in-out 
            ${isMode 
              ? 'opacity-100 translate-y-0 visible' 
              : 'opacity-0 -translate-y-2 invisible pointer-events-none'
            }
          `}>
            <div className='py-2'>
              <div 
                className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white flex items-center justify-between ${
                  mode === 'system' ? 'bg-gray-100 dark:bg-zinc-800' : ''
                }`}
                onClick={() => handleThemeChange('system')}
              >
                <span>System</span>
                <span>💻</span>
              </div>
              <div 
                className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white flex items-center justify-between ${
                  mode === 'light' ? 'bg-gray-100 dark:bg-zinc-800' : ''
                }`}
                onClick={() => handleThemeChange('light')}
              >
                <span>Light</span>
                <span>☀️</span>
              </div>
              <div 
                className={`px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors duration-150 text-gray-900 dark:text-white flex items-center justify-between ${
                  mode === 'dark' ? 'bg-gray-100 dark:bg-zinc-800' : ''
                }`}
                onClick={() => handleThemeChange('dark')}
              >
                <span>Dark</span>
                <span>🌙</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Profile Image */}
        <div className='flex items-center'>
          <div 
            className='w-9 h-9 rounded-full overflow-hidden border-2 border-gray-300 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-600 transition-all duration-200 cursor-pointer hover:scale-110'
            onClick={() => router.push("/home/profile")}
          >
            <img 
              src={session?.user.image || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              alt="profile image of user"
              className='w-full h-full object-cover'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header;