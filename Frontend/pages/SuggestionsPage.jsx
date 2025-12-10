import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SuggestionsPage = () => {
  const [currentMood, setCurrentMood] = useState('Neutral');
  const [moodScore, setMoodScore] = useState(50);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Sample suggestions based on mood
  const moodSuggestions = {
    Happy: {
      activities: [
        'Continue your positive activities',
        'Share your joy with friends and family',
        'Try something new and exciting',
        'Practice gratitude journaling'
      ],
      music: [
        { name: 'Happy - Pharrell Williams', link: 'https://www.youtube.com/watch?v=y6Sxv-sUYtM' },
        { name: 'Good Life - OneRepublic', link: 'https://www.youtube.com/watch?v=c3LFeLJ9B2k' },
        { name: 'Walking on Sunshine - Katrina & The Waves', link: 'https://www.youtube.com/watch?v=iPUmE-tne5U' },
        { name: 'I Gotta Feeling - Black Eyed Peas', link: 'https://www.youtube.com/watch?v=uSD4vsh1zBA' }
      ],
      videos: [
        { name: 'Comedy Central Stand-Up', link: 'https://www.youtube.com/c/ComedyCentral' },
        { name: 'TED Talks - Happiness', link: 'https://www.ted.com/topics/happiness' },
        { name: 'Travel Vlogs - Fun Adventures', link: 'https://www.youtube.com/results?search_query=travel+vlog+fun' },
        { name: 'Positive News Stories', link: 'https://www.goodnewsnetwork.org/' }
      ],
      content: [
        'Read motivational books',
        'Write about your achievements',
        'Plan future goals',
        'Learn a new skill'
      ]
    },
    Content: {
      activities: [
        'Build on your current positive state',
        'Try something new and exciting',
        'Practice gratitude and mindfulness',
        'Connect with loved ones'
      ],
      music: [
        { name: 'Better Place - Rachel Platten', link: 'https://www.youtube.com/watch?v=0KSOMA3QBU0' },
        { name: 'Brave - Sara Bareilles', link: 'https://www.youtube.com/watch?v=QUQsqBqxoR4' },
        { name: 'Roar - Katy Perry', link: 'https://www.youtube.com/watch?v=CevxZvSJLk8' },
        { name: 'Fight Song - Rachel Platten', link: 'https://www.youtube.com/watch?v=xo1VInw-SKc' }
      ],
      videos: [
        { name: 'TED Talks - Personal Growth', link: 'https://www.ted.com/topics/personal+growth' },
        { name: 'Mindfulness Meditation', link: 'https://www.youtube.com/results?search_query=mindfulness+meditation' },
        { name: 'Self-Improvement Videos', link: 'https://www.youtube.com/results?search_query=self+improvement' },
        { name: 'Positive Psychology', link: 'https://www.youtube.com/results?search_query=positive+psychology' }
      ],
      content: [
        'Read motivational books',
        'Write about your achievements',
        'Plan future goals',
        'Learn a new skill'
      ]
    },
    Sad: {
      activities: [
        'Take a gentle walk in nature',
        'Practice deep breathing exercises',
        'Talk to a trusted friend',
        'Write down your feelings'
      ],
      music: [
        { name: 'Fix You - Coldplay', link: 'https://www.youtube.com/watch?v=k4V3MoEV9X4' },
        { name: 'The Scientist - Coldplay', link: 'https://www.youtube.com/watch?v=RB-RcX5DS5A' },
        { name: 'Mad World - Gary Jules', link: 'https://www.youtube.com/watch?v=4N3N1MlvVc4' },
        { name: 'Hallelujah - Jeff Buckley', link: 'https://www.youtube.com/watch?v=y8AWFf7EAc4' }
      ],
      videos: [
        { name: 'Nature Sounds & Scenes', link: 'https://www.youtube.com/results?search_query=nature+sounds+relaxing' },
        { name: 'ASMR Relaxation', link: 'https://www.youtube.com/results?search_query=asmr+relaxation' },
        { name: 'Gentle Yoga for Beginners', link: 'https://www.youtube.com/results?search_query=gentle+yoga+for+beginners' },
        { name: 'Heartwarming Stories', link: 'https://www.youtube.com/results?search_query=heartwarming+stories' }
      ],
      content: [
        'Read comforting books',
        'Practice self-compassion',
        'Try meditation apps',
        'Seek professional support if needed'
      ]
    },
    'Very Low': {
      activities: [
        'Practice self-care basics',
        'Reach out to support network',
        'Seek professional help',
        'Take small steps forward'
      ],
      music: [
        { name: 'Weightless - Marconi Union', link: 'https://www.youtube.com/watch?v=UfcAVejslrU' },
        { name: 'Claire de Lune - Debussy', link: 'https://www.youtube.com/watch?v=CvFH_6DNRCY' },
        { name: 'River Flows in You - Yiruma', link: 'https://www.youtube.com/watch?v=7maJOI3QMu0' },
        { name: 'Meditation Music - Zen', link: 'https://www.youtube.com/results?search_query=zen+meditation+music' }
      ],
      videos: [
        { name: 'Relaxing Nature Videos', link: 'https://www.youtube.com/results?search_query=relaxing+nature+videos' },
        { name: 'Breathing Exercises', link: 'https://www.youtube.com/results?search_query=breathing+exercises+anxiety' },
        { name: 'Soothing ASMR', link: 'https://www.youtube.com/results?search_query=soothing+asmr' },
        { name: 'Positive Affirmations', link: 'https://www.youtube.com/results?search_query=positive+affirmations' }
      ],
      content: [
        'Read about mental health',
        'Practice positive self-talk',
        'Learn coping strategies',
        'Consider professional help'
      ]
    },
    Angry: {
      activities: [
        'Practice deep breathing',
        'Go for a vigorous walk',
        'Write down your feelings',
        'Use stress balls or fidget toys'
      ],
      music: [
        { name: 'Break Stuff - Limp Bizkit', link: 'https://www.youtube.com/watch?v=9HZ5jdBnOig' },
        { name: 'Killing in the Name - Rage Against the Machine', link: 'https://www.youtube.com/watch?v=bWXazVhlyxQ' },
        { name: 'Given Up - Linkin Park', link: 'https://www.youtube.com/watch?v=1VQ_3sBZEm0' },
        { name: 'High Energy Workout Music', link: 'https://www.youtube.com/results?search_query=high+energy+workout+music' }
      ],
      videos: [
        { name: 'Intense Workout Videos', link: 'https://www.youtube.com/results?search_query=intense+workout+videos' },
        { name: 'Action Movie Trailers', link: 'https://www.youtube.com/results?search_query=action+movie+trailers' },
        { name: 'Competitive Sports', link: 'https://www.youtube.com/results?search_query=competitive+sports+highlights' },
        { name: 'Motivational Speeches', link: 'https://www.youtube.com/results?search_query=motivational+speeches' }
      ],
      content: [
        'Read about anger management',
        'Practice mindfulness',
        'Learn conflict resolution',
        'Consider therapy techniques'
      ]
    },
    Fear: {
      activities: [
        'Practice grounding techniques',
        'Progressive muscle relaxation',
        'Talk to someone you trust',
        'Write down your fears'
      ],
      music: [
        { name: 'Weightless - Marconi Union', link: 'https://www.youtube.com/watch?v=UfcAVejslrU' },
        { name: 'Claire de Lune - Debussy', link: 'https://www.youtube.com/watch?v=CvFH_6DNRCY' },
        { name: 'River Flows in You - Yiruma', link: 'https://www.youtube.com/watch?v=7maJOI3QMu0' },
        { name: 'Calming Nature Sounds', link: 'https://www.youtube.com/results?search_query=calming+nature+sounds' }
      ],
      videos: [
        { name: 'Grounding Techniques', link: 'https://www.youtube.com/results?search_query=grounding+techniques+anxiety' },
        { name: 'Progressive Muscle Relaxation', link: 'https://www.youtube.com/results?search_query=progressive+muscle+relaxation' },
        { name: 'Gentle Breathing Exercises', link: 'https://www.youtube.com/results?search_query=gentle+breathing+exercises' },
        { name: 'Positive Affirmations', link: 'https://www.youtube.com/results?search_query=positive+affirmations+anxiety' }
      ],
      content: [
        'Read about anxiety management',
        'Practice positive self-talk',
        'Learn about your fears',
        'Consider professional help'
      ]
    },
    Neutral: {
      activities: [
        'Try something new',
        'Set small goals',
        'Connect with friends',
        'Explore your interests'
      ],
      music: [
        { name: 'Discover New Music', link: 'https://www.youtube.com/results?search_query=new+music+discovery' },
        { name: 'Variety Playlist', link: 'https://www.youtube.com/results?search_query=variety+music+playlist' },
        { name: 'Podcast Recommendations', link: 'https://www.youtube.com/results?search_query=best+podcasts' },
        { name: 'Chill Music Mix', link: 'https://www.youtube.com/results?search_query=chill+music+mix' }
      ],
      videos: [
        { name: 'Educational Content', link: 'https://www.youtube.com/results?search_query=educational+content' },
        { name: 'Documentaries', link: 'https://www.youtube.com/results?search_query=documentaries' },
        { name: 'Tutorial Videos', link: 'https://www.youtube.com/results?search_query=tutorial+videos' },
        { name: 'Entertainment Shows', link: 'https://www.youtube.com/results?search_query=entertainment+shows' }
      ],
      content: [
        'Read diverse books',
        'Learn new skills',
        'Explore hobbies',
        'Set personal goals'
      ]
    }
  };

  // Function to get mood from scan data
  const getMoodFromScanData = () => {
    try {
      // Check localStorage for recent scan data
      const scanData = localStorage.getItem('lastEmotionScan');
      if (scanData) {
        const parsedData = JSON.parse(scanData);
        const now = new Date();
        const scanTime = new Date(parsedData.timestamp);
        const timeDiff = now - scanTime;
        
        // Use scan data if it's less than 24 hours old
        if (timeDiff < 24 * 60 * 60 * 1000) {
          return {
            mood: parsedData.mood,
            score: parsedData.score,
            timestamp: parsedData.timestamp
          };
        }
      }
      
      // Check for analysis result in localStorage
      const analysisResult = localStorage.getItem('lastAnalysisResult');
      if (analysisResult) {
        const parsed = JSON.parse(analysisResult);
        if (parsed.analysis?.overall) {
          return {
            mood: parsed.analysis.overall.overallMood,
            score: parsed.analysis.overall.moodScore,
            timestamp: new Date().toISOString()
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error reading scan data:', error);
      return null;
    }
  };

  // Function to get captured image from localStorage
  const getCapturedImage = () => {
    try {
      const imageData = localStorage.getItem('capturedImage');
      if (imageData) {
        return imageData;
      }
      return null;
    } catch (error) {
      console.error('Error reading image data:', error);
      return null;
    }
  };

  // Function to determine mood category from score
  const getMoodCategory = (score) => {
    if (score >= 80) return 'Happy';
    if (score >= 60) return 'Content';
    if (score >= 40) return 'Neutral';
    if (score >= 20) return 'Sad';
    return 'Very Low';
  };

  useEffect(() => {
    // Get current mood from scan data
    const scanMoodData = getMoodFromScanData();
    
    if (scanMoodData) {
      // Use scanned mood data
      const moodCategory = getMoodCategory(scanMoodData.score);
      setCurrentMood(moodCategory);
      setMoodScore(scanMoodData.score);
      setLastScanTime(scanMoodData.timestamp);
      
      // Set suggestions based on scanned mood
      const moodKey = moodCategory;
      setSuggestions(moodSuggestions[moodKey] || moodSuggestions.Neutral);
    } else {
      // Fallback to default mood
      setCurrentMood('Neutral');
      setMoodScore(50);
      setSuggestions(moodSuggestions.Neutral);
    }

    // Get captured image
    const image = getCapturedImage();
    if (image) {
      setCapturedImage(image);
    }

    // Listen for storage changes to sync mood data in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'lastEmotionScan' || e.key === 'lastAnalysisResult') {
        const newScanData = getMoodFromScanData();
        if (newScanData) {
          const moodCategory = getMoodCategory(newScanData.score);
          setCurrentMood(moodCategory);
          setMoodScore(newScanData.score);
          setLastScanTime(newScanData.timestamp);
          
          const moodKey = moodCategory;
          setSuggestions(moodSuggestions[moodKey] || moodSuggestions.Neutral);
        }
      }
      
      // Check for new captured image
      if (e.key === 'capturedImage') {
        const newImage = getCapturedImage();
        if (newImage) {
          setCapturedImage(newImage);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleRefreshSuggestions = () => {
    setLoading(true);
    setTimeout(() => {
      // Get fresh scan data
      const scanMoodData = getMoodFromScanData();
      
      if (scanMoodData) {
        const moodCategory = getMoodCategory(scanMoodData.score);
        setCurrentMood(moodCategory);
        setMoodScore(scanMoodData.score);
        setLastScanTime(scanMoodData.timestamp);
        
        const moodKey = moodCategory;
        setSuggestions(moodSuggestions[moodKey] || moodSuggestions.Neutral);
      } else {
        // If no scan data, prompt user to scan
        setCurrentMood('No Scan Data');
        setMoodScore(0);
        setSuggestions(moodSuggestions.Neutral);
      }
      setLoading(false);
    }, 1000);
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      Happy: '😊',
      Content: '😌',
      Sad: '😢',
      'Very Low': '😔',
      Angry: '😠',
      Fear: '😨',
      Neutral: '😐'
    };
    return emojis[mood] || '😐';
  };

  const getMoodColor = (mood) => {
    const colors = {
      Happy: 'text-green-600',
      Content: 'text-green-500',
      Sad: 'text-blue-600',
      'Very Low': 'text-blue-800',
      Angry: 'text-red-600',
      Fear: 'text-purple-600',
      Neutral: 'text-gray-600'
    };
    return colors[mood] || 'text-gray-600';
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
              <div className="text-center">
                <span className={`text-lg font-semibold ${getMoodColor(currentMood)}`}>
                  Current Mood: {getMoodEmoji(currentMood)} {currentMood}
                </span>
                {moodScore > 0 && (
                  <div className="text-sm text-gray-600">
                    Score: {moodScore}/100
                  </div>
                )}
                {lastScanTime && (
                  <div className="text-xs text-gray-500">
                    Last scan: {new Date(lastScanTime).toLocaleString()}
                  </div>
                )}
              </div>
              <button
                onClick={handleRefreshSuggestions}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Personalized Recommendations for You
          </h2>
          <p className="text-lg text-gray-600">
            Based on your current mood: <span className={`font-semibold ${getMoodColor(currentMood)}`}>
              {currentMood}
            </span>
          </p>
          
          {/* Mood Data Status */}
          <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium">
            {currentMood === 'No Scan Data' ? (
              <span className="bg-yellow-100 text-yellow-800">
                ⚠️ No recent scan data - Please scan your mood first
              </span>
            ) : lastScanTime ? (
              <span className="bg-green-100 text-green-800">
                ✅ Using real scan data from {new Date(lastScanTime).toLocaleDateString()}
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-800">
                🔄 Loading mood data...
              </span>
            )}
          </div>
        </div>

        {/* Captured Image Display */}
        {capturedImage && (
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📸 Your Mood Photo</h3>
            <div className="inline-block bg-white rounded-lg shadow-lg p-4">
              <img 
                src={capturedImage} 
                alt="Your mood photo" 
                className="w-48 h-48 object-cover rounded-lg border-4 border-purple-200"
              />
              <p className="text-sm text-gray-600 mt-2">Photo captured on {lastScanTime ? new Date(lastScanTime).toLocaleString() : 'recently'}</p>
            </div>
          </div>
        )}

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
            </div>
            <ul className="space-y-2">
              {suggestions.activities?.map((activity, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>

          {/* Music */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl">🎵</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Music</h3>
            </div>
            <ul className="space-y-2">
              {suggestions.music?.map((music, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {typeof music === 'string' ? (
                    music
                  ) : (
                    <a 
                      href={music.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {music.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                🎧 Listen Now
              </button>
            </div>
          </div>

          {/* Videos */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-red-600 text-xl">📺</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Videos</h3>
            </div>
            <ul className="space-y-2">
              {suggestions.videos?.map((video, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {typeof video === 'string' ? (
                    video
                  ) : (
                    <a 
                      href={video.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 underline"
                    >
                      {video.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                ▶️ Watch Now
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 text-xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Content</h3>
            </div>
            <ul className="space-y-2">
              {suggestions.content?.map((content, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  {content}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                📖 Read More
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mood Tracker */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Track Your Mood</h3>
            <div className="space-y-3">
              {['Happy', 'Content', 'Neutral', 'Sad', 'Very Low', 'Angry', 'Fear'].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setCurrentMood(mood)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    currentMood === mood
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg mr-2">{getMoodEmoji(mood)}</span>
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/scan"
                className="block w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-center hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                📸 New Emotion Scan
              </Link>
              <Link
                to="/progress"
                className="block w-full p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-center hover:from-blue-600 hover:to-cyan-600 transition-all"
              >
                📊 View Progress
              </Link>
              <Link
                to="/account"
                className="block w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-center hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                👤 Account Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            These suggestions are personalized based on your current mood and preferences.
            <br />
            Remember, it's okay to not be okay. Reach out for help when you need it.
          </p>
          <div className="mt-4 space-x-4">
            <span className="text-purple-600 font-medium">24/7 Crisis Helpline: 1-800-273-8255</span>
            <span className="text-blue-600 font-medium">Emergency: 911</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;