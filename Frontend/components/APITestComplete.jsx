import React, { useState } from 'react';
import { recommendationsAPI, authAPI, profileAPI, emotionAPI } from '../services/api.js';

const APITestComplete = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testType, setTestType] = useState('');

  const testAPI = async (apiName, testFunction) => {
    setLoading(true);
    setTestType(apiName);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [apiName]: { success: true, data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [apiName]: { success: false, error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testRecommendations = () => testAPI('recommendations', () => 
    recommendationsAPI.getMoodRecommendations('happy', 'videos', 2)
  );

  const testCategories = () => testAPI('categories', () => 
    recommendationsAPI.getCategories()
  );

  const testAuth = () => testAPI('auth', () => 
    authAPI.getCurrentUser()
  );

  const testProfile = () => testAPI('profile', () => 
    profileAPI.getProfile()
  );

  const testEmotion = () => testAPI('emotion', () => 
    emotionAPI.getEmotionHistory()
  );

  const clearResults = () => {
    setTestResults({});
    setTestType('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        🧪 Complete API Test Suite
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button
          onClick={testRecommendations}
          disabled={loading}
          className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          🎬 Test Recommendations API
        </button>
        
        <button
          onClick={testCategories}
          disabled={loading}
          className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          📂 Test Categories API
        </button>
        
        <button
          onClick={testAuth}
          disabled={loading}
          className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          🔐 Test Auth API
        </button>
        
        <button
          onClick={testProfile}
          disabled={loading}
          className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
        >
          👤 Test Profile API
        </button>
        
        <button
          onClick={testEmotion}
          disabled={loading}
          className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          😊 Test Emotion API
        </button>
        
        <button
          onClick={clearResults}
          className="p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          🗑️ Clear Results
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Testing {testType} API...</span>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(testResults).map(([apiName, result]) => (
          <div key={apiName} className={`border rounded-lg p-4 ${
            result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <h3 className={`font-semibold text-lg mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✅' : '❌'} {apiName} API Test
            </h3>
            
            {result.success ? (
              <div>
                <p className="text-green-700 mb-2">API call successful!</p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-green-600 hover:text-green-800">
                    View Response Data
                  </summary>
                  <pre className="mt-2 bg-white p-3 rounded border overflow-auto text-xs">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div>
                <p className="text-red-700 mb-2">API call failed!</p>
                <p className="text-red-600 text-sm">Error: {result.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">🧪 Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li><strong>Make sure your backend server is running</strong> on port 5000</li>
          <li><strong>Click any test button</strong> to test that specific API</li>
          <li><strong>Green results</strong> mean the API is working correctly</li>
          <li><strong>Red results</strong> mean there's an issue (check backend)</li>
          <li><strong>Check browser console</strong> for detailed error information</li>
        </ol>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">🔍 Expected Results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>Recommendations:</strong> Should return mood-based content</li>
            <li><strong>Categories:</strong> Should return available categories</li>
            <li><strong>Auth:</strong> May fail if not logged in (this is normal)</li>
            <li><strong>Profile:</strong> May fail if not authenticated (this is normal)</li>
            <li><strong>Emotion:</strong> May fail if not authenticated (this is normal)</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>💡 <strong>Tip:</strong> If all APIs show red errors, your backend server is not running or not accessible</p>
        <p>🚀 <strong>Success:</strong> You should see at least Recommendations and Categories APIs working (they're public)</p>
      </div>
    </div>
  );
};

export default APITestComplete;
