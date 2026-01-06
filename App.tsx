
import React, { useState } from 'react';
import { UserData, AnalysisResult } from './types';
import { analyzeNumerology } from './services/geminiService';
import LoadingScreen from './components/LoadingScreen';
import IndicatorCard from './components/IndicatorCard';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({ fullName: '', birthDate: '', intention: '' });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'form' | 'result'>('intro');

  const handleStart = () => setStep('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.fullName || !userData.birthDate) return;
    
    setLoading(true);
    try {
      const result = await analyzeNumerology(userData);
      setAnalysis(result);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Tần số đang bận. Hãy thử lại sau giây lát.");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdownText = (text: string) => {
    return text.split('\n\n').map((paragraph, i) => {
      const cleanParagraph = paragraph.replace(/\*\*/g, '').trim();
      if (cleanParagraph.startsWith('##')) {
        return (
          <h3 key={i} className="text-[15px] tracking-[0.5em] uppercase text-gray-900 font-black mb-8 mt-16 text-center">
            {cleanParagraph.replace('##', '').trim()}
          </h3>
        );
      }
      return (
        <p key={i} className="mb-10 text-gray-800 leading-[2.6] font-medium tracking-wide text-justify text-[20px]">
          {cleanParagraph}
        </p>
      );
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen selection:bg-gray-200">
      {/* Introduction View */}
      {step === 'intro' && (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6 fade-in bg-white">
          <div className="max-w-4xl">
            <div className="mb-16">
               <div className="w-[1px] h-20 bg-gray-200 mx-auto mb-8" />
               <h2 className="text-[13px] tracking-[1em] uppercase text-gray-500 font-black">
                 Mind Color Map
               </h2>
            </div>
            <p className="text-2xl md:text-3xl font-light leading-[2.4] mb-20 text-gray-900 tracking-tight px-4">
              "Trân trọng chào đón bạn. Hãy cùng tôi khám phá bản đồ tâm thức qua lăng kính Thần số học và tần số năng lượng. Chúng ta sẽ cùng chuyển hóa mọi áp lực thành sức mạnh, đưa rung động của bạn về trạng thái thấu hiểu và yêu thương thuần khiết."
            </p>
            <button 
              onClick={handleStart}
              className="group relative px-20 py-6 overflow-hidden rounded-full border border-gray-300 transition-all duration-1000 hover:border-gray-900 shadow-sm"
            >
              <span className="relative z-10 text-[11px] tracking-[0.8em] uppercase text-gray-600 group-hover:text-gray-900 transition-colors font-black">
                Bắt đầu hành trình
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Form View */}
      {step === 'form' && (
        <div className="min-h-screen flex flex-col items-center justify-center py-20 px-6 fade-in bg-white">
          <div className="w-full max-w-xl">
            <h2 className="text-[12px] tracking-[0.8em] uppercase text-gray-500 mb-20 text-center font-black">
              Thiết lập thông số rung động
            </h2>
            <form onSubmit={handleSubmit} className="space-y-16">
              <div className="space-y-6">
                <label className="text-[12px] uppercase tracking-[0.5em] text-gray-600 font-black block ml-1">Danh xưng đầy đủ</label>
                <input 
                  required
                  type="text"
                  placeholder="Vd: Nguyễn Hoàng Nam"
                  className="w-full px-2 py-5 border-b-2 border-gray-100 focus:border-gray-900 outline-none transition-all duration-700 text-xl font-medium tracking-widest bg-transparent placeholder:text-gray-200"
                  value={userData.fullName}
                  onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-6">
                <label className="text-[12px] uppercase tracking-[0.5em] text-gray-600 font-black block ml-1">Thời khắc hiện diện</label>
                <input 
                  required
                  type="date"
                  className="w-full px-2 py-5 border-b-2 border-gray-100 focus:border-gray-900 outline-none transition-all duration-700 text-xl font-medium tracking-widest bg-transparent"
                  value={userData.birthDate}
                  onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                />
              </div>
              <div className="space-y-6">
                <label className="text-[12px] uppercase tracking-[0.5em] text-gray-600 font-black block ml-1">Câu hỏi tâm thức</label>
                <textarea 
                  placeholder="Bạn đang tìm kiếm điều gì trong hành trình này?"
                  rows={2}
                  className="w-full px-2 py-5 border-b-2 border-gray-100 focus:border-gray-900 outline-none transition-all duration-700 text-lg font-medium tracking-widest bg-transparent resize-none placeholder:text-gray-200"
                  value={userData.intention}
                  onChange={(e) => setUserData({...userData, intention: e.target.value})}
                />
              </div>
              <div className="pt-10">
                <button 
                  type="submit"
                  className="w-full py-7 bg-gray-900 text-white rounded-full text-[12px] tracking-[0.8em] uppercase hover:bg-black transition-all shadow-2xl shadow-gray-200 font-black"
                >
                  Giải mã bản đồ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result View */}
      {step === 'result' && analysis && (
        <div className="bg-white min-h-screen px-6 py-24 fade-in">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-32 text-center">
              <span className="text-[12px] tracking-[1em] uppercase text-gray-500 font-black mb-12 block">
                The Vibration of {userData.fullName}
              </span>
              <h1 className="text-3xl md:text-5xl font-light text-gray-900 leading-[1.8] max-w-6xl mx-auto mb-16 tracking-tight px-4">
                {analysis.introduction}
              </h1>
              
              <div className="flex flex-col items-center gap-10">
                <div 
                  className="w-52 h-[3px] transition-all duration-1000" 
                  style={{ 
                    backgroundColor: analysis.mainColorHex, 
                    boxShadow: `0 0 35px ${analysis.mainColorHex}` 
                  }}
                />
                <p className="text-lg font-medium text-gray-600 italic max-w-4xl leading-[2.6] tracking-widest px-8">
                  {analysis.mainColorDescription}
                </p>
              </div>
            </div>

            {/* Indicator Grid */}
            <div className="mb-48">
              <div className="flex flex-col items-center mb-20 space-y-4">
                <h2 className="text-[14px] tracking-[0.8em] uppercase text-gray-900 font-black">
                  Hệ thống 21 tần số năng lượng
                </h2>
                <div className="w-16 h-[2px] bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {analysis.indicators.map((indicator, idx) => (
                  <IndicatorCard 
                    key={idx} 
                    indicator={indicator} 
                  />
                ))}
              </div>
            </div>

            {/* Deep Reading Section */}
            <div className="max-w-5xl mx-auto mb-48 relative">
              <div className="absolute -left-16 -top-20 text-[15rem] text-gray-50 font-serif opacity-30 select-none pointer-events-none">“</div>
              <div className="px-6 relative z-10">
                {renderMarkdownText(analysis.fullReading)}
              </div>
              <div className="absolute -right-16 -bottom-40 text-[15rem] text-gray-50 font-serif opacity-30 select-none pointer-events-none rotate-180">“</div>
            </div>

            {/* Final Blessing */}
            <div className="text-center py-32 border-t-2 border-gray-50">
              <div className="mb-16 flex justify-center">
                 <div className="w-4 h-4 rounded-full bg-gray-100 animate-ping" />
              </div>
              <p className="text-2xl font-light italic text-gray-600 mb-20 tracking-[0.2em] max-w-4xl mx-auto leading-relaxed px-6">
                {analysis.blessing}
              </p>
              <button 
                onClick={() => setStep('intro')}
                className="group text-[12px] tracking-[0.8em] uppercase text-gray-500 hover:text-gray-900 transition-all duration-700 flex items-center gap-6 mx-auto font-black"
              >
                <span className="w-12 h-[2px] bg-gray-100 group-hover:w-24 group-hover:bg-gray-900 transition-all duration-700"></span>
                Khởi đầu hành trình mới
                <span className="w-12 h-[2px] bg-gray-100 group-hover:w-24 group-hover:bg-gray-900 transition-all duration-700"></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
