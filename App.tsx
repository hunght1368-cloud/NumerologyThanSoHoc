import React, { useState, useMemo } from 'react';
import { UserData, AnalysisResult } from './types';
import { analyzeNumerology } from './services/geminiService';
import LoadingScreen from './components/LoadingScreen';
import IndicatorCard from './components/IndicatorCard';

// Xử lý tên (Loại bỏ dấu, chuyển hoa, chỉ giữ A-Z)
const cleanName = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
};

// Bảng mã Pythagoras
const getLetterValue = (char: string): number => {
  const map: Record<string, number> = {
    A: 1, J: 1, S: 1, B: 2, K: 2, T: 2, C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4, E: 5, N: 5, W: 5, F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7, H: 8, Q: 8, Z: 8, I: 9, R: 9
  };
  return map[char] || 0;
};

// Hàm rút gọn chuẩn (Giữ Master 11, 22, 33)
const reduceNumerology = (num: number, keepMaster: boolean = true): { reduced: number; compound: number } => {
  if (num <= 9) return { reduced: num, compound: num };
  let current = num;
  let lastCompound = num;
  
  while (current > 9) {
    if (keepMaster && (current === 11 || current === 22 || current === 33)) break;
    lastCompound = current;
    current = String(current).split('').reduce((acc, c) => acc + parseInt(c), 0);
  }
  return { reduced: current, compound: lastCompound };
};

