import React, { useState, useEffect, useCallback } from 'react';
import Desktop from './components/Desktop';
import Taskbar from './components/Taskbar';
import Window from './components/Window';
import StartMenu from './components/StartMenu';
import TopSearch from './components/TopSearch';
import VoiceAssistant from './components/VoiceAssistant';
import SystemDialog from './components/SystemDialog';
import SplashScreen from './components/SplashScreen';
import { useWindowManager } from './hooks/useWindowManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { useIsMobile } from './hooks/useIsMobile';
import MobileOS from './mobile/MobileOS';
import {
  folderIcon, fileExplorerIcon, gamesFolderIcon, ticTacToeIcon, lumaAiIcon, sysMonitorIcon
} from './utils/icons';

import { useFileSystem } from './hooks/useFileSystem';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const SITE_URL = 'https://vishalos.netlify.app';

// Clean URL path mapping for Google Sitelinks & SEO
const SEO_ROUTES = {
  '/projects': {
    appId: 'projects-folder',
    title: 'Projects | Vishal Sinha — Full Stack & AI Portfolio',
    description: 'Explore Startup, Client, Final Semester, and Personal software projects built by Vishal Sinha using Python, Django, React.js, and AI/ML.'
  },
  '/experience': {
    appId: 'experience-folder',
    title: 'Experience | Vishal Sinha — Python AI/ML Internship',
    description: 'View Vishal Sinha’s professional experience, including the Python AI/ML Internship at Techmicra IT Solutions, Ahmedabad and verified certificates.'
  },
  '/resume': {
    appId: 'resume',
    title: 'Resume / CV | Vishal Sinha — Full Stack Developer',
    description: 'View and download the official Resume / CV of Vishal Sinha, Full Stack Web Developer and AI/ML Engineer.'
  },
  '/about': {
    appId: 'about-us',
    title: 'About Vishal Sinha | Full Stack Developer & AI/ML Engineer',
    description: 'Learn about Vishal Sinha, a Full Stack Developer specializing in Python, Django, React.js, and Artificial Intelligence.'
  },
  '/luma-ai': {
    appId: 'luma-ai',
    title: 'LUMA.EXE Voice AI Assistant | Vishal OS 98',
    description: 'Interact with LUMA.EXE, a retro voice and text AI assistant engineered by Vishal Sinha inside Vishal OS 98.'
  },
  '/games': {
    appId: 'games-folder',
    title: 'Retro Games | Vishal OS 98 Portfolio',
    description: 'Play classic Windows 98 retro games including Minesweeper, Snake, and Tic Tac Toe inside Vishal OS 98.'
  }
};

// Reverse map: app.id -> clean URL path
const APP_ID_TO_PATH = Object.entries(SEO_ROUTES).reduce((acc, [path, cfg]) => {
  acc[cfg.appId] = path;
  return acc;
}, {});

// Detect search engine crawlers or direct deep links so they skip BIOS/Splash
const shouldSkipBoot = () => {
  if (typeof window === 'undefined') return true;
  if (sessionStorage.getItem('vishal_os_splash_seen') === 'true') return true;

  const ua = navigator.userAgent?.toLowerCase() || '';
  const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|inspect/i.test(ua);
  const hasDeepPath = window.location.pathname && window.location.pathname !== '/';
  const hasAppQuery = new URLSearchParams(window.location.search).has('app');

  return isBot || hasDeepPath || hasAppQuery;
};

