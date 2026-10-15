import React from 'react';
import { useSound } from '../hooks/useSound';
import { showSystemDialog } from '../components/SystemDialog';
import { 
  floppyIcon, 
  hardDriveIcon, 
  cdIcon, 
  settingsIcon, 
  networkIcon, 
  recycleBinIcon 
} from '../utils/icons';

const MobileMyComputer = ({ onOpenApp }) => {
  const { playSound } = useSound();

  const items = [
    { 
      id: 'drive-a', 
      name: '3½ Floppy (A:)', 
      icon: floppyIcon, 
      action: () => { 
        playSound('error'); 
        showSystemDialog({ 
          type: 'error', 
          title: '3½ Floppy (A:)', 
          message: '3½ Floppy (A:) is not accessible.\n\nThe device is not ready.', 
          buttons: ['OK'] 
        }); 
      } 
    },
    { 
      id: 'drive-c', 
      name: 'Local Disk (C:)', 
      icon: hardDriveIcon, 
      action: () => { 
        playSound('click'); 
        onOpenApp('file-explorer'); 
      } 
    },
    { 
      id: 'drive-d', 
      name: 'CD-ROM (D:)', 
      icon: cdIcon, 
      action: () => { 
        playSound('error'); 
        showSystemDialog({ 
          type: 'error', 
          title: 'CD-ROM (D:)', 
          message: 'CD-ROM (D:) is not accessible.\n\nThe device is not ready.', 
          buttons: ['OK'] 
        }); 
      } 
    },
    { 
      id: 'settings', 
      name: 'Control Panel', 
      icon: settingsIcon, 
      action: () => { 
        playSound('click'); 
        onOpenApp('settings'); 
      } 
    },
    { 
      id: 'network', 
      name: 'Network Neighborhood', 
      icon: networkIcon, 
      action: () => { 
        playSound('click'); 
        onOpenApp('network'); 
      } 
    },
    { 
      id: 'recycle', 
      name: 'Recycle Bin', 
      icon: recycleBinIcon, 
      action: () => { 
        playSound('click'); 
        onOpenApp('recycle-bin'); 
      } 
    }
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full bg-white text-black font-sans text-sm">
      {/* Mobile Toolbar */}
      <div className="flex items-center p-1.5 bg-os-gray border-b border-os-dark-gray gap-2 shrink-0">
        <button 
          disabled
          className="retro-btn px-4 py-1 text-xs font-bold opacity-50 text-os-dark-gray active:shadow-retro-outset"
        >
          Up
        </button>
        <div className="flex-1 min-w-0 shadow-retro-inset bg-white px-2 py-1.5 truncate text-xs border border-os-dark-gray">
          My Computer
        </div>
      </div>

      {/* Chunky Grid Content Area (Strict internal scrolling) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-wrap gap-6 content-start bg-white custom-scrollbar">
        {items.map(item => (
          <div 
            key={item.id} 
            className="flex flex-col items-center justify-start w-[72px] cursor-pointer group"
            onClick={item.action}
          >
            <div className="w-10 h-10 mb-1 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-os-navy opacity-0 group-active:opacity-40 mix-blend-multiply pointer-events-none"></div>
              <img 
                src={item.icon} 
                alt={item.name} 
                className="w-8 h-8 object-contain pointer-events-none" 
                style={{ imageRendering: 'pixelated' }} 
              />
            </div>
            <span className="text-xs text-center leading-tight font-sans text-black px-1 group-active:bg-os-navy group-active:text-white border border-transparent group-active:border-dotted group-active:border-white">
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Classic Status Bar */}
      <div className="bg-os-gray border-t border-os-dark-gray p-1 px-2 text-[10px] shrink-0 flex justify-between shadow-retro-inset">
        <span>{items.length} object(s)</span>
        <span>My Computer</span>
      </div>
    </div>
  );
};

export default MobileMyComputer;