// Định dạng hiển thị
const formatValue = (num: number, isLifePath: boolean = false, keepMaster: boolean = true): string => {
  const { reduced, compound } = reduceNumerology(num, keepMaster);
  
  if (!isLifePath) {
    const karmic = [13, 14, 16, 19];
    if (karmic.includes(compound)) {
      const kReduced = compound === 19 ? 1 : String(compound).split('').reduce((acc, c) => acc + parseInt(c), 0);
      return `${compound}/${kReduced}`;
    }
  }
  
  if (keepMaster && (compound === 11 || compound === 22 || compound === 33)) return `${compound}`;
  return `${reduced}`;
};

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({ fullName: '', birthDate: '', intention: '' });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'form' | 'result'>('intro');
  const [error, setError] = useState<string>('');

  const liveIndicators = useMemo(() => {
    if (!userData.fullName || !userData.birthDate) return null;

    const rawName = cleanName(userData.fullName);
    const [year, month, day] = userData.birthDate.split('-').map(Number);
    
    const dR = reduceNumerology(day, true).reduced;
    const mR = reduceNumerology(month, true).reduced;
    const yR = reduceNumerology(year, true).reduced;

    const core: Record<string, string | number> = {};
    const timeline: { pinnacle: string; challenge: number }[] = [];
    const insights: Record<string, string | number> = {};

    // CHỈ SỐ CỐT LÕI
    core["Đường Đời"] = formatValue(dR + mR + yR, true, true);
    const expSum = rawName.split('').reduce((acc, c) => acc + getLetterValue(c), 0);
    core["Sứ Mệnh"] = formatValue(expSum, false, true);
    const vowels = rawName.split('').filter(c => 'AEIOU'.includes(c));
    core["Linh Hồn"] = formatValue(vowels.reduce((acc, c) => acc + getLetterValue(c), 0), false, true);
    const consonants = rawName.split('').filter(c => !'AEIOU'.includes(c));
    core["Nhân Cách"] = formatValue(consonants.reduce((acc, c) => acc + getLetterValue(c), 0), false, true);
    core["Ngày Sinh"] = day;

    // HÀNH TRÌNH (Chặng & Thách Thức)
    const p1 = mR + dR;
    const p2 = dR + yR;
    const p3 = reduceNumerology(p1, true).reduced + reduceNumerology(p2, true).reduced;
    const p4 = mR + yR;

    const t1 = Math.abs(mR - dR);
    const t2 = Math.abs(dR - yR);
    const t3 = Math.abs(t1 - t2);
    const t4 = Math.abs(mR - yR);

    timeline.push({ pinnacle: formatValue(p1, false, true), challenge: t1 });
    timeline.push({ pinnacle: formatValue(p2, false, true), challenge: t2 });
    timeline.push({ pinnacle: formatValue(p3, false, true), challenge: t3 });
    timeline.push({ pinnacle: formatValue(p4, false, true), challenge: t4 });

    // CÁC CHỈ SỐ PHỤ
    const lpFinal = reduceNumerology(dR + mR + yR, true).reduced;
    const expFinal = reduceNumerology(expSum, true).reduced;
    insights["Trưởng Thành"] = formatValue(lpFinal + expFinal, false, true);
    const nameParts = userData.fullName.trim().split(/\s+/);
    const balanceSum = nameParts.reduce((acc, part) => acc + getLetterValue(cleanName(part)[0] || ''), 0);
    insights["Cân Bằng"] = reduceNumerology(balanceSum, true).reduced;
    insights["Tư Duy"] = reduceNumerology(day + expFinal, true).reduced;
    insights["Năm Cá Nhân"] = reduceNumerology(dR + mR + 1, true).reduced;

    return { core, timeline, insights };
  }, [userData.fullName, userData.birthDate]);

  const handleStart = () => setStep('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.fullName || !userData.birthDate || !liveIndicators) return;
    
    setLoading(true);
    setError('');
    
    try {
      const flatIndicators: Record<string, string | number> = {
        ...liveIndicators.core,
        ...liveIndicators.insights,
        "Chặng 1": liveIndicators.timeline[0].pinnacle,
        "Thách Thức 1": liveIndicators.timeline[0].challenge,
        "Chặng 2": liveIndicators.timeline[1].pinnacle,
        "Thách Thức 2": liveIndicators.timeline[1].challenge,
        "Chặng 3": liveIndicators.timeline[2].pinnacle,
        "Thách Thức 3": liveIndicators.timeline[2].challenge,
        "Chặng 4": liveIndicators.timeline[3].pinnacle,
        "Thách Thức 4": liveIndicators.timeline[3].challenge,
      };
      
      const result = await analyzeNumerology(userData, flatIndicators);
      setAnalysis(result);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Kết nối tần số bị gián đoạn. Hãy thử lại.";
      setError(errorMessage);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen selection:bg-gray-100 bg-white text-gray-900">
      {step === 'intro' && (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6 fade-in bg-white">
          <div className="max-w-4xl">
            <div className="mb-12">
               <div className="w-[1px] h-16 bg-gray-200 mx-auto mb-8" />
               <h2 className="text-[11px] tracking-[1.2em] uppercase text-gray-400 font-black">Bản Đồ Tâm Thức</h2>
            </div>
            <p className="text-xl md:text-2xl font-light leading-[2.2] mb-16 text-gray-800 tracking-tight px-4 max-w-3xl mx-auto">
              "Hãy cho phép bản thân được thấu suốt. Chúng ta không chỉ giải mã những con số, mà đang định vị lại rung động của chính mình trên hành trình chuyển hóa từ Áp Lực sang Sức Mạnh."
            </p>
            <button onClick={handleStart} className="group relative px-16 py-5 overflow-hidden rounded-full border border-gray-200 transition-all duration-1000 hover:border-black shadow-sm bg-white">
              <span className="relative z-10 text-[10px] tracking-[0.6em] uppercase text-gray-500 group-hover:text-black transition-colors font-black">Khám phá nội tại</span>
            </button>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white fade-in">
          <div className="lg:col-span-4 flex flex-col items-center justify-center py-20 px-10 border-r border-gray-50 bg-white lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
            <div className="w-full max-w-sm">
              <h2 className="text-[10px] tracking-[0.6em] uppercase text-gray-400 mb-16 font-black">Thông tin định chuẩn</h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black block">Danh xưng đầy đủ</label>
                  <input required type="text" placeholder="NGUYỄN HOÀNG NAM" className="w-full px-0 py-3 border-b border-gray-100 focus:border-black outline-none transition-all duration-700 text-lg font-medium tracking-widest bg-transparent uppercase" value={userData.fullName} onChange={(e) => setUserData({...userData, fullName: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black block">Ngày xuất hiện</label>
                  <input required type="date" className="w-full px-0 py-3 border-b border-gray-100 focus:border-black outline-none transition-all duration-700 text-lg font-medium tracking-widest bg-transparent" value={userData.birthDate} onChange={(e) => setUserData({...userData, birthDate: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-gray-400 font-black block">Tâm nguyện chuyển hóa</label>
                  <textarea placeholder="Mục tiêu của bạn là gì?" rows={1} className="w-full px-0 py-3 border-b border-gray-100 focus:border-black outline-none transition-all duration-700 text-md font-medium tracking-widest bg-transparent resize-none" value={userData.intention} onChange={(e) => setUserData({...userData, intention: e.target.value})} />
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full py-5 bg-black text-white rounded-full text-[10px] tracking-[0.8em] uppercase hover:bg-gray-900 transition-all shadow-xl font-black">Giải mã tần số</button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-8 lg:p-16 relative">
            <div className="mb-10 flex justify-between items-center border-b border-gray-50 pb-8">
               <div className="space-y-1">
                  <span className="text-[10px] tracking-[0.8em] uppercase text-black font-black block">Ma Trận Tần Số Soi Chiếu</span>
                  <p className="text-[9px] text-gray-400 font-medium tracking-[0.2em] italic uppercase">Hệ Pythagoras & Triết lý Hawkins 2026</p>
               </div>
            </div>

            {liveIndicators ? (
              <div className="space-y-14 animate-fadeIn pb-20">
                <div>
                  <h3 className="text-[9px] tracking-[0.4em] uppercase text-gray-300 font-black mb-6">Chỉ số Cốt lõi</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(liveIndicators.core).map(([name, value], idx) => (
                      <div key={idx} className="bg-stone-900 p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
                        <p className="text-[8px] tracking-[0.1em] uppercase text-stone-500 font-black">{name}</p>
                        <span className="text-xl font-light text-white tracking-tighter">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] tracking-[0.4em] uppercase text-gray-300 font-black mb-6">Hành Trình & Thử Thách</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {liveIndicators.timeline.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col gap-3">
                         <p className="text-[8px] tracking-[0.2em] uppercase text-gray-400 font-black">Giai đoạn {idx + 1}</p>
                         <div className="flex justify-between items-center">
                            <span className="text-[7px] uppercase text-gray-400 font-bold">Chặng</span>
                            <span className="text-lg font-bold text-black">{item.pinnacle}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-[7px] uppercase text-gray-400 font-bold">Thách thức</span>
                            <span className="text-lg font-medium text-gray-500">{item.challenge}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] tracking-[0.4em] uppercase text-gray-300 font-black mb-6">Thấu suốt bổ trợ</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(liveIndicators.insights).map(([name, value], idx) => (
                      <div key={idx} className="bg-stone-900 p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
                        <p className="text-[8px] tracking-[0.1em] uppercase text-stone-500 font-black">{name}</p>
                        <span className="text-xl font-light text-white tracking-tighter">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
                 <div className="w-20 h-20 border border-dashed border-gray-200 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                 </div>
                 <p className="text-[9px] tracking-[0.4em] uppercase text-gray-300 max-w-xs leading-relaxed">Đang chờ rung động từ bạn...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'result' && analysis && (
        <div className="bg-white min-h-screen px-6 py-24 fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="mb-24 text-center">
              <span className="text-[10px] tracking-[0.8em] uppercase text-gray-400 font-black mb-10 block">Hồ Sơ Tâm Thức: {userData.fullName}</span>
              <h1 className="text-2xl md:text-4xl font-light text-black leading-[1.8] max-w-4xl mx-auto mb-12 tracking-tight">{analysis.introduction}</h1>
              <div className="flex flex-col items-center gap-8">
                <div className="w-40 h-[2px] transition-all duration-1000" style={{ backgroundColor: analysis.mainColorHex, boxShadow: `0 0 20px ${analysis.mainColorHex}` }} />
                <p className="text-lg font-medium text-gray-500 italic max-w-2xl leading-[2.4] tracking-wider">{analysis.mainColorDescription}</p>
              </div>
            </div>

            <div className="mb-32">
              <div className="flex flex-col items-center mb-16 space-y-3">
                <h2 className="text-[12px] tracking-[0.6em] uppercase text-black font-black">21 Tần Số Năng Lượng</h2>
                <div className="w-12 h-[1px] bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {analysis.indicators.map((indicator, idx) => (
                  <IndicatorCard key={idx} indicator={indicator} />
                ))}
              </div>
            </div>

            <div className="max-w-4xl mx-auto mb-32 border-l border-gray-100 pl-10">
              {analysis.fullReading.split('\n\n').map((paragraph, i) => {
                const cleanParagraph = paragraph.trim();
                if (!cleanParagraph) return null;
                const isHeader = cleanParagraph.length < 60 && cleanParagraph === cleanParagraph.toUpperCase();
                return (
                  <p key={i} className={`mb-10 text-gray-700 leading-[2.6] font-medium text-justify ${isHeader ? 'text-lg font-black uppercase tracking-[0.2em] mt-12 text-black' : 'text-md opacity-90'}`}>
                    {cleanParagraph}
                  </p>
                );
              })}
            </div>

            <div className="text-center py-24 border-t border-gray-50">
              <p className="text-xl font-light italic text-gray-500 mb-16 tracking-[0.1em] max-w-3xl mx-auto leading-relaxed">{analysis.blessing}</p>
              <button onClick={() => setStep('intro')} className="group text-[10px] tracking-[0.6em] uppercase text-gray-400 hover:text-black transition-all duration-700 flex items-center gap-5 mx-auto font-black">
                <span className="w-10 h-[1px] bg-gray-100 group-hover:w-20 group-hover:bg-black transition-all duration-700"></span>
                Trở về điểm khởi đầu
                <span className="w-10 h-[1px] bg-gray-100 group-hover:w-20 group-hover:bg-black transition-all duration-700"></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
