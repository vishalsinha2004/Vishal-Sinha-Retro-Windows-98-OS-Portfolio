import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import Settings from './Settings';
import AboutMe from './AboutMe';
import ProjectPage from './Project';
import FileExplorer from './FileExplorer';
import Resume from './Resume';
import TicTacToe from './TicTacToe';
import Snake from './Snake';
import ProblemSolver from './ProblemSolver';
import { useSound } from '../hooks/useSound';
import ContextMenu from './ContextMenu';
import CommandPrompt from './CommandPrompt';
import MyComputer from './MyComputer';
import RecycleBin from './RecycleBin';
import NetworkNeighborhood from './NetworkNeighborhood';
import InternetExplorer from './InternetExplorer';
import VoiceAssistant from './VoiceAssistant';
import SystemMonitor from './SystemMonitor';
import Notepad from './Notepad';
import Paint from './Paint';
import Minesweeper from './Minesweeper';
import { showSystemDialog } from './SystemDialog';

const desktopRepoCache = new Map();

const getRepoDetails = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const urlObj = new URL(url.trim());
    if (!urlObj.hostname.includes('github.com')) return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1].replace(/\.git$/i, ''),
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

const fetchRepoContentsCached = async (details) => {
  if (!details) return [];
  const cacheKey = `${details.owner}/${details.repo}`.toLowerCase();

  if (desktopRepoCache.has(cacheKey)) {
    return desktopRepoCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const headers = { Accept: 'application/vnd.github.v3+json' };
      if (import.meta.env.VITE_GITHUB_TOKEN) {
        headers.Authorization = `token ${import.meta.env.VITE_GITHUB_TOKEN}`;
      }

      const res = await fetch(
        `https://api.github.com/repos/${details.owner}/${details.repo}/contents`,
        { headers }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  })();

  desktopRepoCache.set(cacheKey, fetchPromise);
  const result = await fetchPromise;
  desktopRepoCache.set(cacheKey, result);
  return result;
};

const parseTechStack = (stackStr) => {
  if (!stackStr) return [];
  const cleaned = stackStr
    .replace(/Frontend=/gi, '')
    .replace(/Backend=/gi, ',')
    .replace(/Database=/gi, ',');
  return cleaned
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
};

