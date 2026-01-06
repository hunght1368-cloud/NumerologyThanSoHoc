
import React, { useState, useMemo } from 'react';
import { UserData, AnalysisResult } from './types';
import { analyzeNumerology } from './services/geminiService';
import LoadingScreen from './components/LoadingScreen';
import IndicatorCard from './components/IndicatorCard';

// Rút gọn số chuẩn Thần số học (giữ lại số Master 11, 22, 33)
const reduceToSingleDigit = (num: number, keepMaster: boolean = true): number => {
  if (num === 0) return 0;
  let s = num;
  while (s > 9) {
    if (keepMaster && (s === 11 || s === 22 || s === 33)) return s;
    s = String(s).split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  }
  return s;
};

// Kiểm tra Nợ nghiệp và trả về định dạng phân số (vd: 13/4, 16/7)
const getKarmicFormat = (num: number): string | null => {
  if (num === 13) return "13/4";
  if (num === 14) return "14/5";
  if (num === 16) return "16/7";
  if (num === 19) return "19/1";
  return null;
};

const getLetterValue = (char: string): number => {
  const map: Record<string, number> = {
    a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3,
    d: 4, m: 4, v: 4, e: 5, n: 5, w: 5, f: 6, o: 6, x: 6,
    g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9
  };
  return map[char.toLowerCase()] || 0;
};

