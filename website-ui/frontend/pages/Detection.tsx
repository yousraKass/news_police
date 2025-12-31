import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, X, AlertCircle } from 'lucide-react';
import { LanguageContext } from '../App';
import { Card, Button } from '../components/common';
import { generateMockAnalysis, saveToHistory } from '../utils';
import { SAMPLE_TEXTS } from '../data';

// Real categories from the dataset
const REAL_CATEGORIES = [
  'nation',
  'economie',
  'monde',
  'culture',
  'sport',
  'hightech',
  'sante',
  'islam',
  'societe'
];

// Category translations for display
const CATEGORY_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  'nation': { ar: 'وطني', en: 'National' },
  'economie': { ar: 'اقتصاد', en: 'Economy' },
  'monde': { ar: 'عالم', en: 'World' },
  'culture': { ar: 'ثقافة', en: 'Culture' },
  'sport': { ar: 'رياضة', en: 'Sports' },
  'hightech': { ar: 'تكنولوجيا', en: 'Technology' },
  'sante': { ar: 'صحة', en: 'Health' },
  'islam': { ar: 'إسلام', en: 'Islam' },
  'societe': { ar: 'مجتمع', en: 'Society' }
};

export const Detection = () => {
  const { t, lang } = useContext(LanguageContext);
  const [text, setText] = useState('');
  const [category, setCategory] = useState(REAL_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const navigate = useNavigate();

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['text/plain', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setFileError(lang === 'ar' ? 'يرجى تحميل ملف PDF أو نصي فقط' : 'Please upload a PDF or text file only');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError(lang === 'ar' ? 'يجب أن يكون حجم الملف أقل من 10 ميجابايت' : 'File size must be less than 10MB');
      return;
    }

    setFileError('');
    setUploadedFile(file);

    try {
      let extractedText = '';

      if (file.type === 'text/plain') {
        // Read text file
        extractedText = await file.text();
      } else if (file.type === 'application/pdf') {
        // For PDF, we'll need to extract text
        // Using a simple base64 conversion and placeholder
        // In production, you'd use a library like pdf.js or send to backend
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          // Placeholder: In production, use proper PDF text extraction
          extractedText = `[PDF Content from ${file.name}]\n\nThis is extracted text from the PDF file. In production, implement proper PDF text extraction using libraries like pdf.js or a backend service.`;
          setText(extractedText);
        };
        reader.readAsDataURL(file);
        return;
      }

      setText(extractedText);
    } catch (error) {
      setFileError(lang === 'ar' ? 'خطأ في قراءة الملف. يرجى المحاولة مرة أخرى.' : 'Error reading file. Please try again.');
      console.error('File reading error:', error);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError('');
    setText('');
  };

  // Get the final category (custom or selected)
  const getFinalCategory = () => {
    return useCustomCategory && customCategory.trim() ? customCategory.trim() : category;
  };

  // Handle analysis with improved error handling
  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (text.length < 20) {
      setAnalysisError(lang === 'ar' 
        ? 'يرجى إدخال نص أطول (20 حرفًا على الأقل)' 
        : 'Please enter longer text (minimum 20 characters)');
      return;
    }
    
    // Clear previous errors
    setAnalysisError('');
    
    // Get the final category before processing
    const finalCategory = getFinalCategory();
    
    setIsLoading(true);
    setProgress(0);
    
    try {
      // Animate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Generate analysis
      const res = await generateMockAnalysis(text, { 
        category: finalCategory,
        source: uploadedFile?.name || 'Direct Input'
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Save to history
      saveToHistory(res);
      
      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setIsLoading(false);
      
      // Navigate to results
      navigate(`/results/${res.id}`, { state: { result: res } });
      
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsLoading(false);
      setProgress(0);
      setAnalysisError(
        lang === 'ar' 
          ? 'فشل التحليل. يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة.' 
          : 'Analysis failed. Please try again or refresh the page.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{t.newAnalysis}</h1>
        <p className="text-gray-500">{t.scanText}</p>
      </div>

      {/* Error Display */}
      {analysisError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="font-semibold text-red-900">
              {lang === 'ar' ? 'خطأ' : 'Error'}
            </p>
            <p className="text-sm text-red-700 mt-1">{analysisError}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <Card className="p-12 text-center space-y-8">
           <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="w-full max-w-md bg-gray-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300 ease-out" 
                  style={{width: `${progress}%`}}
                ></div>
              </div>
              <p className="text-gray-600 font-medium">
                {lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'} {progress}%
              </p>
              <p className="text-sm text-gray-400">
                {progress < 30 && (lang === 'ar' ? 'تحليل النص...' : 'Analyzing text...')}
                {progress >= 30 && progress < 60 && (lang === 'ar' ? 'استخراج الميزات...' : 'Extracting features...')}
                {progress >= 60 && progress < 90 && (lang === 'ar' ? 'تشغيل النموذج...' : 'Running model...')}
                {progress >= 90 && (lang === 'ar' ? 'إنهاء التحليل...' : 'Finalizing analysis...')}
              </p>
           </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleAnalysis} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  {lang === 'ar' ? 'رفع ملف (اختياري)' : 'Upload File (Optional)'}
                </label>
                {uploadedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                  >
                    <X size={16} />
                    {lang === 'ar' ? 'إزالة الملف' : 'Remove File'}
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploadedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Upload size={24} className={uploadedFile ? 'text-green-600' : 'text-gray-400'} />
                  <span className={`text-sm font-medium ${uploadedFile ? 'text-green-700' : 'text-gray-600'}`}>
                    {uploadedFile
                      ? `${lang === 'ar' ? 'تم الرفع: ' : 'Uploaded: '}${uploadedFile.name}`
                      : lang === 'ar'
                      ? 'انقر لرفع ملف PDF أو نصي'
                      : 'Click to upload PDF or text file'}
                  </span>
                </label>
              </div>

              {fileError && (
                <p className="text-sm text-red-600">{fileError}</p>
              )}

              <div className="text-center">
                <span className="text-sm text-gray-500">
                  {lang === 'ar' ? 'أو' : 'OR'}
                </span>
              </div>
            </div>

            {/* Manual Text Entry Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {lang === 'ar' ? 'إدخال النص يدوياً' : 'Enter Text Manually'}
              </label>
              <textarea 
                value={text} 
                onChange={(e) => {
                  setText(e.target.value);
                  if (analysisError) setAnalysisError('');
                }} 
                placeholder={t.newsContent} 
                className={`w-full h-64 p-4 rounded-xl border ${analysisError && text.length < 20 ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg resize-none ${lang === 'ar' ? 'font-arabic text-right' : ''}`} 
                dir={lang === 'ar' ? 'rtl' : 'ltr'} 
              />
              <p className={`text-xs ${text.length < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {text.length} / 20 {lang === 'ar' ? 'حرف (الحد الأدنى)' : 'characters (minimum)'}
              </p>
            </div>

            {/* Category Selection Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                {lang === 'ar' ? 'اختر الفئة' : 'Select Category'}
              </label>
              
              {/* Predefined Categories */}
              <select 
                value={useCustomCategory ? 'custom' : category}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setUseCustomCategory(true);
                  } else {
                    setUseCustomCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className={`w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none ${lang === 'ar' ? 'text-right' : ''}`}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                {REAL_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {lang === 'ar' ? CATEGORY_TRANSLATIONS[cat].ar : CATEGORY_TRANSLATIONS[cat].en}
                  </option>
                ))}
                <option value="custom">
                  {lang === 'ar' ? 'فئة مخصصة...' : 'Custom category...'}
                </option>
              </select>

              {/* Custom Category Input */}
              {useCustomCategory && (
                <div className="space-y-2">
                  <input 
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder={lang === 'ar' ? 'أدخل فئة مخصصة' : 'Enter custom category'}
                    className={`w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50 ${lang === 'ar' ? 'text-right' : ''}`}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomCategory(false);
                      setCustomCategory('');
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    {lang === 'ar' ? '← العودة إلى الفئات المحددة مسبقاً' : '← Back to predefined categories'}
                  </button>
                </div>
              )}

              {/* Category Info */}
              <div className={`p-3 rounded-lg text-xs ${useCustomCategory && customCategory.trim() ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                <p className={useCustomCategory && customCategory.trim() ? 'text-blue-700 font-medium' : 'text-gray-600'}>
                  {lang === 'ar' ? '✓ الفئة المحددة: ' : '✓ Selected category: '}
                  <span className="font-bold">
                    {getFinalCategory()}
                  </span>
                  {useCustomCategory && customCategory.trim() && (
                    <span className="ml-2 text-blue-600">
                      {lang === 'ar' ? '(مخصصة)' : '(custom)'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Sample Texts */}
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((s, i) => (
                <Button 
                  key={i} 
                  type="button"
                  variant="secondary" 
                  className="text-xs" 
                  onClick={() => { 
                    setText(s.text); 
                    if (REAL_CATEGORIES.includes(s.category)) {
                      setCategory(s.category);
                      setUseCustomCategory(false);
                      setCustomCategory('');
                    } else {
                      setCustomCategory(s.category);
                      setUseCustomCategory(true);
                    }
                    setUploadedFile(null);
                    if (analysisError) setAnalysisError('');
                  }}
                >
                  {t.loadSample} {i+1}
                </Button>
              ))}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-bold" 
              disabled={text.length < 20}
            >
              {t.analyzeContent} <ShieldCheck size={20} />
            </Button>
          </form>
        </Card>
      )} 
    </div>
  );
};