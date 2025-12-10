import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { progressAPI } from '../services/api.js';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState({
    weeklyMood: [],
    monthlyMood: [],
    emotions: {},
    activities: [],
    insights: [],
    overview: {}
  });

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to refresh data (can be called manually)
  const refreshData = () => {
    fetchProgressData();
  };

  // Fetch real progress data
  const fetchProgressData = async () => {
    setLoading(true);
      setError(null);
      
      try {
        // Check localStorage for recent mood scan data first
        const lastEmotionScan = localStorage.getItem('lastEmotionScan');
        const lastAnalysisResult = localStorage.getItem('lastAnalysisResult');
        
        if (lastEmotionScan && lastAnalysisResult) {
          const scanData = JSON.parse(lastEmotionScan);
          const analysisData = JSON.parse(lastAnalysisResult);
          
          // Create real progress data from mood scan
          const realProgressData = {
            weeklyMood: [scanData.score],
            monthlyMood: [scanData.score],
            emotions: { 
              [analysisData.analysis.face.primaryEmotion]: 100
            },
            activities: [
              { name: 'Daily Mood Tracking', completed: 1, total: 30, streak: 1 },
              { name: 'Mindfulness Sessions', completed: 1, total: 20, streak: 1 },
              { name: 'Emotion Analysis', completed: 1, total: 25, streak: 1 },
              { name: 'Mood Journaling', completed: 1, total: 15, streak: 1 }
            ],
            insights: [
              `🎯 Your first mood scan detected: ${analysisData.analysis.face.primaryEmotion} emotion`,
              `📊 Mood score: ${scanData.score}/100`,
              `💡 Analysis confidence: ${Math.round(analysisData.analysis.face.confidence * 100)}%`,
              `📸 Keep scanning to build your mood history!`
            ],
            overview: { 
              totalRecords: 1, 
              averageMoodScore: scanData.score 
            }
          };
          
          setProgressData(realProgressData);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Fetch progress overview from backend
        const overviewResponse = await progressAPI.getProgressOverview(30);
        const trendsResponse = await progressAPI.getProgressTrends('month', 'day');
        const insightsResponse = await progressAPI.getProgressInsights(30);
        
        if (overviewResponse.success && trendsResponse.success && insightsResponse.success) {
          // Process real data
          const overview = overviewResponse.data.overview;
          const trends = trendsResponse.data.trends;
          const insights = insightsResponse.data.insights;
          
          // Check if we have actual data
          if (overview && (overview.totalRecords > 0 || (trends && trends.length > 0))) {
            // Convert trends to weekly/monthly format
            const weeklyData = processTrendsToWeekly(trends);
            const monthlyData = processTrendsToMonthly(trends);
            
            // Process emotion distribution
            const emotions = processEmotionDistribution(overviewResponse.data.emotionDistribution);
            
            // Generate activity progress from insights
            const activities = generateActivitiesFromInsights(insights, overview);
            
            setProgressData({
              weeklyMood: weeklyData,
              monthlyMood: monthlyData,
              emotions: emotions,
              activities: activities,
              insights: insights,
              overview: overview
            });
          } else {
            // No real data yet - show demo data
            setError('No mood scan data available yet. Start tracking to see your progress!');
          }
        } else {
          setError('Failed to fetch progress data');
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError(err.message || 'Failed to load progress data');
        
        // Fallback to relevant demo data if API fails or no data
        setProgressData({
          weeklyMood: [75, 68, 82, 79, 85, 78, 81],
          monthlyMood: [72, 75, 78, 80, 82, 79, 85, 81, 78, 80, 83, 85],
          emotions: { 
            'Happy': 35, 
            'Content': 25, 
            'Neutral': 20, 
            'Sad': 12, 
            'Anxious': 8 
          },
          activities: [
            { name: 'Daily Mood Tracking', completed: 0, total: 30, streak: 0 },
            { name: 'Mindfulness Sessions', completed: 0, total: 20, streak: 0 },
            { name: 'Emotion Analysis', completed: 0, total: 25, streak: 0 },
            { name: 'Mood Journaling', completed: 0, total: 15, streak: 0 }
          ],
          insights: [
            '🎯 Start your mood tracking journey today!',
            '📸 Take your first mood scan to see real data',
            '📊 Track your progress over time',
            '💡 Get personalized insights based on your mood patterns'
          ],
          overview: { totalRecords: 0, averageMoodScore: 0 }
        });
      } finally {
        setLoading(false);
      }
  };

  // Use useEffect to call fetchProgressData
  useEffect(() => {
    fetchProgressData();
  }, [selectedPeriod]);

  // Auto-refresh when localStorage changes (new mood scans)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'lastEmotionScan' || e.key === 'lastAnalysisResult') {
        // New mood scan data available, refresh progress
        setTimeout(() => refreshData(), 1000); // Small delay to ensure data is saved
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper function to process trends to weekly format
  const processTrendsToWeekly = (trends) => {
    if (!trends || trends.length === 0) return [0, 0, 0, 0, 0, 0, 0];
    
    // Get last 7 days
    const last7Days = trends.slice(-7);
    return last7Days.map(day => Math.round(day.avgMoodScore || 0));
  };

  // Helper function to process trends to monthly format
  const processTrendsToMonthly = (trends) => {
    if (!trends || trends.length === 0) return new Array(12).fill(0);
    
    // Group by month and calculate averages
    const monthlyData = new Array(12).fill(0);
    trends.forEach(day => {
      const month = new Date(day._id).getMonth();
      monthlyData[month] = Math.round(day.avgMoodScore || 0);
    });
    
    return monthlyData;
  };

  // Helper function to process emotion distribution
  const processEmotionDistribution = (emotionDist) => {
    if (!emotionDist || Object.keys(emotionDist).length === 0) {
      return { 'Happy': 0, 'Content': 0, 'Neutral': 0, 'Sad': 0, 'Anxious': 0 };
    }
    
    const total = Object.values(emotionDist).reduce((sum, count) => sum + count, 0);
    const processed = {};
    
    Object.entries(emotionDist).forEach(([emotion, count]) => {
      processed[emotion] = Math.round((count / total) * 100);
    });
    
    return processed;
  };

  // Helper function to generate activities from insights
  const generateActivitiesFromInsights = (insights, overview) => {
    if (!insights || insights.length === 0) {
      return [
        { name: 'Emotion Tracking', completed: overview.totalRecords || 0, total: 30, streak: 0 },
        { name: 'Mood Analysis', completed: Math.round((overview.averageMoodScore || 0) / 10), total: 10, streak: 0 }
      ];
    }
    
    return [
      { name: 'Daily Mood Tracking', completed: overview.totalRecords || 0, total: 30, streak: 0 },
      { name: 'Mindfulness Sessions', completed: Math.round((overview.averageMoodScore || 0) / 10), total: 20, streak: 0 },
      { name: 'Emotion Analysis', completed: insights.length, total: 25, streak: 0 },
      { name: 'Mood Journaling', completed: Math.round((overview.totalRecords || 0) / 2), total: 15, streak: 0 }
    ];
  };

  const getMoodColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMoodEmoji = (score) => {
    if (score >= 80) return '😊';
    if (score >= 60) return '😐';
    if (score >= 40) return '😔';
    return '😢';
  };

  const getProgressPercentage = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

  const getStreakColor = (streak) => {
    if (streak >= 7) return 'text-green-600 bg-green-100';
    if (streak >= 5) return 'text-blue-600 bg-blue-100';
    if (streak >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const renderMoodChart = (data, period) => {
    const maxValue = Math.max(...data);
    const days = period === 'week' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {period === 'week' ? 'Weekly' : 'Monthly'} Mood Chart
        </h3>
        <div className="flex items-end justify-between h-32 mb-4">
          {data.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative">
                <div 
                  className={`w-8 rounded-t-lg transition-all duration-300 ${
                    value >= 80 ? 'bg-green-500' : 
                    value >= 60 ? 'bg-yellow-500' : 
                    value >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${(value / maxValue) * 100}%` }}
                ></div>
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                  {value}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-2">{days[index]}</span>
            </div>
          ))}
        </div>
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Average: {Math.round(data.reduce((a, b) => a + b, 0) / data.length)}
          </span>
        </div>
      </div>
    );
  };

  const renderEmotionChart = () => {
    const total = Object.values(progressData.emotions).reduce((a, b) => a + b, 0);
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Distribution</h3>
        <div className="space-y-3">
          {Object.entries(progressData.emotions).map(([emotion, count]) => {
            const percentage = Math.round((count / total) * 100);
            const emoji = {
              'Happy': '😊',
              'Content': '😌',
              'Neutral': '😐',
              'Sad': '😢',
              'Anxious': '😰'
            }[emotion];

            return (
              <div key={emotion} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{emotion}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        emotion === 'Happy' ? 'bg-green-500' :
                        emotion === 'Content' ? 'bg-blue-500' :
                        emotion === 'Neutral' ? 'bg-gray-500' :
                        emotion === 'Sad' ? 'bg-blue-400' :
                        emotion === 'Anxious' ? 'bg-orange-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActivityProgress = () => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Progress</h3>
        <div className="space-y-4">
          {progressData.activities.map((activity, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{activity.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStreakColor(activity.streak)}`}>
                  🔥 {activity.streak} day streak
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {activity.completed} of {activity.total} completed
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {getProgressPercentage(activity.completed, activity.total)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(activity.completed, activity.total)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDownloadReport = () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      const reportData = {
        timestamp: new Date().toISOString(),
        period: selectedPeriod,
        data: progressData
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moodmirror-progress-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLoading(false);
    }, 2000);
  };

  const handleSyncCalendar = () => {
    setLoading(true);
    // Simulate calendar sync
    setTimeout(() => {
      alert('Calendar synced successfully! 📅');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MoodMirror</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold text-purple-600">
                📊 Progress Dashboard
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <p className="text-lg text-gray-600">
            Monitor your emotional well-being and track your mental health progress over time
          </p>
          
          {/* Data Source Indicator */}
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
            {loading ? (
              <span className="bg-blue-100 text-blue-800">
                🔄 Loading real data...
              </span>
            ) : error && error.includes('No mood scan data') ? (
              <span className="bg-orange-100 text-orange-800">
                🎯 Ready to start tracking! (Demo data shown)
              </span>
            ) : error ? (
              <span className="bg-yellow-100 text-yellow-800">
                ⚠️ Showing demo data (API unavailable)
              </span>
            ) : progressData.overview.totalRecords > 0 ? (
              <span className="bg-green-100 text-green-800">
                📸 Real data from your mood scans!
              </span>
            ) : (
              <span className="bg-green-100 text-green-800">
                ✅ Real data from your sessions
              </span>
            )}
          </div>
        </div>

        {/* Period Selector and Refresh */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-6 py-2 rounded-md transition-all ${
                selectedPeriod === 'week'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📅 This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-6 py-2 rounded-md transition-all ${
                selectedPeriod === 'month'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 This Month
            </button>
          </div>
          
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 border rounded-lg ${
            error.includes('No mood scan data') 
              ? 'bg-orange-50 border-orange-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              <span className={`text-xl ${
                error.includes('No mood scan data') ? 'text-orange-500' : 'text-red-500'
              }`}>
                {error.includes('No mood scan data') ? '🎯' : '⚠️'}
              </span>
              <div>
                <p className={`text-sm ${
                  error.includes('No mood scan data') ? 'text-orange-700' : 'text-red-600'
                }`}>
                  {error}
                </p>
                {error.includes('No mood scan data') && (
                  <div className="mt-3">
                    <p className="text-orange-600 text-sm mb-2">
                      Click "New Mood Scan" below to start tracking your emotions!
                    </p>
                    <Link 
                      to="/scan" 
                      className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      📸 New Mood Scan
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-600 text-sm">Loading real progress data...</p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">😊</div>
            <div className="text-2xl font-bold text-gray-900">
              {progressData.overview.averageMoodScore || 
               (progressData.weeklyMood.length > 0 ? 
                Math.round(progressData.weeklyMood.reduce((a, b) => a + b, 0) / progressData.weeklyMood.length) : 0)}
            </div>
            <div className="text-sm text-gray-600">Mood Score</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-gray-900">
              {progressData.activities.length > 0 ? 
               Math.max(...progressData.activities.map(a => a.streak || 0)) : 0}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📸</div>
            <div className="text-2xl font-bold text-gray-900">
              {progressData.overview.totalRecords || 
               (progressData.activities.length > 0 ? 
                progressData.activities.reduce((sum, a) => sum + (a.completed || 0), 0) : 0)}
            </div>
            <div className="text-sm text-gray-600">Mood Scans</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-gray-900">
              {progressData.activities.length > 0 ? 
               Math.round(progressData.activities.reduce((sum, a) => sum + getProgressPercentage(a.completed || 0, a.total || 1), 0) / progressData.activities.length) : 0}%
            </div>
            <div className="text-sm text-gray-600">Consistency</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {renderMoodChart(
            selectedPeriod === 'week' ? progressData.weeklyMood : progressData.monthlyMood,
            selectedPeriod
          )}
          {renderEmotionChart()}
        </div>

        {/* Activity Progress */}
        <div className="mb-8">
          {renderActivityProgress()}
        </div>

        {/* Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressData.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-600 text-lg">💡</span>
                <span className="text-sm text-gray-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={handleSyncCalendar}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">📅</span>
            <span>Set Reminders</span>
          </button>
          
          <button
            onClick={handleDownloadReport}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">📊</span>
            <span>Export Data</span>
          </button>
          
          <Link
            to="/scan"
            className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-colors"
          >
            <span className="text-xl">📸</span>
            <span>New Mood Scan</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Processing...</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Your mental health journey is automatically tracked and updated</p>
          <p className="mt-1">Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;