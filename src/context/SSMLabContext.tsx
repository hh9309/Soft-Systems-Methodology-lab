import React, { createContext, useContext, useState, useEffect } from 'react';
import { SSMCase, Stakeholder, CATWOEModel, RichPictureNode, RichPictureEdge, ComparisonItem, ConceptualActivity } from '../types/ssm';
import { SSM_CASES } from '../data/cases';

interface SSMLabContextType {
  activeCase: SSMCase;
  setActiveCaseById: (caseId: string) => void;
  updateActiveCase: (updater: (prev: SSMCase) => SSMCase) => void;
  resetCaseToDefault: () => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  aiDiagnosticReport: string | null;
  setAiDiagnosticReport: (report: string | null) => void;
}

const SSMLabContext = createContext<SSMLabContextType | undefined>(undefined);

export const SSMLabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCaseIndex, setCurrentCaseIndex] = useState<number>(0);
  const [activeCase, setActiveCase] = useState<SSMCase>(() => {
    const saved = localStorage.getItem('ssm_current_case_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return JSON.parse(JSON.stringify(SSM_CASES[0]));
  });
  const [activeTab, setActiveTab] = useState<number>(1); // Default to Module 1
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [aiDiagnosticReport, setAiDiagnosticReport] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('ssm_current_case_data', JSON.stringify(activeCase));
  }, [activeCase]);

  const setActiveCaseById = (caseId: string) => {
    const found = SSM_CASES.find((c) => c.id === caseId);
    if (found) {
      const cloned = JSON.parse(JSON.stringify(found));
      setActiveCase(cloned);
      setAiDiagnosticReport(null);
    }
  };

  const updateActiveCase = (updater: (prev: SSMCase) => SSMCase) => {
    setActiveCase((prev) => updater(prev));
  };

  const resetCaseToDefault = () => {
    const orig = SSM_CASES.find((c) => c.id === activeCase.id) || SSM_CASES[0];
    setActiveCase(JSON.parse(JSON.stringify(orig)));
    setAiDiagnosticReport(null);
  };

  return (
    <SSMLabContext.Provider
      value={{
        activeCase,
        setActiveCaseById,
        updateActiveCase,
        resetCaseToDefault,
        activeTab,
        setActiveTab,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiDiagnosticReport,
        setAiDiagnosticReport,
      }}
    >
      {children}
    </SSMLabContext.Provider>
  );
};

export const useSSMLab = () => {
  const context = useContext(SSMLabContext);
  if (!context) {
    throw new Error('useSSMLab must be used within SSMLabProvider');
  }
  return context;
};