const isVowel = (char: string): boolean => ['a', 'e', 'i', 'o', 'u'].includes(char.toLowerCase());
const isConsonant = (char: string): boolean => {
    const c = char.toLowerCase();
    return c >= 'a' && c <= 'z' && !['a', 'e', 'i', 'o', 'u'].includes(c);
};

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({ fullName: '', birthDate: '', intention: '' });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'intro' | 'form' | 'result'>('intro');

  // Tính toán 21 chỉ số thời gian thực (Preview luôn màu ĐEN)
  const liveIndicators = useMemo(() => {
    if (!userData.fullName && !userData.birthDate) return null;

    const results: Record<string, string | number> = {};
    const name = userData.fullName || "";
    const date = userData.birthDate || "";
    
    let d = 0, m = 0, y = 0;
    if (date) {
      const [year, month, day] = date.split('-').map(Number);
      d = day; m = month; y = year;
    }

    const dR = reduceToSingleDigit(d, false);
    const mR = reduceToSingleDigit(m, false);
    const yR = reduceToSingleDigit(y, false);

    const karmicDebts = new Set<string>();
    const processKarmic = (raw: number) => {
      const format = getKarmicFormat(raw);
      if (format) karmicDebts.add(format);
      if (raw > 9) {
        const step = String(raw).split('').reduce((acc, c) => acc + parseInt(c), 0);
        const formatStep = getKarmicFormat(step);
        if (formatStep) karmicDebts.add(formatStep);
      }
    };

    const lpRaw = dR + mR + yR;
    processKarmic(lpRaw);
    results["Đường Đời"] = reduceToSingleDigit(lpRaw);

    const missionRaw = name.replace(/\s/g, '').split('').reduce((acc, c) => acc + getLetterValue(c), 0);
    processKarmic(missionRaw);
    results["Sứ Mệnh"] = reduceToSingleDigit(missionRaw);

    const soulRaw = name.split('').filter(isVowel).reduce((acc, c) => acc + getLetterValue(c), 0);
    processKarmic(soulRaw);
    results["Linh Hồn"] = reduceToSingleDigit(soulRaw);

    const personalityRaw = name.split('').filter(isConsonant).reduce((acc, c) => acc + getLetterValue(c), 0);
    processKarmic(personalityRaw);
    results["Nhân Cách"] = reduceToSingleDigit(personalityRaw);

    processKarmic(d);
    results["Ngày Sinh"] = reduceToSingleDigit(d);
    results["Nợ Nghiệp"] = karmicDebts.size > 0 ? Array.from(karmicDebts).sort().join(', ') : "Không";
    results["Thái Độ"] = reduceToSingleDigit(dR + mR);
    results["Trưởng Thành"] = reduceToSingleDigit(Number(results["Đường Đời"]) + Number(results["Sứ Mệnh"]));
    
    const p1 = reduceToSingleDigit(dR + mR);
    const p2 = reduceToSingleDigit(dR + yR);
    const p3 = reduceToSingleDigit(p1 + p2);
    const p4 = reduceToSingleDigit(mR + yR);
    results["Chặng 1"] = p1; results["Chặng 2"] = p2; results["Chặng 3"] = p3; results["Chặng 4"] = p4;

    const t1 = Math.abs(dR - mR);
    const t2 = Math.abs(dR - yR);
    const t3 = Math.abs(t1 - t2);
    const t4 = Math.abs(mR - yR);
    results["Thách Thức 1"] = t1; results["Thách Thức 2"] = t2; results["Thách Thức 3"] = t3; results["Thách Thức 4"] = t4;

    results["Năng Lực Tự Nhiên"] = results["Sứ Mệnh"];
    results["Động Lực Nội Tại"] = results["Linh Hồn"];
    results["Cầu Nối Nội Tâm"] = Math.abs(Number(results["Linh Hồn"]) - Number(results["Nhân Cách"]));

    // Quy chuẩn năm 2026, tháng 1
    const currentYear = 2026;
    const currentMonth = 1;
    const py = reduceToSingleDigit(dR + mR + reduceToSingleDigit(currentYear, false));
    results["Năm Cá Nhân"] = py;
    results["Tháng Cá Nhân"] = reduceToSingleDigit(py + currentMonth);

    return results;
  }, [userData.fullName, userData.birthDate]);

  const handleStart = () => setStep('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData.fullName || !userData.birthDate || !liveIndicators) return;
    
    setLoading(true);
    try {
      const result = await analyzeNumerology(userData, liveIndicators);
      setAnalysis(result);
      setStep('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert("Tần số đang bận. Hãy thử lại sau giây lát.");
    } finally {
      setLoading(false);
    }
  };

  const renderCleanText = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((paragraph, i) => {
      const cleanParagraph = paragraph
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .trim();
        
      if (!cleanParagraph) return null;
      
      const isHeader = cleanParagraph.length < 80 && cleanParagraph === cleanParagraph.toUpperCase();
      
      return (
        <p key={i} className={`mb-12 text-gray-800 leading-[2.8] font-medium tracking-wide text-justify ${isHeader ? 'text-[22px] font-black text-center uppercase tracking-[0.3em] mt-16 text-black' : 'text-[20px] opacity-90'}`}>
          {cleanParagraph}
        </p>
      );
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen selection:bg-gray-200">
      {step === 'intro' && (
        <div className="h-screen flex flex-col items-center justify-center text-center px-6 fade-in bg-white">
          <div className="max-w-4xl">
            <div className="mb-16">
               <div className="w-[1px] h-20 bg-gray-200 mx-auto mb-8" />
               <h2 className="text-[13px] tracking-[1em] uppercase text-gray-500 font-black">Mind Color Map</h2>
            </div>
            <p className="text-2xl md:text-3xl font-light leading-[2.4] mb-20 text-gray-900 tracking-tight px-4">
              "Trân trọng chào đón bạn. Hãy cùng tôi khám phá bản đồ tâm thức qua lăng kính Thần số học và tần số năng lượng. Chúng ta sẽ cùng chuyển hóa mọi áp lực thành sức mạnh, đưa rung động của bạn về trạng thái thấu hiểu và yêu thương thuần khiết."
            </p>
            <button onClick={handleStart} className="group relative px-20 py-6 overflow-hidden rounded-full border border-gray-300 transition-all duration-1000 hover:border-gray-900 shadow-sm">
              <span className="relative z-10 text-[11px] tracking-[0.8em] uppercase text-gray-600 group-hover:text-gray-900 transition-colors font-black">Bắt đầu hành trình</span>
            </button>
          </div>
        </div>
      )}

      {step === 'form' && (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white fade-in">
          <div className="lg:col-span-5 flex flex-col items-center justify-center py-20 px-10 border-r border-gray-50">
            <div className="w-full max-w-lg">
              <h2 className="text-[12px] tracking-[0.8em] uppercase text-gray-500 mb-20 font-black">Thiết lập thông số</h2>
              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-black block">Danh xưng đầy đủ</label>
                  <input required type="text" placeholder="NGUYỄN HOÀNG NAM" className="w-full px-0 py-4 border-b border-gray-100 focus:border-gray-900 outline-none transition-all duration-700 text-xl font-medium tracking-widest bg-transparent placeholder:text-gray-100 uppercase" value={userData.fullName} onChange={(e) => setUserData({...userData, fullName: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-black block">Thời khắc hiện diện</label>
                  <input required type="date" className="w-full px-0 py-4 border-b border-gray-100 focus:border-gray-900 outline-none transition-all duration-700 text-xl font-medium tracking-widest bg-transparent" value={userData.birthDate} onChange={(e) => setUserData({...userData, birthDate: e.target.value})} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-black block">Câu hỏi tâm thức</label>
                  <textarea placeholder="Mục tiêu chuyển hóa của bạn?" rows={1} className="w-full px-0 py-4 border-b border-gray-100 focus:border-gray-900 outline-none transition-all duration-700 text-lg font-medium tracking-widest bg-transparent resize-none placeholder:text-gray-100" value={userData.intention} onChange={(e) => setUserData({...userData, intention: e.target.value})} />
                </div>
                <div className="pt-8">
                  <button type="submit" className="w-full py-6 bg-black text-white rounded-full text-[11px] tracking-[1em] uppercase hover:bg-gray-800 transition-all shadow-xl font-black">Giải mã bản đồ</button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white flex flex-col p-8 lg:p-16 relative overflow-hidden h-screen lg:h-auto lg:overflow-y-auto">
            <div className="mb-12 flex justify-between items-center">
               <div className="space-y-1">
                  <span className="text-[10px] tracking-[1em] uppercase text-gray-900 font-black block">Ma trận Tần số (Soi chiếu)</span>
                  <p className="text-[10px] text-gray-400 font-medium tracking-[0.2em] italic">Dữ liệu quy chuẩn Năm 2026 - Tháng 01</p>
               </div>
            </div>
            {liveIndicators ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-fadeIn pb-12">
                {Object.entries(liveIndicators).map(([name, value], idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-200 luxury-shadow flex flex-col justify-between min-h-[140px] group transition-all duration-700">
                    <div><p className="text-[9px] tracking-[0.3em] uppercase text-gray-400 font-black mb-1">{name}</p></div>
                    <div className="flex items-baseline gap-2"><span className="text-4xl font-light tracking-tighter text-black">{value === "" ? "–" : value}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                 <div className="w-32 h-32 border-2 border-dashed border-gray-100 rounded-full flex items-center justify-center"><div className="w-12 h-12 bg-gray-50 rounded-full animate-pulse" /></div>
                 <p className="text-[12px] tracking-[0.5em] uppercase text-gray-300 max-w-xs leading-relaxed">Đang chờ các xung nhịp đầu tiên...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'result' && analysis && (
        <div className="bg-white min-h-screen px-6 py-24 fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="mb-32 text-center">
              <span className="text-[12px] tracking-[1em] uppercase text-gray-500 font-black mb-12 block">The Vibration of {userData.fullName}</span>
              <h1 className="text-3xl md:text-5xl font-light text-gray-900 leading-[1.8] max-w-6xl mx-auto mb-16 tracking-tight px-4">{analysis.introduction}</h1>
              <div className="flex flex-col items-center gap-10">
                <div className="w-52 h-[3px] transition-all duration-1000" style={{ backgroundColor: analysis.mainColorHex, boxShadow: `0 0 35px ${analysis.mainColorHex}` }} />
                <p className="text-xl font-medium text-gray-600 italic max-w-4xl leading-[2.8] tracking-widest px-8">{analysis.mainColorDescription}</p>
              </div>
            </div>

            <div className="mb-48">
              <div className="flex flex-col items-center mb-20 space-y-4">
                <h2 className="text-[14px] tracking-[0.8em] uppercase text-gray-900 font-black">Hệ thống 21 tần số năng lượng</h2>
                <div className="w-16 h-[2px] bg-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {analysis.indicators.map((indicator, idx) => (
                  <IndicatorCard key={idx} indicator={indicator} />
                ))}
              </div>
            </div>

            <div className="max-w-5xl mx-auto mb-48 relative">
              <div className="absolute -left-16 -top-20 text-[15rem] text-gray-50 font-serif opacity-10 select-none pointer-events-none">“</div>
              <div className="px-6 relative z-10">{renderCleanText(analysis.fullReading)}</div>
              <div className="absolute -right-16 -bottom-40 text-[15rem] text-gray-50 font-serif opacity-10 select-none pointer-events-none rotate-180">“</div>
            </div>

            <div className="text-center py-32 border-t-2 border-gray-50">
              <p className="text-2xl font-light italic text-gray-600 mb-20 tracking-[0.2em] max-w-4xl mx-auto leading-relaxed px-6">{analysis.blessing}</p>
              <button onClick={() => setStep('intro')} className="group text-[12px] tracking-[0.8em] uppercase text-gray-500 hover:text-gray-900 transition-all duration-700 flex items-center gap-6 mx-auto font-black">
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
