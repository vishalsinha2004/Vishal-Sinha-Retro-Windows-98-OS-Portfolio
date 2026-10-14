import React, { useState, useEffect } from 'react';
import { useSound } from '../hooks/useSound';
import MobileSettings from './MobileSettings';
import MobileFileExplorer from './MobileFileExplorer';
import MobileCommandPrompt from './MobileCommandPrompt';
import MobileMyComputer from './MobileMyComputer';
import MobileRecycleBin from './MobileRecycleBin';
import MobileNetworkNeighborhood from './MobileNetworkNeighborhood';
import InternetExplorer from '../components/InternetExplorer';
import MobileVoiceAssistant from './MobileVoiceAssistant';
import SystemMonitor from '../components/SystemMonitor';
import MobileNotepad from './MobileNotepad';
import MobilePaint from './MobilePaint';
import MobileTicTacToe from './MobileTicTacToe';
import MobileMinesweeper from './MobileMinesweeper';
import MobileSnake from './MobileSnake';
import { showSystemDialog } from '../components/SystemDialog';
import MobileAboutMe from './MobileAboutMe';
import MobileResume from './MobileResume';
import MobileProjectPage from './MobileProjectPage';
import { folderIcon, notepadIcon } from '../utils/icons';

// In-memory cache so GitHub repos (and 404s) are never fetched repeatedly
const repoCache = new Map();

// Robust parsing for GitHub URLs
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

  if (repoCache.has(cacheKey)) {
    return repoCache.get(cacheKey);
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

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  })();

  repoCache.set(cacheKey, fetchPromise);
  const result = await fetchPromise;
  repoCache.set(cacheKey, result);
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

