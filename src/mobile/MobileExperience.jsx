import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';

const EXPERIENCE_DATA = [
  {
    id: 'techmicra-aiml-intern',
    role: 'Python AI/ML Intern',
    company: 'Techmicra IT Solutions',
    location: 'Ahmedabad, Gujarat',
    duration: '22nd May 2025 – 30th June 2025',
    academicInfo: 'BCA (5th Sem) — Shreyarth University',
    enrollmentNo: '2302104128',
    signatory: 'Pallav Mamtora (CEO, Techmicra IT Solutions)',
    certificateImg: '/techmicra-certificate.jpg',
    summary:
      'Completed an academic internship in Python AI/ML at Techmicra IT Solutions, Ahmedabad. Recognised for sincere execution, strong understanding of problem context, and commendable work across data analysis, machine learning, and deep learning.',
    tasks: [
      'Python Setup, Control Flow, Functions, Lists & Dictionaries, Error Handling, Modules & File Handling',
      'Pandas & NumPy Data Analysis, Data Cleaning, and Dataset Exploration',
      'Machine Learning: Linear Regression, Classification, Decision Trees & Clustering',
      'Deep Learning: Neural Networks with Keras, CNNs, NLP & Model Deployment',
    ],
    skills: [
      'Python',
      'Pandas',
      'NumPy',
      'Data Cleaning',
      'Data Analysis',
      'Machine Learning',
      'Linear Regression',
      'Classification',
      'Decision Trees',
      'Clustering',
      'Deep Learning',
      'Keras',
      'CNNs',
      'NLP',
      'Model Deployment',
    ],
  },
];

const MobileExperience = () => {
  const { playSound } = useSound();
  const [zoomCert, setZoomCert] = useState(null);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full bg-os-gray text-black font-sans text-sm select-none overflow-hidden">
      {/* Top Mobile Explorer Bar */}
      <div className="flex items-center justify-between p-1.5 bg-os-gray border-b border-os-dark-gray gap-1.5 shrink-0">
        <div className="flex-1 min-w-0 shadow-retro-inset bg-white px-2 py-1 truncate text-xs border border-os-dark-gray flex items-center justify-between">
          <span className="truncate font-bold text-[#000080]">C:\Experience</span>
          <span className="text-[10px] text-os-dark-gray shrink-0 ml-2">
            {EXPERIENCE_DATA.length} Internship
          </span>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 bg-white shadow-retro-inset m-1 border border-os-dark-gray custom-scrollbar flex flex-col gap-3">
        {EXPERIENCE_DATA.map((exp) => (
          <article
            key={exp.id}
            className="bg-os-gray border border-os-dark-gray shadow-retro-outset p-2 flex flex-col gap-2.5 shrink-0"
          >
            {/* Section Header */}
            <div className="bg-[#000080] text-white px-2 py-1.5 shadow-retro-inset">
              <div className="flex items-center justify-between gap-1">
                <h2 className="font-bold text-xs uppercase tracking-wide truncate">
                  {exp.role}
                </h2>
                <span className="bg-green-700 text-white text-[9px] font-bold px-1.5 py-0.5 shrink-0">
                  CERTIFIED
                </span>
              </div>
              <p className="text-[11px] font-bold text-[#dfdfdf] mt-0.5 truncate">
                {exp.company} • {exp.location}
              </p>
              <p className="text-[10px] text-white/80 mt-0.5">
                Duration: {exp.duration}
              </p>
            </div>

            {/* Certificate Image Card */}
            <div className="bg-white shadow-retro-inset border border-os-dark-gray p-1.5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between border-b border-os-dark-gray pb-1">
                <span className="text-[10px] font-bold text-[#000080]">
                  📜 Official Internship Certificate
                </span>
                <span className="text-[9px] font-mono text-os-dark-gray">
                  ISO 9001:2015
                </span>
              </div>

              <div
                onClick={() => {
                  playSound('click');
                  setZoomCert(exp);
                }}
                className="w-full bg-[#e8e8e8] border border-os-dark-gray p-1 flex items-center justify-center cursor-pointer"
              >
                <img
                  src={exp.certificateImg}
                  alt={`${exp.company} Certificate`}
                  className="w-full max-h-[240px] object-contain"
                />
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setZoomCert(exp);
                  }}
                  className="retro-btn flex-1 py-1 text-[10px] font-bold text-black"
                >
                  🔍 Tap to Zoom Certificate
                </button>
                <a
                  href={exp.certificateImg}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playSound('click')}
                  className="retro-btn px-2.5 py-1 text-[10px] font-bold text-black no-underline flex items-center justify-center"
                >
                  Open
                </a>
              </div>
            </div>

            {/* Description Box */}
            <div className="bg-white shadow-retro-inset border border-os-dark-gray p-2">
              <h3 className="font-bold text-xs text-[#000080] border-b border-os-dark-gray pb-1 mb-1.5">
                Internship Summary
              </h3>
              <p className="text-[11px] text-black leading-snug">
                {exp.summary}
              </p>
              <div className="mt-2 pt-1.5 border-t border-os-gray text-[10px] flex flex-col gap-0.5">
                <div>
                  <span className="font-bold">Program:</span> {exp.academicInfo}
                </div>
                <div>
                  <span className="font-bold">Enrollment No:</span> {exp.enrollmentNo}
                </div>
                <div>
                  <span className="font-bold">Signed By:</span> {exp.signatory}
                </div>
              </div>
            </div>

            {/* Tasks & Modules Box */}
            <div className="bg-white shadow-retro-inset border border-os-dark-gray p-2">
              <h3 className="font-bold text-xs text-[#000080] border-b border-os-dark-gray pb-1 mb-1.5">
                Tasks & Curriculum Completed
              </h3>
              <ul className="list-disc pl-4 text-[11px] space-y-1 text-black">
                {exp.tasks.map((task, i) => (
                  <li key={i} className="leading-snug">
                    {task}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills Pills */}
            <div className="bg-white shadow-retro-inset border border-os-dark-gray p-2">
              <h3 className="font-bold text-xs text-[#000080] border-b border-os-dark-gray pb-1 mb-1.5">
                Tools & Technologies Covered
              </h3>
              <div className="flex flex-wrap gap-1">
                {exp.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-os-gray border border-os-dark-gray px-1.5 py-0.5 text-[9px] font-bold text-black shadow-retro-outset"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom Classic Status Bar */}
      <div className="bg-os-gray border-t border-os-dark-gray px-2 py-1 text-[10px] shrink-0 flex justify-between items-center shadow-retro-inset">
        <span>Verified Internship Record</span>
        <span className="font-bold text-[#000080]">Techmicra IT Solutions</span>
      </div>

      {/* Fullscreen Certificate Zoom Overlay */}
      {zoomCert && (
        <div
          className="absolute inset-0 z-[9999] bg-black/80 flex flex-col p-2"
          onClick={() => setZoomCert(null)}
        >
          <div
            className="bg-os-gray shadow-retro-outset border border-os-white flex-1 min-h-0 flex flex-col p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#000080] text-white font-bold text-xs px-2 py-1 flex justify-between items-center shrink-0">
              <span className="truncate">{zoomCert.company} Certificate</span>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setZoomCert(null);
                }}
                className="retro-btn w-5 h-5 flex items-center justify-center text-black bg-os-gray text-xs font-bold"
              >
                X
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-[#808080] p-2 flex items-center justify-center shadow-retro-inset">
              <img
                src={zoomCert.certificateImg}
                alt="Certificate Zoom"
                className="max-w-full max-h-full object-contain bg-white border border-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileExperience;