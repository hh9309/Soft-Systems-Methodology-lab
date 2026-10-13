import React from 'react';
import { SSMLabProvider, useSSMLab } from './context/SSMLabContext';
import { Header } from './components/Header';
import { ModuleNav } from './components/ModuleNav';
import { AiDiagnosisDrawer } from './components/AiDiagnosisDrawer';

import { Module1Algebra } from './components/modules/Module1Algebra';
import { Module2RichPicture } from './components/modules/Module2RichPicture';
import { Module3Stakeholders } from './components/modules/Module3Stakeholders';
import { Module4Catwoe } from './components/modules/Module4Catwoe';
import { Module5Cases } from './components/modules/Module5Cases';
import { Module6NetworkX } from './components/modules/Module6NetworkX';
import { Module7AiAssistant } from './components/modules/Module7AiAssistant';
import { Module8Workflow } from './components/modules/Module8Workflow';
import { Module9Export } from './components/modules/Module9Export';
import { Module10Knowledge } from './components/modules/Module10Knowledge';

const MainContent: React.FC = () => {
  const { activeTab } = useSSMLab();

  const renderModule = () => {
    switch (activeTab) {
      case 1:
        return <Module1Algebra />;
      case 2:
        return <Module2RichPicture />;
      case 3:
        return <Module3Stakeholders />;
      case 4:
        return <Module4Catwoe />;
      case 5:
        return <Module5Cases />;
      case 6:
        return <Module6NetworkX />;
      case 7:
        return <Module7AiAssistant />;
      case 8:
        return <Module8Workflow />;
      case 9:
        return <Module9Export />;
      case 10:
        return <Module10Knowledge />;
      default:
        return <Module1Algebra />;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {renderModule()}
    </main>
  );
};

export default function App() {
  return (
    <SSMLabProvider>
      <div className="min-h-screen flex flex-col bg-stone-50/60 text-slate-800 selection:bg-slate-200">
        <Header />
        <ModuleNav />
        <div className="flex-1">
          <MainContent />
        </div>
        <AiDiagnosisDrawer />

        {/* Subtle, elegant academic footer */}
        <footer className="border-t border-stone-200/80 bg-stone-100/50 py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-semibold text-slate-700">
                软系统方法实验室
              </span>
              <span>·</span>
              <span className="italic">
                “世界是复杂的，但它并非充满待修系统的机器；混乱存在于人类的世界观之中。”
              </span>
            </div>
            <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-400">
              <span>彼得·切克兰德 (Peter Checkland) 经典 7 阶段学习循环</span>
              <span>·</span>
              <span>SSM Lab v2.5</span>
            </div>
          </div>
        </footer>
      </div>
    </SSMLabProvider>
  );
}