const MobileWindow = ({
  app,
  isActive,
  fsApi,
  onClose,
  onOpenApp,
  systemApps,
  bgTheme,
  setBgTheme,
  onFocus,
  onMinimize,
  isCrtMode,
  setIsCrtMode,
  onCloseApp,
  openWindowCount,
}) => {
  const { playSound } = useSound();

  const [activeTab, setActiveTab] = useState('frontend');
  const [repoFiles, setRepoFiles] = useState({ frontend: [], backend: [] });
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const closeMenu = () => setActiveMenu(null);
  const handleMenuAction = (action) => {
    playSound('click');
    if (action) action();
    closeMenu();
  };

  // 1. Separate effect strictly for document title so focusing a window never re-fetches GitHub
  useEffect(() => {
    if (isActive && app?.name) {
      document.title = `${app.name} | Vishal OS`;
    }
  }, [isActive, app?.name]);

  // 2. Fetch GitHub files ONLY once per app/repo change
  useEffect(() => {
    const sysApps = [
      'settings', 'system-os', 'about-us', 'projects-folder', 'games-folder',
      'file-explorer', 'resume', 'tic-tac-toe', 'problem-solver', 'snake',
      'minesweeper', 'paint', 'notepad', 'system-monitor', 'ie', 'network',
      'recycle-bin', 'recycle', 'luma-ai',
    ];

    if (sysApps.includes(app.id) || app.name?.toLowerCase() === 'about vishal') {
      return;
    }

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
    if (githubLoading) return <div className="text-os-text text-xs p-2">Loading repository files...</div>;
    if (githubError) return <div className="text-os-text text-xs p-2 text-red-600">{githubError}</div>;

    if (!files || files.length === 0) {
      return (
        <div className="text-os-dark-gray text-xs p-2 italic bg-white shadow-retro-inset border border-os-dark-gray h-[150px] flex items-center justify-center text-center px-4">
          Cannot display files.<br />Repository may be private, renamed, or empty.
        </div>
      );
    }

    const sortedFiles = [...files].sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <ul className="bg-os-white shadow-retro-inset p-1 h-[150px] overflow-y-auto custom-scrollbar border border-os-dark-gray">
        {sortedFiles.map((file) => (
          <li
            key={file.sha}
            className="flex items-center gap-2 text-xs font-sans text-os-text hover:bg-os-navy hover:text-os-white px-1 py-0.5 cursor-pointer"
            onClick={() => {
              playSound('click');
              window.open(file.html_url, '_blank');
            }}
          >
            <img
              src={file.type === 'dir' ? folderIcon : notepadIcon}
              alt={file.type}
              className="w-4 h-4 object-contain shrink-0"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="truncate flex-1">{file.name}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderAppContent = () => {
    if (app.id === 'recycle-bin' || app.id === 'recycle') return <MobileRecycleBin fsApi={fsApi} onOpenApp={onOpenApp} />;
    if (app.id === 'settings') return <MobileSettings bgTheme={bgTheme} setBgTheme={setBgTheme} isCrtMode={isCrtMode} setIsCrtMode={setIsCrtMode} />;
    if (app.id === 'network') return <MobileNetworkNeighborhood onOpenApp={onOpenApp} />;
    if (app.id === 'ie') return <InternetExplorer initialUrl={app.live_link} />;
    if (app.id === 'luma-ai') return <MobileVoiceAssistant />;
    if (app.id === 'system-monitor') return <SystemMonitor openWindowCount={openWindowCount} />;
    if (app.id === 'notepad') return <MobileNotepad />;
    if (app.id === 'paint') return <MobilePaint />;
    if (app.id === 'minesweeper') return <MobileMinesweeper />;
    if (app.id === 'snake') return <MobileSnake />;
    if (app.id === 'system-os') return <MobileMyComputer onOpenApp={onOpenApp} />;

    if (app.id === 'about-us' || app.name.toLowerCase() === 'about vishal') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
      return <MobileAboutMe apiUrl={apiUrl} />;
    }

    if (app.id === 'resume' || app.name.toLowerCase() === 'resume') return <MobileResume />;
    if (app.id === 'tic-tac-toe') return <MobileTicTacToe />;
    if (app.id === 'problem-solver' || app.name.toLowerCase() === 'ms-dos prompt') {
      return <MobileCommandPrompt onOpenApp={onOpenApp} onClose={onClose} systemApps={systemApps} fsApi={fsApi} />;
    }

    if (app.id === 'games-folder') {
      const gameApps = systemApps.filter((a) => a.isGame);
      return <MobileProjectPage apps={gameApps} onOpenApp={onOpenApp} />;
    }

    if (app.id === 'projects-folder') {
      const projectApps = systemApps.filter((a) => a.isProject);
      return <MobileProjectPage apps={projectApps} onOpenApp={onOpenApp} />;
    }

    if (app.id === 'file-explorer') return <MobileFileExplorer fsApi={fsApi} systemApps={systemApps} onOpenApp={onOpenApp} />;

    const techTags = parseTechStack(app.tech_stack);

    return (
      <article className="flex flex-col flex-1 min-h-0 w-full h-full bg-os-gray text-os-text p-2 overflow-y-auto custom-scrollbar font-sans relative">
        
        {/* BACK BUTTON TO RETURN TO PROJECT MENU */}
        <div className="flex gap-2 mb-3 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              playSound('click');
              onClose();
              onOpenApp(app.isGame ? 'games-folder' : 'projects-folder');
            }}
            className="retro-btn px-3 py-1.5 text-xs font-bold flex items-center gap-2 shadow-retro-outset active:shadow-retro-inset bg-os-gray text-black"
          >
            <span className="text-sm leading-none">◀</span> Back to Menu
          </button>
        </div>

        <header className="flex flex-col gap-3 mb-4 bg-os-gray shadow-retro-outset p-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-os-white shadow-retro-inset p-1 flex items-center justify-center border border-os-dark-gray shrink-0">
              <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold truncate leading-tight">{app.name}</h1>
              <span className="text-[10px] text-os-dark-gray">{app.project_type || 'Application'}</span>
            </div>
          </div>
          <nav aria-label="Project Links" className="flex flex-wrap gap-2">
            {app.frontend_repo && <a href={app.frontend_repo} target="_blank" rel="noopener noreferrer" className="retro-btn text-[10px] px-2 py-1 no-underline text-os-text" onClick={() => playSound('click')}>Frontend</a>}
            {app.backend_repo && <a href={app.backend_repo} target="_blank" rel="noopener noreferrer" className="retro-btn text-[10px] px-2 py-1 no-underline text-os-text" onClick={() => playSound('click')}>Backend</a>}
            {app.live_link && <a href={app.live_link} target="_blank" rel="noopener noreferrer" className="retro-btn font-bold text-[10px] px-2 py-1 no-underline text-os-text" onClick={() => playSound('click')}>Run Program</a>}
          </nav>
        </header>

        <section className="flex flex-col gap-3 mb-4 shrink-0">
          <div className="bg-os-white shadow-retro-inset p-3 border border-os-dark-gray">
            <h2 className="font-bold border-b border-os-dark-gray mb-2 pb-1 text-sm">Description</h2>
            <p className="text-xs">{app.description || 'No description provided.'}</p>
          </div>
          <div className="bg-os-white shadow-retro-inset p-3 border border-os-dark-gray">
            <h2 className="font-bold border-b border-os-dark-gray mb-2 pb-1 text-sm">Properties</h2>
            <div className="flex flex-wrap gap-1">
              {techTags.length > 0 ? techTags.map((tag, idx) => (
                <span key={idx} className="bg-os-gray border border-os-dark-gray px-1 text-[10px] shadow-retro-outset">{tag}</span>
              )) : <span className="text-[10px]">N/A</span>}
            </div>
          </div>
        </section>

        {(app.frontend_repo || app.backend_repo) && (
          <section className="mb-4 bg-os-gray shadow-retro-outset p-2 shrink-0" aria-label="Repository Files">
            <div className="flex gap-1 mb-2 overflow-x-auto">
              {app.frontend_repo && <button onClick={() => { playSound('click'); setActiveTab('frontend'); }} className={`retro-btn text-[10px] px-2 py-1 whitespace-nowrap ${activeTab === 'frontend' ? 'shadow-retro-inset' : ''}`}>Frontend Files</button>}
              {app.backend_repo && <button onClick={() => { playSound('click'); setActiveTab('backend'); }} className={`retro-btn text-[10px] px-2 py-1 whitespace-nowrap ${activeTab === 'backend' ? 'shadow-retro-inset' : ''}`}>Backend Files</button>}
            </div>
            {activeTab === 'frontend' && app.frontend_repo ? renderFileList(repoFiles.frontend) : null}
            {activeTab === 'backend' && app.backend_repo ? renderFileList(repoFiles.backend) : null}
          </section>
        )}

        {app.live_link ? (
          <section className="flex-1 min-h-[300px] border border-os-dark-gray shrink-0 flex flex-col" aria-label="Live Preview">
            <InternetExplorer initialUrl={app.live_link} />
          </section>
        ) : (
          <section
            className="flex-1 min-h-[220px] bg-[#808080] shadow-retro-inset border border-os-dark-gray p-3 flex items-center justify-center shrink-0"
            aria-label="Offline Project Notice"
          >
            <div className="bg-os-gray shadow-retro-outset border border-os-white w-full max-w-[360px] p-1 text-black font-sans">
              <div className="bg-[#000080] text-white font-bold text-xs px-2 py-1 flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5 truncate">
                  <span>🌐</span>
                  <span className="truncate">Deployment Status — {app.name}</span>
                </div>
                <span className="bg-os-gray text-black px-1 text-[10px] leading-none shadow-retro-outset font-bold">
                  !
                </span>
              </div>

              <div className="p-3 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-os-white shadow-retro-inset border border-os-dark-gray flex items-center justify-center text-xl shrink-0">
                    🔌
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-black leading-tight">
                      This Project Is Not Hosted Live
                    </h3>
                    <p className="text-[11px] text-os-dark-gray mt-1 leading-snug">
                      A live web preview is not deployed for this build. You can inspect the source files above or open the repository links below.
                    </p>
                  </div>
                </div>

                <div className="bg-os-white shadow-retro-inset border border-os-dark-gray px-2 py-1 text-[10px] font-mono text-black flex items-center justify-between">
                  <span>STATUS: OFFLINE_BUILD</span>
                  <span className="text-red-700 font-bold">PORT: N/A</span>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-1 border-t border-os-dark-gray">
                  {app.frontend_repo && (
                    <a
                      href={app.frontend_repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSound('click')}
                      className="retro-btn text-[11px] px-3 py-1 font-bold no-underline text-black"
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
                      className="retro-btn text-[11px] px-3 py-1 font-bold no-underline text-black"
                    >
                      Backend Code
                    </a>
                  )}
                  {!app.frontend_repo && !app.backend_repo && (
                    <span className="retro-btn text-[10px] px-3 py-1 opacity-60 text-os-dark-gray cursor-default">
                      Source Private / Local
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </article>
    );
  };

  return (
    <div
      className={`absolute inset-0 flex-col bg-os-gray shadow-retro-outset z-40 overflow-hidden ${isActive ? 'flex' : 'hidden'}`}
      onMouseDownCapture={onFocus}
      onTouchStartCapture={onFocus}
    >
      <div className={`h-7 px-1 flex justify-between items-center shrink-0 font-dialog font-bold text-sm ${isActive ? 'bg-[#000080] text-white' : 'bg-[#808080] text-[#c0c0c0]'}`}>
        <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none">
          <img src={app.icon} alt="" className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
          <span className="truncate">{app.name}</span>
        </div>

        <div className="flex items-center gap-[2px]">
          <button onClick={(e) => { e.stopPropagation(); playSound('click'); onMinimize(); }} className="retro-btn w-6 h-5 flex items-center justify-center text-xs text-black bg-os-gray font-bold">_</button>
          <button onClick={(e) => { e.stopPropagation(); playSound('click'); onClose(); }} className="retro-btn w-6 h-5 flex items-center justify-center text-xs text-black bg-os-gray font-bold ml-1">X</button>
        </div>
      </div>

      <nav aria-label="Window Menu" className="h-6 border-b border-os-dark-gray bg-os-gray flex items-center gap-3 px-2 text-xs relative z-50 shrink-0 select-none">
        {activeMenu && <div className="fixed inset-0 z-40" onClick={closeMenu}></div>}
        <div className="relative z-50">
          <span className={`cursor-pointer px-1 ${activeMenu === 'file' ? 'bg-blue-900 text-white' : 'active:bg-blue-900 active:text-white'}`} onClick={() => { playSound('click'); setActiveMenu(activeMenu === 'file' ? null : 'file'); }}>File</span>
          {activeMenu === 'file' && (
            <div className="absolute top-full left-0 bg-os-gray shadow-retro-outset border border-os-white flex flex-col min-w-[120px] text-black py-1">
              <div className="px-3 py-1 active:bg-os-navy active:text-white" onClick={() => handleMenuAction(onClose)}>Close</div>
            </div>
          )}
        </div>
        <div className="relative z-50">
          <span className={`cursor-pointer px-1 ${activeMenu === 'help' ? 'bg-blue-900 text-white' : 'active:bg-blue-900 active:text-white'}`} onClick={() => { playSound('click'); setActiveMenu(activeMenu === 'help' ? null : 'help'); }}>Help</span>
          {activeMenu === 'help' && (
            <div className="absolute top-full left-0 bg-os-gray shadow-retro-outset border border-os-white flex flex-col min-w-[150px] text-black py-1">
              <div className="px-3 py-1 active:bg-os-navy active:text-white" onClick={() => handleMenuAction(() => onOpenApp('about-us'))}>About Vishal OS</div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 min-h-0 w-full bg-os-gray overflow-hidden border-t border-os-white flex flex-col relative">
        {renderAppContent()}
      </div>
    </div>
  );
};

export default MobileWindow;