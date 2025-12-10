import React, { useState } from 'react';
import { recommendationsAPI } from '../services/api.js';

const APITest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testRecommendationsAPI = async () => {
    setLoading(true);
    try {
      // Test happy mood recommendations
      const happyResponse = await recommendationsAPI.getMoodRecommendations('happy', 'videos', 3);
      setTestResults(prev => ({
        ...prev,
        happy: happyResponse
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        happy: { error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testCategoriesAPI = async () => {
    setLoading(true);
    try {
      const response = await recommendationsAPI.getCategories();
      setTestResults(prev => ({
        ...prev,
        categories: response
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        categories: { error: error.message }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Test Component</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testRecommendationsAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test Happy Mood Recommendations
        </button>
        
        <button
          onClick={testCategoriesAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 ml-2"
        >
          Test Categories API
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Testing API...</span>
        </div>
      )}

      <div className="space-y-4">
        {testResults.happy && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Happy Mood Recommendations:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.happy, null, 2)}
            </pre>
          </div>
        )}

        {testResults.categories && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Categories API:</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.categories, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Make sure your backend server is running on port 5000</li>
          <li>Click the test buttons above to test the APIs</li>
          <li>Check the console for any errors</li>
          <li>If you see errors, make sure the backend is running and accessible</li>
        </ol>
      </div>
    </div>
  );
};

export default APITest;