const Window = ({
  app,
  isActive,
  fsApi,
  onClose,
  onOpenApp,
  systemApps,
  bgTheme,
  setBgTheme,
  accentColor,
  setAccentColor,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onUpdatePosition,
  isCrtMode,
  setIsCrtMode,
  onCloseApp,
  openWindowCount,
}) => {
  const nodeRef = useRef(null);
  const { playSound } = useSound();

  const [activeTab, setActiveTab] = useState('frontend');
  const [repoFiles, setRepoFiles] = useState({ frontend: [], backend: [] });
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState(null);

  const [titleMenu, setTitleMenu] = useState({ visible: false, x: 0, y: 0 });
  const [activeMenu, setActiveMenu] = useState(null);

  const closeMenu = () => setActiveMenu(null);
  const handleMenuAction = (action) => {
    playSound('click');
    if (action) action();
    closeMenu();
  };

  const handleTitleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTitleMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const sysApps = [
      'settings', 'system-os', 'about-us', 'projects-folder', 'games-folder',
      'file-explorer', 'resume', 'tic-tac-toe', 'problem-solver', 'snake',
      'minesweeper', 'paint', 'notepad', 'system-monitor', 'ie', 'network',
      'recycle-bin', 'recycle', 'luma-ai',
    ];
    if (sysApps.includes(app.id) || app.name?.toLowerCase() === 'about vishal') return;

    const frontDetails = getRepoDetails(app.frontend_repo);
    const backDetails = getRepoDetails(app.backend_repo);
    if (!frontDetails && !backDetails) return;

    let isMounted = true;

    const fetchFiles = async () => {
      setGithubLoading(true);
      setGithubError(null);

      try {
        const sameRepo =
          frontDetails &&
          backDetails &&
          frontDetails.owner.toLowerCase() === backDetails.owner.toLowerCase() &&
          frontDetails.repo.toLowerCase() === backDetails.repo.toLowerCase();

        let frontData = [];
        let backData = [];

        if (sameRepo) {
          frontData = await fetchRepoContentsCached(frontDetails);
          backData = frontData;
        } else {
          [frontData, backData] = await Promise.all([
            fetchRepoContentsCached(frontDetails),
            fetchRepoContentsCached(backDetails),
          ]);
        }

        if (isMounted) {
          setRepoFiles({ frontend: frontData, backend: backData });
          if (frontDetails && (!backDetails || frontData.length > 0)) {
            setActiveTab('frontend');
          } else if (backDetails) {
            setActiveTab('backend');
          }
        }
      } catch (err) {
        if (isMounted) setGithubError('Could not load repository files.');
      } finally {
        if (isMounted) setGithubLoading(false);
      }
    };

    fetchFiles();

    return () => {
      isMounted = false;
    };
  }, [app.id, app.frontend_repo, app.backend_repo, app.name]);

  const renderFileList = (files) => {
    if (githubLoading) return <div className="text-os-text text-xs p-2">Loading...</div>;
    if (githubError) return <div className="text-os-text text-xs p-2">{githubError}</div>;

    if (!files || files.length === 0) {
      return (
        <div className="text-os-dark-gray text-xs p-2 italic bg-white shadow-retro-inset border border-os-dark-gray h-[150px] flex items-center justify-center text-center px-4">
          Cannot display files.<br />This repository is either private, empty, or unreachable.
        </div>
      );
    }

    return (
      <ul className="bg-os-white shadow-retro-inset p-1 h-[150px] overflow-y-auto custom-scrollbar border border-os-dark-gray">
        {files.map((file) => (
          <li key={file.sha} className="flex items-center gap-2 text-xs font-sans text-os-text hover:bg-os-navy hover:text-os-white cursor-default px-1">
            <span>{file.type === 'dir' ? '📁' : '📄'}</span>
            <a href={file.html_url} target="_blank" rel="noopener noreferrer" className="truncate flex-1">{file.name}</a>
          </li>
        ))}
      </ul>
    );
  };

  const renderAppContent = () => {
    if (app.id === 'recycle-bin' || app.id === 'recycle') return <RecycleBin fsApi={fsApi} onOpenApp={onOpenApp} />;
    if (app.id === 'settings') {
      return (
        <Settings
          bgTheme={bgTheme}
          setBgTheme={setBgTheme}
          isCrtMode={isCrtMode}
          setIsCrtMode={setIsCrtMode}
        />
      );
    }
    if (app.id === 'network') return <NetworkNeighborhood />;
    if (app.id === 'ie') return <InternetExplorer initialUrl={app.live_link} />;
    if (app.id === 'luma-ai') return <VoiceAssistant />;
    if (app.id === 'system-monitor') return <SystemMonitor openWindowCount={openWindowCount} />;
    if (app.id === 'notepad') return <Notepad />;
    if (app.id === 'paint') return <Paint />;
    if (app.id === 'minesweeper') return <Minesweeper />;
    if (app.id === 'snake') return <Snake />;
    if (app.id === 'system-os') return <MyComputer onOpenApp={onOpenApp} />;

    if (app.id === 'about-us' || app.name.toLowerCase() === 'about vishal') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      return <AboutMe apiUrl={apiUrl} onOpenApp={onOpenApp} />;
    }

    if (app.id === 'resume' || app.name.toLowerCase() === 'resume') return <Resume />;
    if (app.id === 'tic-tac-toe') return <TicTacToe />;
    if (app.id === 'problem-solver' || app.name.toLowerCase() === 'ms-dos prompt') {
      return (
        <CommandPrompt
          onOpenApp={onOpenApp}
          onCloseApp={onCloseApp}
          systemApps={systemApps}
          isCrtMode={isCrtMode}
          setIsCrtMode={setIsCrtMode}
          fsApi={fsApi}
        />
      );
    }
    if (app.id === 'games-folder') {
      const gameApps = systemApps.filter((a) => a.isGame);
      return <ProjectPage apps={gameApps} onOpenApp={onOpenApp} />;
    }

    if (app.id === 'projects-folder') {
      const projectApps = systemApps.filter((a) => a.isProject);
      return <ProjectPage apps={projectApps} onOpenApp={onOpenApp} />;
    }

    if (app.id === 'file-explorer') return <FileExplorer fsApi={fsApi} systemApps={systemApps} onOpenApp={onOpenApp} />;

    const techTags = parseTechStack(app.tech_stack);

    return (
      <div className="flex flex-col h-full bg-os-gray text-os-text p-2 overflow-y-auto font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 bg-os-gray shadow-retro-outset p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-os-white shadow-retro-inset p-1 flex items-center justify-center border border-os-dark-gray">
              <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{app.name}</h2>
              <span className="text-xs text-os-dark-gray">{app.project_type || 'Application'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {app.frontend_repo && <a href={app.frontend_repo} target="_blank" rel="noopener noreferrer" className="retro-btn text-xs" onClick={() => playSound('click')}>Frontend</a>}
            {app.backend_repo && <a href={app.backend_repo} target="_blank" rel="noopener noreferrer" className="retro-btn text-xs" onClick={() => playSound('click')}>Backend</a>}
            {app.live_link && <a href={app.live_link} target="_blank" rel="noopener noreferrer" className="retro-btn font-bold text-xs" onClick={() => playSound('click')}>Run Program</a>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 bg-os-white shadow-retro-inset p-4 border border-os-dark-gray">
            <h3 className="font-bold border-b border-os-dark-gray mb-2 pb-1">Description</h3>
            <p className="text-sm">{app.description || 'No description provided.'}</p>
          </div>
          <div className="lg:col-span-1 bg-os-white shadow-retro-inset p-4 border border-os-dark-gray">
            <h3 className="font-bold border-b border-os-dark-gray mb-2 pb-1">Properties</h3>
            <div className="flex flex-wrap gap-1">
              {techTags.length > 0 ? techTags.map((tag, idx) => (
                <span key={idx} className="bg-os-gray border border-os-dark-gray px-1 text-xs shadow-retro-outset">{tag}</span>
              )) : <span className="text-xs">N/A</span>}
            </div>
          </div>
        </div>

        {(app.frontend_repo || app.backend_repo) && (
          <div className="mb-4 bg-os-gray shadow-retro-outset p-2">
            <div className="flex gap-1 mb-2">
              {app.frontend_repo && <button onClick={() => { playSound('click'); setActiveTab('frontend'); }} className={`retro-btn text-xs ${activeTab === 'frontend' ? 'shadow-retro-inset' : ''}`}>Frontend Files</button>}
              {app.backend_repo && <button onClick={() => { playSound('click'); setActiveTab('backend'); }} className={`retro-btn text-xs ${activeTab === 'backend' ? 'shadow-retro-inset' : ''}`}>Backend Files</button>}
            </div>
            {activeTab === 'frontend' && app.frontend_repo ? renderFileList(repoFiles.frontend) : null}
            {activeTab === 'backend' && app.backend_repo ? renderFileList(repoFiles.backend) : null}
          </div>
        )}

        {app.live_link ? (
          <section className="flex-1 min-h-[300px] border border-os-dark-gray shrink-0 flex flex-col" aria-label="Live Preview">
            <InternetExplorer initialUrl={app.live_link} />
          </section>
        ) : (
          <section
            className="flex-1 min-h-[220px] bg-[#808080] shadow-retro-inset border border-os-dark-gray p-4 flex items-center justify-center shrink-0"
            aria-label="Offline Project Notice"
          >
            <div className="bg-os-gray shadow-retro-outset border border-os-white w-full max-w-[420px] p-1 text-black font-sans">
              <div className="bg-[#000080] text-white font-bold text-xs px-2 py-1 flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5 truncate">
                  <span>🌐</span>
                  <span className="truncate">Deployment Status — {app.name}</span>
                </div>
                <span className="bg-os-gray text-black px-1.5 text-[10px] leading-none shadow-retro-outset font-bold">
                  !
                </span>
              </div>

              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-os-white shadow-retro-inset border border-os-dark-gray flex items-center justify-center text-xl shrink-0">
                    🔌
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-black leading-tight">
                      This Project Is Not Hosted Live
                    </h3>
                    <p className="text-xs text-os-dark-gray mt-1 leading-snug">
                      A live web preview is not deployed for this build. You can inspect the repository files above or open the source code links below.
                    </p>
                  </div>
                </div>

                <div className="bg-os-white shadow-retro-inset border border-os-dark-gray px-2 py-1 text-xs font-mono text-black flex items-center justify-between">
                  <span>STATUS: OFFLINE_BUILD</span>
                  <span className="text-red-700 font-bold">PORT: N/A</span>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-os-dark-gray">
                  {app.frontend_repo && (
                    <a
                      href={app.frontend_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSound('click')}
                      className="retro-btn text-xs px-3 py-1 font-bold no-underline text-black"
                    >
                      Frontend Code
                    </a>
                  )}
                  {app.backend_repo && (
                    <a
                      href={app.backend_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSound('click')}
                      className="retro-btn text-xs px-3 py-1 font-bold no-underline text-black"
                    >
                      Backend Code
                    </a>
                  )}
                  {!app.frontend_repo && !app.backend_repo && (
                    <span className="retro-btn text-xs px-3 py-1 opacity-60 text-os-dark-gray cursor-default">
                      Source Private / Local
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <>
      <Draggable
        nodeRef={nodeRef}
        handle=".retro-title-bar"
        cancel=".window-controls"
        bounds="parent"
        disabled={app.isMaximized}
        position={app.isMaximized ? { x: 0, y: 0 } : app.position}
        onStop={(e, data) => onUpdatePosition({ x: data.x, y: data.y })}
      >
        <div
          ref={nodeRef}
          onMouseDown={(e) => {
            onFocus();
            if (titleMenu.visible) setTitleMenu({ ...titleMenu, visible: false });
          }}
          style={{
            zIndex: app.zIndex || 70,
            display: app.isMinimized ? 'none' : 'flex',
          }}
          className={`absolute flex flex-col retro-window shadow-retro-outset border border-os-dark-gray bg-os-gray
        ${app.isMaximized
              ? 'w-[100vw] h-[calc(100vh-32px)] !transform-none top-0 left-0'
              : 'w-[95vw] md:w-[800px] h-[85vh] md:h-[600px] max-w-[100vw] max-h-[calc(100vh-32px)]'
            }`}
        >
          <div
            className={`retro-title-bar cursor-move select-none flex justify-between items-center px-1 font-dialog font-bold text-sm
              ${isActive ? 'bg-[#000080] text-white' : 'bg-[#808080] text-[#c0c0c0]'}`}
            onContextMenu={handleTitleContextMenu}
          >
            <div className="flex items-center gap-1 overflow-hidden pointer-events-none">
              <img src={app.icon} alt="" className="w-4 h-4 object-contain" />
              <span className="truncate pr-2">{app.name}</span>
            </div>

            <div className="flex items-center gap-[2px] window-controls">
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                className="retro-btn px-2 py-0 h-[18px] text-xs leading-none font-bold text-black bg-os-gray shadow-retro-outset"
                title="Minimize"
              >
                _
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMaximize(); }}
                className="retro-btn px-2 py-0 h-[18px] text-xs leading-none font-bold text-black bg-os-gray shadow-retro-outset"
                title="Maximize"
              >
                □
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="retro-btn px-2 py-0 h-[18px] text-xs leading-none font-bold text-black bg-os-gray shadow-retro-outset"
                title="Close"
              >
                X
              </button>
            </div>
          </div>

          <div className="retro-menu-bar border-b border-os-dark-gray select-none bg-os-gray flex gap-2 px-1 text-sm relative z-50 shrink-0">
            {activeMenu && (
              <div className="fixed inset-0 z-40" onClick={closeMenu}></div>
            )}

            <div className="relative z-50">
              <span
                className={`cursor-pointer px-2 py-[1px] inline-block ${activeMenu === 'file' ? 'bg-blue-900 text-white' : 'hover:bg-blue-900 hover:text-white'}`}
                onClick={() => { playSound('click'); setActiveMenu(activeMenu === 'file' ? null : 'file'); }}
              >
                <span className="underline">F</span>ile
              </span>
              {activeMenu === 'file' && (
                <div className="absolute top-full left-0 bg-os-gray shadow-retro-outset border border-os-white flex flex-col min-w-[150px] text-black py-1">
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(onClose)}>Close</div>
                </div>
              )}
            </div>

            <div className="relative z-50">
              <span
                className={`cursor-pointer px-2 py-[1px] inline-block ${activeMenu === 'edit' ? 'bg-blue-900 text-white' : 'hover:bg-blue-900 hover:text-white'}`}
                onClick={() => { playSound('click'); setActiveMenu(activeMenu === 'edit' ? null : 'edit'); }}
              >
                <span className="underline">E</span>dit
              </span>
              {activeMenu === 'edit' && (
                <div className="absolute top-full left-0 bg-os-gray shadow-retro-outset border border-os-white flex flex-col min-w-[150px] text-black py-1">
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(() => document.execCommand('copy'))}>Copy</div>
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(() => document.execCommand('paste'))}>Paste</div>
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(() => document.execCommand('selectAll'))}>Select All</div>
                </div>
              )}
            </div>

            <div className="relative z-50">
              <span
                className={`cursor-pointer px-2 py-[1px] inline-block ${activeMenu === 'view' ? 'bg-blue-900 text-white' : 'hover:bg-blue-900 hover:text-white'}`}
                onClick={() => { playSound('click'); setActiveMenu(activeMenu === 'view' ? null : 'view'); }}
              >
                <span className="underline">V</span>iew
              </span>
              {activeMenu === 'view' && (
                <div className="absolute top-full left-0 bg-os-gray shadow-retro-outset border border-os-white flex flex-col min-w-[200px] text-black py-1">
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(onToggleMaximize)}>
                    {app.isMaximized ? 'Restore Window' : 'Maximize Window'}
                  </div>
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(onMinimize)}>
                    Minimize Window
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-50">
              <span
                className={`cursor-pointer px-2 py-[1px] inline-block ${activeMenu === 'help' ? 'bg-blue-900 text-white' : 'hover:bg-blue-900 hover:text-white'}`}
                onClick={() => { playSound('click'); setActiveMenu(activeMenu === 'help' ? null : 'help'); }}
              >
                <span className="underline">H</span>elp
              </span>
              {activeMenu === 'help' && (
                <div className="absolute top-full left-0 bg-os-gray shadow-retro-outset border border-os-white flex flex-col min-w-[200px] text-black py-1">
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(() => onOpenApp('about-us'))}>About Vishal OS</div>
                  <div className="px-3 py-1 hover:bg-os-navy hover:text-white cursor-pointer" onClick={() => handleMenuAction(() => {
                    showSystemDialog({
                      type: 'info',
                      title: 'Help',
                      message: `Help topics for ${app.name} are currently unavailable.`,
                      buttons: ['OK'],
                    });
                  })}>Help Topics</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-os-gray overflow-hidden p-1 border-t border-os-white">
            {renderAppContent()}
          </div>

          <div className="retro-status-bar bg-os-gray shadow-retro-inset px-2 py-1 text-xs border border-os-dark-gray flex justify-between">
            <span>1 object(s) selected</span>
            <span className="border-l border-os-dark-gray pl-2">Vishal OS 98</span>
          </div>
        </div>
      </Draggable>

      <ContextMenu
        visible={titleMenu.visible}
        x={titleMenu.x}
        y={titleMenu.y}
        onClose={() => setTitleMenu({ ...titleMenu, visible: false })}
        items={[
          { label: 'Restore', disabled: !app.isMaximized, action: onToggleMaximize },
          { label: 'Move', disabled: true },
          { label: 'Size', disabled: true },
          { label: 'Minimize', action: onMinimize },
          { label: 'Maximize', disabled: app.isMaximized, action: onToggleMaximize },
          { type: 'separator' },
          { label: 'Close\tAlt+F4', action: onClose },
        ]}
      />
    </>
  );
};

export default Window;