import React, { useState, useEffect } from 'react';

const ProgressTest = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test localStorage data
  const testLocalStorage = () => {
    const lastScan = localStorage.getItem('lastEmotionScan');
    const lastAnalysis = localStorage.getItem('lastAnalysisResult');
    const capturedImage = localStorage.getItem('capturedImage');
    
    setTestData({
      lastScan: lastScan ? JSON.parse(lastScan) : 'No scan data',
      lastAnalysis: lastAnalysis ? 'Analysis data exists' : 'No analysis data',
      capturedImage: capturedImage ? 'Image exists' : 'No image',
      timestamp: new Date().toLocaleString()
    });
  };

  // Test API connection
  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        setTestData(prev => ({
          ...prev,
          apiStatus: '✅ Backend is running',
          apiResponse: data
        }));
      } else {
        setError('❌ Backend responded with error');
      }
    } catch (err) {
      setError('❌ Cannot connect to backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testLocalStorage();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Progress Tab Test</h2>
      
      {/* Test Results */}
      <div className="space-y-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">LocalStorage Data:</h3>
          <pre className="text-sm text-blue-800 bg-blue-100 p-2 rounded">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2">API Error:</h3>
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {loading && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              <span className="text-yellow-800">Testing API connection...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Test Buttons */}
      <div className="flex gap-4">
        <button
          onClick={testLocalStorage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh LocalStorage Test
        </button>
        
        <button
          onClick={testAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          🌐 Test Backend Connection
        </button>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">📋 How to Fix Progress Tab:</h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Make sure backend is running (port 5000)</li>
          <li>Make sure frontend is running (port 5173)</li>
          <li>Do a mood scan first to generate data</li>
          <li>Check if you're logged in (authentication required)</li>
          <li>Check browser console for errors</li>
        </ol>
      </div>
    </div>
  );
};

export default ProgressTest;
