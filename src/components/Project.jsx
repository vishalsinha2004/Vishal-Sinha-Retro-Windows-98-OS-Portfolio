import React from 'react';

const Project = ({ apps, onOpenApp }) => {
  // 1. Define the exact step-by-step order of sections to display
  const primarySections = [
    'Startup',
    'Client Project',
    'Final Semester',
    'Personal Project'
  ];

  // 2. Group the apps coming from the backend by their project_type
  const groupedApps = apps.reduce((groups, app) => {
    const type = app.project_type || 'Other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(app);
    return groups;
  }, {});

  // 3. Keep any extra categories (like Games) at the end so nothing gets hidden
  const extraSections = Object.keys(groupedApps).filter(
    type => !primarySections.includes(type)
  );
  const sections = [...primarySections, ...extraSections];

  return (
    <div className="flex flex-col h-full bg-white text-black font-sans">
      <div className="flex items-center p-2 bg-os-gray border-b border-os-dark-gray gap-2 shrink-0">
        <div className="flex-1 shadow-retro-inset bg-white px-2 py-1 text-sm border border-os-dark-gray">
          Total Projects: {apps.length}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-os-white custom-scrollbar flex flex-col gap-6">
        
        {sections.map(section => {
          const sectionApps = groupedApps[section];
          if (!sectionApps || sectionApps.length === 0) return null;

          return (
            <div key={section} className="flex flex-col gap-3">
              
              {/* Desktop Section Header */}
              <div className="border-b-2 border-os-dark-gray pb-1 mb-2">
                <h2 className="text-xl font-bold text-os-navy">{section}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionApps.map(app => (
                  <div 
                    key={app.id}
                    className="bg-os-gray border border-os-dark-gray shadow-retro-outset p-3 flex flex-col gap-3 cursor-pointer hover:bg-[#e0e0e0] active:shadow-retro-inset"
                    onClick={() => onOpenApp(app.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white shadow-retro-inset border border-os-dark-gray p-1 shrink-0">
                        <img src={app.icon} alt="" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{app.name}</h3>
                        <p className="text-xs text-[#000080] truncate font-bold">{app.project_type || 'Executable'}</p>
                      </div>
                    </div>
                    {app.description && (
                      <p className="text-sm line-clamp-3 bg-white shadow-retro-inset p-2 border border-os-dark-gray leading-snug">
                        {app.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default Project;