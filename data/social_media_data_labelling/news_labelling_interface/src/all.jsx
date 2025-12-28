import React, { useState, useEffect } from 'react';
import { Upload, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';

export default function CSVLabelingTool() {
  const [data, setData] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [batchSize, setBatchSize] = useState(10);
  const [labels, setLabels] = useState({});
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name.replace('.csv', ''));
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        setCurrentBatch(0);
        setLabels({});
      },
      error: (error) => {
        alert('Error parsing CSV: ' + error.message);
      }
    });
  };

  const truncateText = (text, wordLimit = 100) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  const handleLabel = (index, labelValue) => {
    setLabels(prev => ({
      ...prev,
      [index]: labelValue
    }));
  };

  const getCurrentBatchData = () => {
    const start = currentBatch * batchSize;
    const end = start + batchSize;
    return data.slice(start, end);
  };

  const totalBatches = Math.ceil(data.length / batchSize);

  const saveBatch = () => {
    const start = currentBatch * batchSize;
    const end = start + batchSize;
    const currentBatchData = data.slice(start, end);
    
    // Only save rows that have been labeled in this batch
    const labeledBatchData = currentBatchData
      .map((row, batchIdx) => {
        const globalIdx = start + batchIdx;
        const label = labels[globalIdx];
        // Only include if labeled (not undefined and not 3)
        if (label !== undefined && label !== 3) {
          return {
            ...row,
            label: label
          };
        }
        return null;
      })
      .filter(row => row !== null);

    if (labeledBatchData.length === 0) {
      alert('No labeled items in this batch to save!');
      return;
    }

    const csv = Papa.unparse(labeledBatchData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_batch_${currentBatch + 1}_labeled.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const nextBatch = () => {
    if (currentBatch < totalBatches - 1) {
      saveBatch();
      setCurrentBatch(prev => prev + 1);
    }
  };

  const prevBatch = () => {
    if (currentBatch > 0) {
      saveBatch();
      setCurrentBatch(prev => prev - 1);
    }
  };

  const skipBatch = () => {
    if (currentBatch < totalBatches - 1) {
      setCurrentBatch(prev => prev + 1);
    }
  };

  const getLabelColor = (label) => {
    switch(label) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getLabelText = (label) => {
    switch(label) {
      case 0: return 'Fake';
      case 1: return 'Not Fake';
      case 2: return 'Satire';
      default: return 'Unlabeled';
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (data.length === 0) return;
      
      const start = currentBatch * batchSize;
      const currentBatchItems = getCurrentBatchData();
      
      // Number keys 1-9,0 for quick labeling
      if (e.key >= '1' && e.key <= '9') {
        const itemIndex = parseInt(e.key) - 1;
        if (itemIndex < currentBatchItems.length) {
          const globalIndex = start + itemIndex;
          const currentLabel = labels[globalIndex];
          // Cycle through labels: unlabeled -> fake -> not fake -> satire -> unlabeled
          let nextLabel;
          if (currentLabel === undefined || currentLabel === 3) nextLabel = 0;
          else if (currentLabel === 0) nextLabel = 1;
          else if (currentLabel === 1) nextLabel = 2;
          else nextLabel = 3;
          handleLabel(globalIndex, nextLabel);
        }
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowRight' && currentBatch < totalBatches - 1) {
        nextBatch();
      }
      if (e.key === 'ArrowLeft' && currentBatch > 0) {
        prevBatch();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [data, currentBatch, labels, batchSize]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">CSV Data Labeling Tool</h1>
          
          <div className="flex gap-4 items-center mb-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
              <Upload size={20} />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            {data.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Batch Size:</label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 10))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                    min="1"
                  />
                </div>
                
                <button
                  onClick={saveBatch}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={20} />
                  Save Current Batch
                </button>
              </>
            )}
          </div>

          {data.length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              Total rows: {data.length} | Current batch: {currentBatch + 1} / {totalBatches}
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
            <strong>Keyboard shortcuts:</strong> Press 1-9 to cycle labels for items 1-9 | Arrow keys to navigate batches
          </div>
        </div>

        {data.length > 0 && (
          <div className="space-y-4">
            {getCurrentBatchData().map((row, batchIndex) => {
              const globalIndex = currentBatch * batchSize + batchIndex;
              const currentLabel = labels[globalIndex];
              
              return (
                <div
                  key={globalIndex}
                  className="bg-white rounded-lg shadow p-4 border-l-4 transition"
                  style={{ borderColor: currentLabel !== undefined && currentLabel !== 3 ? 
                    (currentLabel === 0 ? '#ef4444' : currentLabel === 1 ? '#22c55e' : '#eab308') : '#d1d5db' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-medium text-gray-500">
                      Item {batchIndex + 1} (Row {globalIndex + 1})
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getLabelColor(currentLabel)}`}>
                      {getLabelText(currentLabel)}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {truncateText(row.post_caption, 100)}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLabel(globalIndex, 0)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        currentLabel === 0
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Fake
                    </button>
                    <button
                      onClick={() => handleLabel(globalIndex, 1)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        currentLabel === 1
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Not Fake
                    </button>
                    <button
                      onClick={() => handleLabel(globalIndex, 2)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        currentLabel === 2
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      Satire
                    </button>
                    <button
                      onClick={() => handleLabel(globalIndex, 3)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                        currentLabel === 3 || currentLabel === undefined
                          ? 'bg-gray-400 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {data.length > 0 && (
          <div className="flex justify-between items-center mt-6 bg-white rounded-lg shadow p-4">
            <button
              onClick={prevBatch}
              disabled={currentBatch === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
              Previous Batch
            </button>
            
            <div className="flex items-center gap-3">
              <div className="text-gray-700 font-medium">
                Batch {currentBatch + 1} of {totalBatches}
              </div>
              <button
                onClick={skipBatch}
                disabled={currentBatch === totalBatches - 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Skip Batch
              </button>
            </div>
            
            <button
              onClick={nextBatch}
              disabled={currentBatch === totalBatches - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Save & Next
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {data.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No data loaded</h2>
            <p className="text-gray-500">Upload a CSV file to start labeling</p>
          </div>
        )}
      </div>
    </div>
  );
}