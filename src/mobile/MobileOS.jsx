import React, { useState } from 'react';
import SystemDialog from '../components/SystemDialog';
import MobileHome from './MobileHome';
import MobileStatusBar from './MobileStatusBar';
import MobileTaskbar from './MobileTaskbar';
import MobileStartMenu from './MobileStartMenu';
import MobileWindow from './MobileWindow';
import MobileWindowSwitcher from './MobileWindowSwitcher';
import MobileSearch from './MobileSearch';

const MobileOS = ({
  systemApps,
  openApps,
  activeWindowId,
  fsApi,
  openApp,
  closeApp,
  focusWindow,
  minimizeWindow,
  toggleMaximize,
  updateWindowPosition,
  isCrtMode,
  setIsCrtMode,
  bgTheme,
  setBgTheme,
  playSound,
  onShutDown,
  onLogOff
}) => {

  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isWindowSwitcherOpen, setIsWindowSwitcherOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const desktopShortcuts = systemApps.filter(app => [
    'system-os', 'network', 'recycle-bin', 'ie', 'notepad', 'paint', 'system-monitor',
    'problem-solver', 'luma-ai', 'about-us', 'resume', 'file-explorer',
    'projects-folder', 'experience-folder', 'games-folder', 'settings'
  ].includes(app.id));

  return (
    <div className="mobile-os z-10 font-sans relative" style={{ backgroundColor: bgTheme }}>
      <MobileStatusBar />
      <SystemDialog />

      {/* min-h-0 strictly forces this flex-container to stay inside the viewport bounds */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0 w-full">
        <MobileHome
          systemApps={desktopShortcuts}
          onOpenApp={openApp}
          playSound={playSound}
        />

        {openApps.map((app) => (
          <MobileWindow
            key={app.id}
            app={app}
            fsApi={fsApi}
            isActive={activeWindowId === app.id}
            onClose={() => closeApp(app.id)}
            onCloseApp={closeApp}
            onOpenApp={openApp}
            systemApps={systemApps}
            onFocus={() => { playSound('click'); focusWindow(app.id); }}
            onMinimize={() => minimizeWindow(app.id)}
            isCrtMode={isCrtMode}
            setIsCrtMode={setIsCrtMode}
            bgTheme={bgTheme}
            setBgTheme={setBgTheme}
            openWindowCount={openApps.length}
          />
        ))}
      </div>

      {isWindowSwitcherOpen && (
        <MobileWindowSwitcher
          openApps={openApps}
          activeWindowId={activeWindowId}
          focusWindow={(id) => { playSound('click'); focusWindow(id); }}
          closeWindow={closeApp}
          closeSwitcher={() => setIsWindowSwitcherOpen(false)}
        />
      )}

      {isStartMenuOpen && (
        <MobileStartMenu
          systemApps={systemApps}
          onOpenApp={openApp}
          closeMenu={() => setIsStartMenuOpen(false)}
          onOpenSearch={() => { setIsSearchOpen(true); setIsStartMenuOpen(false); }}
          onShutDown={onShutDown}
          onLogOff={onLogOff}
        />
      )}

      {isSearchOpen && (
        <MobileSearch
          systemApps={systemApps}
          onOpenApp={openApp}
          closeSearch={() => setIsSearchOpen(false)}
        />
      )}

      <MobileTaskbar
        openApps={openApps}
        isStartMenuOpen={isStartMenuOpen}
        toggleStartMenu={(e) => {
          setIsStartMenuOpen(!isStartMenuOpen);
          setIsWindowSwitcherOpen(false);
          setIsSearchOpen(false);
        }}
        onToggleWindowSwitcher={() => {
          setIsWindowSwitcherOpen(!isWindowSwitcherOpen);
          setIsStartMenuOpen(false);
          setIsSearchOpen(false);
        }}
        onOpenSearch={() => {
          setIsSearchOpen(!isSearchOpen);
          setIsStartMenuOpen(false);
          setIsWindowSwitcherOpen(false);
        }}
      />
    </div>
  );
};

export default MobileOS;