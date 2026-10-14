import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';

// Helper to extract clean tech stack tags for card previews
const getTechPreview = (stackStr) => {
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

// Normalize project_type strings from backend into the 4 canonical sections
const normalizeCategory = (rawType, isGame) => {
  if (isGame) return 'Games & Utilities';
  if (!rawType) return 'Personal Project';
  const lower = rawType.trim().toLowerCase();

  if (lower.includes('startup')) return 'Startup';
  if (lower.includes('client')) return 'Client Project';
  if (lower.includes('semester') || lower.includes('final') || lower.includes('academic')) {
    return 'Final Semester';
  }
  if (lower.includes('personal')) return 'Personal Project';
  return rawType.trim();
};

const MobileProjectPage = ({ apps = [], onOpenApp }) => {
  const { playSound } = useSound();
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (2-col & rows) or 'row' (1-col rows)

  // 1. Exact step-by-step order of your 4 primary sections
  const primarySections = [
    'Startup',
    'Client Project',
    'Final Semester',
    'Personal Project',
  ];

  // 2. Group apps by their normalized section while preserving backend order
  const groupedApps = apps.reduce((groups, app) => {
    const type = normalizeCategory(app.project_type, app.isGame);
    if (!groups[type]) groups[type] = [];
    groups[type].push(app);
    return groups;
  }, {});

  // 3. Append any extra categories (like Games) at the end so nothing is hidden
  const extraSections = Object.keys(groupedApps).filter(
    (type) => !primarySections.includes(type)
  );
  const allActiveSections = [
    ...primarySections.filter((sec) => groupedApps[sec]?.length > 0),
    ...extraSections,
  ];

  const visibleSections =
    selectedSection === 'ALL'
      ? allActiveSections
      : allActiveSections.filter((sec) => sec === selectedSection);

  const isGamesFolder =
    apps.length > 0 && apps.every((app) => app.isGame);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full bg-os-gray text-black font-sans text-sm select-none overflow-hidden">
      
      {/* Top Explorer Toolbar: Path + Layout Switcher */}
      <div className="flex items-center justify-between p-1.5 bg-os-gray border-b border-os-dark-gray gap-1.5 shrink-0">
        <div className="flex-1 min-w-0 shadow-retro-inset bg-white px-2 py-1 truncate text-xs border border-os-dark-gray flex items-center justify-between">
          <span className="truncate font-bold text-[#000080]">
            {isGamesFolder ? 'C:\\Games' : 'C:\\Projects'}
          </span>
          <span className="text-[10px] text-os-dark-gray shrink-0 ml-2">
            {apps.length} item(s)
          </span>
        </div>

        {/* Columns vs Rows Toggle */}
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setViewMode('grid');
            }}
            className={`retro-btn px-2 py-1 text-[10px] font-bold ${
              viewMode === 'grid'
                ? 'shadow-retro-inset bg-[#d8d8d8] text-[#000080]'
                : 'shadow-retro-outset text-black'
            }`}
            title="2-Column Grid View"
          >
            ⊞ Cols
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setViewMode('row');
            }}
            className={`retro-btn px-2 py-1 text-[10px] font-bold ${
              viewMode === 'row'
                ? 'shadow-retro-inset bg-[#d8d8d8] text-[#000080]'
                : 'shadow-retro-outset text-black'
            }`}
            title="Full Row View"
          >
            ☰ Rows
          </button>
        </div>
      </div>

      {/* Section Filter Tabs (Shown when multiple sections exist) */}
      {!isGamesFolder && (
        <div className="flex items-center gap-1 px-1.5 py-1 bg-os-gray border-b border-os-dark-gray overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              playSound('click');
              setSelectedSection('ALL');
            }}
            className={`retro-btn px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shrink-0 ${
              selectedSection === 'ALL'
                ? 'shadow-retro-inset bg-[#000080] text-white'
                : 'shadow-retro-outset text-black'
            }`}
          >
            All ({apps.length})
          </button>

          {primarySections.map((section) => {
            const count = groupedApps[section]?.length || 0;
            return (
              <button
                key={section}
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedSection(section);
                }}
                className={`retro-btn px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shrink-0 ${
                  selectedSection === section
                    ? 'shadow-retro-inset bg-[#000080] text-white'
                    : count === 0
                    ? 'opacity-50 text-os-dark-gray'
                    : 'shadow-retro-outset text-black'
                }`}
              >
                {section} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Main Scrollable Directory Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-white shadow-retro-inset m-1 border border-os-dark-gray custom-scrollbar flex flex-col gap-4">
        {visibleSections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-os-gray shadow-retro-outset border border-os-dark-gray my-auto">
            <span className="text-sm font-bold text-[#000080] mb-1">
              No Projects in "{selectedSection}"
            </span>
            <p className="text-xs text-os-dark-gray mb-3">
              No applications are currently assigned to this section.
            </p>
            {selectedSection !== 'ALL' && (
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedSection('ALL');
                }}
                className="retro-btn px-3 py-1 text-xs font-bold"
              >
                Show All Sections
              </button>
            )}
          </div>
        ) : (
          visibleSections.map((section) => {
            const sectionApps = groupedApps[section] || [];
            if (sectionApps.length === 0) return null;

            return (
              <section
                key={section}
                className="flex flex-col bg-os-gray shadow-retro-outset border border-os-dark-gray p-1.5 shrink-0"
              >
                {/* Section Header Bar */}
                <div className="bg-[#000080] text-white px-2 py-1 mb-2 flex items-center justify-between shadow-retro-inset shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h2 className="font-bold text-xs tracking-wide uppercase truncate">
                      {section}
                    </h2>
                  </div>
                </div>

                {/* Responsive Columns & Rows Grid */}
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 gap-2'
                      : 'grid grid-cols-1 gap-2'
                  }
                >
                  {sectionApps.map((app) => {
                    const techList = getTechPreview(app.tech_stack);
                    const maxTags = viewMode === 'grid' ? 2 : 4;
                    const visibleTags = techList.slice(0, maxTags);
                    const extraTagCount = techList.length - visibleTags.length;

                    return (
                      <div
                        key={app.id}
                        onClick={() => {
                          playSound('click');
                          onOpenApp(app.id);
                        }}
                        className="bg-os-gray border border-os-dark-gray shadow-retro-outset p-1.5 flex flex-col justify-between gap-1.5 cursor-pointer active:shadow-retro-inset min-w-0 overflow-hidden"
                      >
                        {/* Icon + Project Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 bg-white shadow-retro-inset border border-os-dark-gray p-1 shrink-0 flex items-center justify-center">
                            <img
                              src={app.icon}
                              alt={app.name}
                              className="w-full h-full object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-xs text-black truncate leading-tight">
                              {app.name}
                            </h3>
                            <p className="text-[10px] text-[#000080] truncate font-bold mt-0.5">
                              {app.project_type || (app.isGame ? 'Game' : 'Application')}
                            </p>
                          </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-white shadow-retro-inset p-1.5 border border-os-dark-gray">
                          <p className="text-[11px] text-black leading-snug line-clamp-2 m-0 break-words">
                            {app.description || 'Tap to view project details and files.'}
                          </p>
                        </div>

                        {/* Tech Stack Pills Row */}
                        {visibleTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 min-w-0">
                            {visibleTags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-[#dfdfdf] border border-os-dark-gray px-1 text-[9px] text-black truncate max-w-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {extraTagCount > 0 && (
                              <span className="bg-os-navy text-white px-1 text-[9px] font-bold">
                                +{extraTagCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Bottom Classic Status Bar */}
      <div className="bg-os-gray border-t border-os-dark-gray px-2 py-1 text-[10px] shrink-0 flex justify-between items-center shadow-retro-inset">
        <span className="truncate">
          {selectedSection === 'ALL'
            ? `Showing ${visibleSections.length} section(s)`
            : `Section: ${selectedSection}`}
        </span>
        <span className="font-bold text-[#000080] shrink-0">
          Tap card to open
        </span>
      </div>
    </div>
  );
};

export default MobileProjectPage;