import React, { useState } from 'react';
import { useSound } from '../hooks/useSound';

const EXPERIENCE_DATA = [
  {
    id: 'techmicra-aiml-intern',
    role: 'Python AI/ML Intern',
    company: 'Techmicra IT Solutions',
    location: 'Ahmedabad, Gujarat',
    duration: '22nd May 2025 – 30th June 2025',
    academicInfo: 'BCA (5th Semester) — Shreyarth University (Enrollment No. 2302104128)',
    signatory: 'Pallav Mamtora, CEO — Techmicra IT Solutions (ISO 9001:2015 Certified)',
    certificateImg: '/techmicra-certificate.jpg',
    summary:
      'Successfully completed an intensive academic internship in Python Artificial Intelligence and Machine Learning at Techmicra IT Solutions, Ahmedabad. Demonstrated strong understanding of problem contexts and commendable technical execution across data science, machine learning, and deep learning workflows.',
    tasks: [
      'Python Setup & Basics, Control Flow, Functions, Lists, Dictionaries, Error Handling, Modules & File Handling',
      'Data Manipulation & Analysis using Pandas and NumPy, Data Cleaning, and Dataset Exploration',
      'Machine Learning Algorithms: Linear Regression, Classification, Decision Trees, and Clustering',
      'Deep Learning & AI: Neural Networks with Keras, Introduction to CNNs, Natural Language Processing (NLP), and Model Deployment',
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

const Experience = () => {
  const { playSound } = useSound();
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="flex flex-col h-full bg-white text-black font-sans select-none">
      {/* Top Explorer Address Bar */}
      <div className="flex items-center p-2 bg-os-gray border-b border-os-dark-gray gap-2 shrink-0">
        <span className="text-xs font-bold text-black">Address:</span>
        <div className="flex-1 shadow-retro-inset bg-white px-2 py-1 text-xs border border-os-dark-gray font-mono">
          C:\Vishal_OS\Experience ({EXPERIENCE_DATA.length} Record)
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-os-white custom-scrollbar flex flex-col gap-6">
        {EXPERIENCE_DATA.map((exp) => (
          <div
            key={exp.id}
            className="bg-os-gray border border-os-dark-gray shadow-retro-outset p-4 flex flex-col gap-4"
          >
            {/* Header Banner */}
            <div className="bg-[#000080] text-white px-3 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-retro-inset">
              <div>
                <h2 className="text-base md:text-lg font-bold leading-tight">
                  {exp.role} — {exp.company}
                </h2>
                <p className="text-xs text-[#dfdfdf] mt-0.5">
                  {exp.location} | {exp.duration}
                </p>
              </div>
              <span className="bg-os-gray text-black text-xs font-bold px-2 py-1 shadow-retro-outset self-start md:self-center shrink-0">
                VERIFIED CERTIFICATE
              </span>
            </div>

            {/* Two-Column Layout: Details Left, Certificate Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Description & Tasks */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                <div className="bg-white shadow-retro-inset border border-os-dark-gray p-3">
                  <h3 className="font-bold text-sm border-b border-os-dark-gray pb-1 mb-2 text-[#000080]">
                    Experience Overview
                  </h3>
                  <p className="text-xs leading-relaxed text-black mb-2">
                    {exp.summary}
                  </p>
                  <p className="text-[11px] text-os-dark-gray font-bold">
                    Academic Program: <span className="font-normal text-black">{exp.academicInfo}</span>
                  </p>
                </div>

                <div className="bg-white shadow-retro-inset border border-os-dark-gray p-3">
                  <h3 className="font-bold text-sm border-b border-os-dark-gray pb-1 mb-2 text-[#000080]">
                    Key Responsibilities & Modules Completed
                  </h3>
                  <ul className="list-disc pl-4 text-xs space-y-1.5 text-black">
                    {exp.tasks.map((task, index) => (
                      <li key={index} className="leading-snug">
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white shadow-retro-inset border border-os-dark-gray p-3">
                  <h3 className="font-bold text-sm border-b border-os-dark-gray pb-1 mb-2 text-[#000080]">
                    Technologies & Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-os-gray border border-os-dark-gray px-2 py-0.5 text-xs shadow-retro-outset font-bold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Certificate Preview Box */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-os-gray shadow-retro-outset border border-os-dark-gray p-2 flex flex-col h-full justify-between gap-2">
                  <div className="bg-[#808080] text-white text-xs font-bold px-2 py-1 flex justify-between items-center">
                    <span>Certificate_Techmicra.jpg</span>
                    <span>ISO 9001:2015</span>
                  </div>

                  <div
                    onClick={() => {
                      playSound('click');
                      setSelectedCert(exp);
                    }}
                    className="bg-white shadow-retro-inset border border-os-dark-gray p-2 flex-1 flex items-center justify-center cursor-pointer overflow-hidden group"
                    title="Click to enlarge certificate"
                  >
                    <img
                      src={exp.certificateImg}
                      alt={`${exp.company} Internship Certificate`}
                      className="max-h-[320px] w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] text-center text-os-dark-gray">
                      Issued by: {exp.signatory}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playSound('click');
                          setSelectedCert(exp);
                        }}
                        className="retro-btn flex-1 py-1.5 text-xs font-bold text-black"
                      >
                        🔍 View Full Screen
                      </button>
                      <a
                        href={exp.certificateImg}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSound('click')}
                        className="retro-btn px-3 py-1.5 text-xs font-bold text-black no-underline text-center"
                      >
                        Open Tab
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Certificate Lightbox Modal */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center p-4"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="bg-os-gray shadow-retro-outset border border-os-white max-w-3xl w-full max-h-[90vh] flex flex-col p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#000080] text-white font-bold text-xs px-2 py-1 flex justify-between items-center shrink-0">
              <span>{selectedCert.company} — Official Internship Certificate</span>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setSelectedCert(null);
                }}
                className="retro-btn w-5 h-5 flex items-center justify-center text-black bg-os-gray text-xs font-bold"
              >
                X
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto bg-[#808080] p-3 flex items-center justify-center shadow-retro-inset">
              <img
                src={selectedCert.certificateImg}
                alt="Full Certificate"
                className="max-w-full max-h-[78vh] object-contain border border-black bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;