function App() {
  const [systemApps, setSystemApps] = useState([]);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [bootState, setBootState] = useState(() => (shouldSkipBoot() ? 3 : 0));
  const [bootText, setBootText] = useState([]);
  const fsApi = useFileSystem(systemApps);

  const isMobile = useIsMobile();

  // -- SHUTDOWN MODAL STATES --
  const [showShutdown, setShowShutdown] = useState(false);
  const [shutdownChoice, setShutdownChoice] = useState('shutdown');

  const [isCrtMode, setIsCrtMode] = useLocalStorage('vishal_os_crt_mode', true);
  const [bgTheme, setBgTheme] = useLocalStorage('vishal_os_bg', '#008080');
  const { playSound } = useSound();

  const {
    windows: openApps,
    openWindow: openApp,
    closeWindow: closeApp,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    updateWindowPosition,
    activeWindowId
  } = useWindowManager();

  // Helper to update <title>, <meta name="description">, and canonical URL
  const updateSeoMeta = useCallback((appObj) => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    if (!appObj) {
      document.title = 'Vishal Sinha | Retro Windows 98 OS Portfolio — Full Stack & AI/ML Developer';
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Explore the interactive Windows 98 OS portfolio of Vishal Sinha, a Full Stack Developer (Python, Django, React.js) & AI/ML Engineer. View Projects, Experience, Resume, and LUMA AI.'
        );
      }
      if (canonical) canonical.setAttribute('href', `${SITE_URL}/`);
      return;
    }

    const cleanPath = APP_ID_TO_PATH[appObj.id];
    const routeSeo = cleanPath ? SEO_ROUTES[cleanPath] : null;

    document.title = routeSeo ? routeSeo.title : `${appObj.name} | Vishal Sinha Portfolio`;
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        routeSeo?.description || appObj.description || `Explore ${appObj.name} inside Vishal Sinha's Windows 98 OS Portfolio.`
      );
    }
    if (canonical) {
      const targetUrl = cleanPath ? `${SITE_URL}${cleanPath}` : `${SITE_URL}/?app=${appObj.id}`;
      canonical.setAttribute('href', targetUrl);
    }
  }, []);

  // Wrapper around openApp that also updates the browser URL for SEO
  const handleOpenAppById = useCallback(
    (idOrObj) => {
      const targetApp =
        typeof idOrObj === 'string'
          ? systemApps.find((a) => a.id === idOrObj)
          : idOrObj;

      if (!targetApp) return;

      openApp(targetApp);
      updateSeoMeta(targetApp);

      const cleanPath = APP_ID_TO_PATH[targetApp.id];
      const nextUrl = cleanPath || `/?app=${targetApp.id}`;
      if (window.location.pathname + window.location.search !== nextUrl) {
        window.history.pushState({ appId: targetApp.id }, '', nextUrl);
      }
    },
    [systemApps, openApp, updateSeoMeta]
  );

  // --- BOOT SEQUENCE LOGIC ---
  useEffect(() => {
    if (bootState === 3) {
      sessionStorage.setItem('vishal_os_splash_seen', 'true');
      return;
    }

    const biosLines = [
      "Award Modular BIOS v4.51PG, An Energy Star Ally",
      "Copyright (C) 1984-1998, Award Software, Inc.",
      "",
      "VISHAL-OS-98 SYSTEM BIOS V1.0",
      "",
      "Pentium(R) II Processor - 300MHz",
      "Memory Test :  65536K OK",
      "",
      "Award Plug and Play BIOS Extension v1.0A",
      "Initialize Plug and Play Cards...",
      "PNP Init Completed",
      "",
      "Detecting Primary Master   ... WDC WD3200AAJS",
      "Detecting Primary Slave    ... None",
      "Detecting Secondary Master ... HL-DT-ST CD-ROM",
      "Detecting Secondary Slave  ... None",
      "",
      "Starting Vishal OS 98...",
    ];

    let currentLine = 0;

    if (bootState === 0) {
      const interval = setInterval(() => {
        if (currentLine < biosLines.length) {
          setBootText((prev) => [...prev, biosLines[currentLine]]);
          currentLine++;
        } else {
          clearInterval(interval);
          setTimeout(() => setBootState(1), 800);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [bootState]);

  // Handle BIOS Skip
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === 'Enter' && bootState === 0) {
        setBootState(1);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [bootState]);

  // Handle System Reboot/Logoff events
  useEffect(() => {
    const handleSysShutdown = (e) => {
      if (e.detail === 'restart') {
        playSound('shutdown');
        sessionStorage.removeItem('vishal_os_splash_seen');
        setBootText([]);
        setBootState(0);
      } else if (e.detail === 'shutdown') {
        playSound('shutdown');
        setBootState(4);
      } else if (e.detail === 'logoff') {
        sessionStorage.removeItem('vishal_os_splash_seen');
        setBootState(1);
      }
    };
    window.addEventListener('sys-shutdown', handleSysShutdown);
    return () => window.removeEventListener('sys-shutdown', handleSysShutdown);
  }, [playSound]);

  // --- FETCH APPS ---
  useEffect(() => {
    const staticFallbackApps = [
      { id: 'system-os', name: 'My Computer', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_computer_musical_keyboard.ico" },
      { id: 'network', name: 'Network Neighborhood', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w2k_network_neighborhood.ico" },
      { id: 'recycle-bin', name: 'Recycle Bin', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_recycle_bin_full_cool.ico" },
      { id: 'ie', name: 'Internet Explorer', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w2k_internet_explorer.ico" },
      { id: 'notepad', name: 'Notepad', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_notepad.ico", isSystemTool: true },
      { id: 'paint', name: 'Paint', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_paintbrush.ico", isSystemTool: true },
      { id: 'minesweeper', name: 'Minesweeper', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_minesweeper.ico", isGame: true },
      { id: 'snake', name: 'Snake', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_joystick.ico", isGame: true },
      { id: 'luma-ai', name: 'LUMA.EXE', icon: lumaAiIcon },
      { id: 'system-monitor', name: 'System Monitor', icon: sysMonitorIcon, isSystemTool: true },
      { id: 'about-us', name: 'About Vishal', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_users.ico" },
      { id: 'resume', name: 'Resume', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w2k_text_file.ico" },
      {
        id: 'experience-folder',
        name: 'Experience',
        icon: folderIcon,
        position: { x: 20, y: 420 },
        isMinimized: false,
        isMaximized: false,
      },
      { id: 'file-explorer', name: 'File Explorer', icon: fileExplorerIcon },
      { id: 'projects-folder', name: 'Projects', icon: folderIcon },
      { id: 'games-folder', name: 'Games', icon: gamesFolderIcon },
      { id: 'tic-tac-toe', name: 'Tic Tac Toe', icon: ticTacToeIcon, isGame: true },
      { id: 'problem-solver', name: 'MS-DOS Prompt', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_ms-dos_2.ico", isSystemTool: true },
      { id: 'settings', name: 'Control Panel', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_directory_control_panel.ico" }
    ];

    // Set static apps immediately so deep links (/projects, /resume, etc.) open without waiting for backend
    setSystemApps(staticFallbackApps);

    fetch(`${API_BASE_URL}/system-apps/`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        const formattedApps = data.map((item) => ({
          id: item.app_id,
          name: item.name,
          icon: item.icon,
          description: item.description,
          tech_stack: item.tech_stack,
          frontend_repo: item.frontend_repo,
          backend_repo: item.backend_repo,
          live_link: item.live_link,
          project_type: item.project_type,
          order: item.order,
          isProject: true
        }));

        setSystemApps([
          ...staticFallbackApps.filter((app) => app.id !== 'settings'),
          ...formattedApps,
          { id: 'settings', name: 'Control Panel', icon: "https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_directory_control_panel.ico" }
        ]);
      })
      .catch((err) => {
        console.error('Failed to load dynamic apps from backend:', err);
      });
  }, []);

  // --- CLEAN URL & QUERY PARAMETER ROUTING (FOR SITELINKS & BACK/FORWARD BUTTONS) ---
  useEffect(() => {
    if (bootState !== 3 || systemApps.length === 0) return;

    const resolveUrlToApp = () => {
      const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const searchParams = new URLSearchParams(window.location.search);
      const queryAppId = searchParams.get('app');

      const matchedRoute = SEO_ROUTES[normalizedPath];
      const appIdToOpen = matchedRoute ? matchedRoute.appId : queryAppId;

      if (appIdToOpen) {
        const targetApp = systemApps.find((a) => a.id === appIdToOpen);
        if (targetApp) {
          openApp(targetApp);
          updateSeoMeta(targetApp);
        }
      } else {
        updateSeoMeta(null);
      }
    };

    resolveUrlToApp();
    window.addEventListener('popstate', resolveUrlToApp);
    return () => window.removeEventListener('popstate', resolveUrlToApp);
  }, [bootState, systemApps, openApp, updateSeoMeta]);

  const confirmShutdown = () => {
    setShowShutdown(false);
    if (shutdownChoice === 'logoff') {
      sessionStorage.removeItem('vishal_os_splash_seen');
      setBootState(1);
    } else if (shutdownChoice === 'restart') {
      playSound('shutdown');
      sessionStorage.removeItem('vishal_os_splash_seen');
      setTimeout(() => {
        setBootText([]);
        setBootState(0);
      }, 2000);
    } else if (shutdownChoice === 'shutdown') {
      playSound('shutdown');
      setTimeout(() => setBootState(4), 1000);
    }
  };

  return (
    <div
      className="relative h-[100dvh] w-full text-os-text overflow-hidden flex flex-col font-sans select-none"
      style={{ backgroundColor: bgTheme }}
      onClick={() => isStartMenuOpen && setIsStartMenuOpen(false)}
    >
      {/* Semantic Crawlable Sitelinks Navigation for Googlebot */}
      <nav aria-label="Primary Portfolio Navigation" className="sr-only">
        <a href="/projects" onClick={(e) => { e.preventDefault(); handleOpenAppById('projects-folder'); }}>Projects</a>
        <a href="/experience" onClick={(e) => { e.preventDefault(); handleOpenAppById('experience-folder'); }}>Experience</a>
        <a href="/resume" onClick={(e) => { e.preventDefault(); handleOpenAppById('resume'); }}>Resume</a>
        <a href="/about" onClick={(e) => { e.preventDefault(); handleOpenAppById('about-us'); }}>About Vishal</a>
        <a href="/luma-ai" onClick={(e) => { e.preventDefault(); handleOpenAppById('luma-ai'); }}>LUMA.EXE AI Assistant</a>
        <a href="/games" onClick={(e) => { e.preventDefault(); handleOpenAppById('games-folder'); }}>Games</a>
      </nav>

      {isCrtMode && <div className="crt-overlay pointer-events-none z-[10001]"></div>}

      {/* --- STATE 0: BIOS SCREEN --- */}
      {bootState === 0 && (
        <div className="absolute inset-0 bg-black text-[#c0c0c0] font-mono text-sm md:text-lg p-4 md:p-6 z-[9999] overflow-hidden" onClick={() => setBootState(1)}>
          <div className="absolute top-4 right-4 md:top-6 md:right-6 border border-yellow-500 text-yellow-500 px-2 py-1 flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold italic">EPA</span>
            <span className="text-[10px] md:text-xs uppercase leading-tight">Pollution<br />Preventer</span>
          </div>
          {bootText.map((line, index) => <div key={index} className="break-words">{line}</div>)}
          <div className="mt-4 animate-pulse">_</div>
          <div className="absolute bottom-4 left-4 text-xs md:text-sm text-gray-600">Press ENTER or Click to skip</div>
        </div>
      )}

      {/* --- STATE 1: SMART 90s SPLASH SCREEN --- */}
      {bootState === 1 && (
        <SplashScreen
          apiUrl={API_BASE_URL}
          onComplete={() => setBootState(3)}
        />
      )}

      {/* --- STATE 3: OS ENVIRONMENT FORK --- */}
      {bootState === 3 && isMobile && (
        <MobileOS
          systemApps={systemApps}
          openApps={openApps}
          activeWindowId={activeWindowId}
          fsApi={fsApi}
          openApp={handleOpenAppById}
          closeApp={closeApp}
          focusWindow={focusWindow}
          minimizeWindow={minimizeWindow}
          toggleMaximize={toggleMaximize}
          updateWindowPosition={updateWindowPosition}
          isCrtMode={isCrtMode}
          setIsCrtMode={setIsCrtMode}
          bgTheme={bgTheme}
          setBgTheme={setBgTheme}
          playSound={playSound}
          onShutDown={() => { setShutdownChoice('shutdown'); setShowShutdown(true); }}
          onLogOff={() => { setShutdownChoice('logoff'); setShowShutdown(true); }}
        />
      )}

      {bootState === 3 && !isMobile && (
        <>
          <SystemDialog />

          <Desktop
            systemApps={systemApps.filter((app) => [
              'system-os', 'network', 'recycle-bin', 'ie', 'notepad', 'paint', 'system-monitor', 'problem-solver', 'luma-ai', 'about-us', 'resume', 'file-explorer',
              'projects-folder', 'experience-folder', 'games-folder', 'settings'
            ].includes(app.id))}
            onOpenApp={handleOpenAppById}
          />

          {openApps.map((app) => (
            <Window
              key={app.id}
              app={app}
              fsApi={fsApi}
              isActive={activeWindowId === app.id}
              onClose={() => closeApp(app.id)}
              onCloseApp={closeApp}
              onOpenApp={handleOpenAppById}
              systemApps={systemApps}
              onFocus={() => focusWindow(app.id)}
              onMinimize={() => minimizeWindow(app.id)}
              onToggleMaximize={() => toggleMaximize(app.id)}
              onUpdatePosition={(pos) => updateWindowPosition(app.id, pos)}
              isCrtMode={isCrtMode}
              setIsCrtMode={setIsCrtMode}
              bgTheme={bgTheme}
              setBgTheme={setBgTheme}
              openWindowCount={openApps.length}
            />
          ))}

          {/* Custom Shutdown Modal */}
          {showShutdown && (
            <div className="absolute inset-0 z-[10000] flex items-center justify-center pointer-events-auto px-2">
              <div className="absolute inset-0 bg-transparent" onClick={(e) => { e.stopPropagation(); playSound('error'); }}></div>
              <div className="retro-window w-full max-w-sm shadow-retro-outset bg-os-gray border border-os-white relative z-10">
                <div className="retro-title-bar bg-blue-900 text-white font-dialog font-bold px-1 flex justify-between items-center cursor-default">
                  <span>Shut Down Windows</span>
                  <button className="retro-btn px-2 py-0 h-[18px] text-xs leading-none text-black bg-os-gray" onClick={() => setShowShutdown(false)}>X</button>
                </div>
                <div className="p-4 flex gap-4">
                  <div className="w-8 h-8 shrink-0 hidden sm:block">
                    <img src="https://cdn.jsdelivr.net/gh/trapd00r/win95-winxp_icons@master/icons/w98_computer_musical_keyboard.ico" alt="Computer" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div className="flex-1 font-sans text-sm text-os-text">
                    <p className="mb-2">What do you want the computer to do?</p>
                    <label className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input type="radio" name="shutdown" value="shutdown" checked={shutdownChoice === 'shutdown'} onChange={(e) => { playSound('click'); setShutdownChoice(e.target.value); }} className="w-3 h-3 cursor-pointer shrink-0" />
                      Shut down
                    </label>
                    <label className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input type="radio" name="shutdown" value="restart" checked={shutdownChoice === 'restart'} onChange={(e) => { playSound('click'); setShutdownChoice(e.target.value); }} className="w-3 h-3 cursor-pointer shrink-0" />
                      Restart
                    </label>
                    <label className="flex items-center gap-2 mb-1 cursor-pointer">
                      <input type="radio" name="shutdown" value="logoff" checked={shutdownChoice === 'logoff'} onChange={(e) => { playSound('click'); setShutdownChoice(e.target.value); }} className="w-3 h-3 cursor-pointer shrink-0" />
                      Log off Vishal
                    </label>
                  </div>
                </div>
                <div className="bg-os-gray p-2 border-t border-os-dark-gray flex justify-center gap-2 shadow-retro-inset mt-2 flex-wrap">
                  <button className="retro-btn w-20 py-1" onClick={() => { playSound('click'); confirmShutdown(); }}>OK</button>
                  <button className="retro-btn w-20 py-1" onClick={() => { playSound('click'); setShowShutdown(false); }}>Cancel</button>
                  <button className="retro-btn w-20 py-1" onClick={() => { playSound('click'); showSystemDialog({ type: 'info', message: 'Help not available.', buttons: ['OK'] }) }}>Help</button>
                </div>
              </div>
            </div>
          )}

          {isStartMenuOpen && (
            <div onClick={(e) => e.stopPropagation()}>
              <StartMenu
                systemApps={systemApps.filter((app) => !['settings'].includes(app.id))}
                onOpenApp={(id) => { handleOpenAppById(id); setIsStartMenuOpen(false); }}
                closeMenu={() => setIsStartMenuOpen(false)}
                onShutDown={() => { setShutdownChoice('shutdown'); setShowShutdown(true); }}
                onLogOff={() => { setShutdownChoice('logoff'); setShowShutdown(true); }}
              />
            </div>
          )}

          <TopSearch systemApps={systemApps} onOpenApp={handleOpenAppById} />

          <Taskbar
            openApps={openApps}
            activeWindowId={activeWindowId}
            onCloseApp={closeApp}
            onOpenApp={handleOpenAppById}
            onMinimizeApp={minimizeWindow}
            onFocusApp={focusWindow}
            isStartMenuOpen={isStartMenuOpen}
            toggleStartMenu={(e) => {
              if (e && e.stopPropagation) e.stopPropagation();
              setIsStartMenuOpen(!isStartMenuOpen);
            }}
          />
        </>
      )}

      {/* --- STATE 4: SAFE TO SHUTDOWN SCREEN --- */}
      {bootState === 4 && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[9999]">
          <div className="text-[#ff8c00] font-sans text-2xl font-bold text-center tracking-wide">
            It is now safe to turn off your computer.
          </div>
          <button
            onClick={() => {
              setBootText([]);
              setBootState(0);
            }}
            className="mt-12 px-6 py-2 border-2 border-os-dark-gray bg-os-gray text-black font-bold font-sans active:shadow-retro-inset shadow-retro-outset"
          >
            Press Power Button
          </button>
        </div>
      )}
    </div>
  );
}

export default App;