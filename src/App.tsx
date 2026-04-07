/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Camera, Leaf, Info, Loader2, Sprout, Sun, Utensils, GraduationCap, Download, Droplets, Mountain, Calendar, Thermometer } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface PlantData {
  name: string;
  details: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const identifyPlant = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      // Using gemini-1.5-flash for better stability in some regions, 
      // but you can change it back to gemini-3-flash-preview if preferred.
      const modelName = "gemini-1.5-flash"; 
      
      const mimeType = image.split(';')[0].split(':')[1];
      const base64Data = image.split(',')[1];
      
      const prompt = `
        أنت خبير في علم النبات. قم بتحليل هذه الصورة وتعرف على النبات الموجود فيها.
        قدم المعلومات التالية باللغة العربية بشكل منسق وجميل:
        - ## الاسم الشائع واللاتيني 🌿
        - ## مواعيد الزراعة 📅
        - ## التربة والبيئة 🏜️
        - ## الإضاءة والحرارة ☀️
        - ## الري والماء 💧
        - ## القيمة الغذائية والفوائد 🥗
        - ## نصائح العناية الإضافية ✨
        استخدم عناوين واضحة ونقاط. تأكد من استخدام العناوين المذكورة أعلاه بالضبط.
      `;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: base64Data } }
          ]
        }
      });

      if (!response.text) {
        throw new Error("EMPTY_RESPONSE");
      }

      setResult(response.text);
    } catch (err: any) {
      console.error("Plant Identification Error:", err);
      if (err.message === "API_KEY_MISSING") {
        setError("مفتاح البرمجة (API Key) غير متوفر. يرجى إضافته في إعدادات Secrets في AI Studio.");
      } else if (err.message?.includes("quota") || err.status === 429) {
        setError("تم تجاوز الحد المسموح به من الطلبات. يرجى الانتظار دقيقة والمحاولة مرة أخرى.");
      } else {
        setError("حدث خطأ أثناء تحليل الصورة. يرجى التأكد من أن الصورة واضحة وأنك متصل بالإنترنت.");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToText = () => {
    if (!result) return;
    const element = document.createElement("a");
    const file = new Blob([result], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `معلومات_النبات_${new Date().toLocaleDateString('ar-SA')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#020a02] text-white font-sans selection:bg-green-500/30" dir="rtl">
      {/* Background Overlay */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=2000" 
          alt="Plant Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020a02] via-[#020a02]/95 to-[#051a05]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_80%)]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12"
          >
            <div className="p-4 bg-green-500/20 rounded-3xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <Leaf className="w-14 h-14 text-green-400" />
            </div>
            <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-green-200 via-green-400 to-emerald-600 bg-clip-text text-transparent tracking-tighter pb-4 leading-tight">
              معلومات النبات
            </h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4 text-gray-200 mt-4"
          >
            <div className="flex items-center gap-4 bg-green-500/10 px-8 py-3.5 rounded-2xl border border-green-500/20 backdrop-blur-xl shadow-lg">
              <GraduationCap className="w-8 h-8 text-green-400" />
              <span className="text-xl font-bold tracking-wide">إعداد الطلاب: نياف الهذلول & رامي عسيري</span>
            </div>
            <p className="text-lg font-bold text-green-400/90 bg-green-400/5 px-4 py-1 rounded-lg">الصف السادس الإبتدائي - مدارس الخوارزمي</p>
          </motion.div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Upload Section */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-green-500/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-all hover:bg-green-500/5 group/upload"
                >
                  <Upload className="w-12 h-12 text-green-500 mb-4 group-hover/upload:scale-110 transition-transform" />
                  <p className="text-lg font-medium text-gray-300">ارفع صورة النبات هنا</p>
                  <p className="text-sm text-gray-500 mt-2">يدعم JPG, PNG</p>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <div className="relative w-full max-h-96 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <img src={image} alt="Uploaded plant" className="w-full h-full object-contain bg-black/40" />
                    <button 
                      onClick={() => { setImage(null); setResult(null); }}
                      className="absolute top-4 left-4 bg-black/60 hover:bg-red-600/80 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                    >
                      <span className="sr-only">حذف</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  {!result && (
                    <button
                      onClick={identifyPlant}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 flex items-center justify-center gap-3 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          جاري التحليل...
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6" />
                          تعرف على النبات
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </section>

          {/* Results Section */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center"
              >
                {error}
              </motion.div>
            )}

            {result && (
              <motion.section 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Info className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-bold">نتائج التحليل</h2>
                  </div>
                  <button 
                    onClick={exportToText}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    تصدير البيانات
                  </button>
                </div>
                
                <div className="prose prose-invert prose-green max-w-none">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-green-500/5 p-3 rounded-2xl border border-green-500/10 flex flex-col items-center text-center gap-2">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <span className="text-xs text-gray-400">مواعيد الزراعة</span>
                    </div>
                    <div className="bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10 flex flex-col items-center text-center gap-2">
                      <Sun className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs text-gray-400">الإضاءة</span>
                    </div>
                    <div className="bg-blue-500/5 p-3 rounded-2xl border border-blue-500/10 flex flex-col items-center text-center gap-2">
                      <Droplets className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-gray-400">الري</span>
                    </div>
                    <div className="bg-amber-500/5 p-3 rounded-2xl border border-amber-500/10 flex flex-col items-center text-center gap-2">
                      <Mountain className="w-5 h-5 text-amber-400" />
                      <span className="text-xs text-gray-400">التربة</span>
                    </div>
                  </div>

                  <div className="markdown-body text-gray-200 leading-relaxed space-y-4">
                    <Markdown
                      components={{
                        h2: ({ children }) => {
                          const text = String(children);
                          let icon = <Info className="w-5 h-5 inline-block ml-2 text-green-400" />;
                          
                          if (text.includes('الاسم')) icon = <Leaf className="w-5 h-5 inline-block ml-2 text-green-400" />;
                          if (text.includes('الزراعة')) icon = <Calendar className="w-5 h-5 inline-block ml-2 text-green-400" />;
                          if (text.includes('التربة')) icon = <Mountain className="w-5 h-5 inline-block ml-2 text-amber-400" />;
                          if (text.includes('الإضاءة')) icon = <Sun className="w-5 h-5 inline-block ml-2 text-emerald-400" />;
                          if (text.includes('الري')) icon = <Droplets className="w-5 h-5 inline-block ml-2 text-blue-400" />;
                          if (text.includes('الغذائية')) icon = <Utensils className="w-5 h-5 inline-block ml-2 text-lime-400" />;
                          if (text.includes('نصائح')) icon = <Sprout className="w-5 h-5 inline-block ml-2 text-green-400" />;

                          return (
                            <h2 className="flex items-center text-xl font-bold mb-3 text-green-400 mt-6">
                              {icon}
                              {children}
                            </h2>
                          );
                        }
                      }}
                    >
                      {result}
                    </Markdown>
                  </div>
                </div>

                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="mt-8 w-full py-3 border border-white/10 hover:bg-white/5 rounded-xl transition-colors text-gray-400"
                >
                  تحليل نبات آخر
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-500 text-sm border-t border-white/5 pt-8">
          <p>© {new Date().getFullYear()} منصة معلومات النبات - مدارس الخوارزمي</p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="px-3 py-1 bg-green-500/10 rounded-full text-green-500/70">نياف الهذلول</span>
            <span className="px-3 py-1 bg-green-500/10 rounded-full text-green-500/70">رامي عسيري</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
