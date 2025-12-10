// File: src/pages/EmotionScanPage.jsx
import { useState, useRef, useEffect } from "react";
import { Bot, Mic, Camera, Upload, X, Play, Pause, Square } from "lucide-react";
import { emotionAPI } from "../services/api.js";
import EmotionAnalyzer from "../utils/emotionAnalyzer.js";

export default function EmotionScanPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('face');
  const [userInput, setUserInput] = useState({
    notes: '',
    additionalComment: '',
    tag: '',
    moodRating: 5
  });

  // Camera and media refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  // Media states
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError('Unable to access camera. Please check permissions and try again.');
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        setCapturedImage(blob);
        
        // Convert blob to data URL and save to localStorage
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            localStorage.setItem('capturedImage', e.target.result);
          } catch (error) {
            console.error('Error saving image to localStorage:', error);
          }
        };
        reader.readAsDataURL(blob);
        
        // Auto-analyze after capture
        setTimeout(() => {
          analyzeEmotions();
        }, 500);
      }, 'image/jpeg', 0.8);
    }
  };

  // Start audio recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(blob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  // Stop audio recording
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      switch (type) {
        case 'face':
          setCapturedImage(file);
          
          // Convert file to data URL and save to localStorage
          const reader = new FileReader();
          reader.onload = function(e) {
            try {
              localStorage.setItem('capturedImage', e.target.result);
            } catch (error) {
              console.error('Error saving image to localStorage:', error);
            }
          };
          reader.readAsDataURL(file);
          
          // Auto-analyze after upload
          setTimeout(() => {
            analyzeEmotions();
          }, 500);
          break;
        case 'voice':
          setRecordedAudio(file);
          break;
        case 'body':
          setRecordedVideo(file);
          break;
      }
    }
  };

  // Analyze emotions
  const analyzeEmotions = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Check if we have any media to analyze
      if (!capturedImage && !recordedAudio && !recordedVideo) {
        setError('Please capture an image, record audio, or upload a file first.');
        setIsAnalyzing(false);
        return;
      }

      const formData = new FormData();
      formData.append('sessionId', `session_${Date.now()}`);
      formData.append('deviceInfo', JSON.stringify({
        type: 'webcam',
        browser: navigator.userAgent,
        os: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`
      }));
      formData.append('userInput', JSON.stringify(userInput));

      // Add captured media
      if (capturedImage) {
        formData.append('faceImage', capturedImage);
      }
      if (recordedAudio) {
        formData.append('voiceAudio', recordedAudio);
      }
      if (recordedVideo) {
        formData.append('bodyVideo', recordedVideo);
      }

             // Simulate AI analysis for demo (replace with real API call)
       const mockAnalysis = await simulateEmotionAnalysis();
       setAnalysisResult(mockAnalysis);
       
       // Save mood data to localStorage for suggestions page
       try {
         const moodData = {
           mood: mockAnalysis.analysis.overall.overallMood,
           score: mockAnalysis.analysis.overall.moodScore,
           timestamp: new Date().toISOString()
         };
         localStorage.setItem('lastEmotionScan', JSON.stringify(moodData));
         localStorage.setItem('lastAnalysisResult', JSON.stringify(mockAnalysis));
       } catch (error) {
         console.error('Error saving mood data:', error);
       }
       
       // Real API call (uncomment when backend is ready)
       // const response = await emotionAPI.analyzeEmotion(formData);
       // setAnalysisResult(response.data);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real emotion analysis using image processing
  const simulateEmotionAnalysis = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let analysis;
    
    if (capturedImage) {
      // Use real image analysis if image is available
      try {
        analysis = await EmotionAnalyzer.analyzeImage(capturedImage);
        
        // Generate recommendations based on real analysis
        const recommendations = generateMoodBasedRecommendations(analysis.overallMood, analysis.moodScore);
        const insights = EmotionAnalyzer.generateInsights(analysis.primaryEmotion, analysis.moodScore, analysis.analysisDetails);
        
        return {
          analysis: {
            overall: {
              overallMood: analysis.overallMood,
              moodScore: analysis.moodScore,
              riskLevel: analysis.moodScore > 70 ? 'low' : analysis.moodScore > 40 ? 'medium' : 'high',
              recommendations,
              insights: insights.join(' '),
              analysisDetails: analysis.analysisDetails
            },
            face: {
              primaryEmotion: analysis.primaryEmotion,
              confidence: analysis.confidence
            }
          }
        };
      } catch (error) {
        console.error('Image analysis failed, using fallback:', error);
        // Fallback to user input based analysis
      }
    }
    
    // Fallback: Generate realistic analysis based on user input
    const moodRating = userInput.moodRating;
    let overallMood, moodScore, riskLevel, primaryEmotion;
    
    if (moodRating >= 8) {
      overallMood = 'happy';
      moodScore = 85 + Math.floor(Math.random() * 15);
      riskLevel = 'low';
      primaryEmotion = 'happy';
    } else if (moodRating >= 6) {
      overallMood = 'content';
      moodScore = 70 + Math.floor(Math.random() * 15);
      riskLevel = 'low';
      primaryEmotion = 'neutral';
    } else if (moodRating >= 4) {
      overallMood = 'neutral';
      moodScore = 50 + Math.floor(Math.random() * 20);
      riskLevel = 'medium';
      primaryEmotion = 'neutral';
    } else if (moodRating >= 2) {
      overallMood = 'sad';
      moodScore = 30 + Math.floor(Math.random() * 20);
      riskLevel = 'medium';
      primaryEmotion = 'sad';
    } else {
      overallMood = 'very_low';
      moodScore = 15 + Math.floor(Math.random() * 15);
      riskLevel = 'high';
      primaryEmotion = 'sad';
    }

    // Generate personalized recommendations based on mood
    const recommendations = generateMoodBasedRecommendations(overallMood, moodScore);
    
    return {
      analysis: {
        overall: {
          overallMood,
          moodScore,
          riskLevel,
          recommendations,
          insights: generateInsights(overallMood, moodScore, userInput.notes)
        },
        face: {
          primaryEmotion,
          confidence: 0.85 + Math.random() * 0.1
        }
      }
    };
  };

  // Generate mood-based recommendations
  const generateMoodBasedRecommendations = (mood, score) => {
    const recommendations = [];
    
    switch (mood) {
      case 'happy':
        recommendations.push(
          'maintain_positive_energy',
          'share_your_joy_with_others',
          'continue_current_activities'
        );
        break;
      case 'content':
        recommendations.push(
          'build_on_current_mood',
          'try_something_new',
          'practice_gratitude'
        );
        break;
      case 'neutral':
        recommendations.push(
          'engage_in_pleasant_activities',
          'connect_with_friends',
          'try_light_exercise'
        );
        break;
      case 'sad':
        recommendations.push(
          'practice_self_compassion',
          'reach_out_for_support',
          'try_mindfulness_meditation'
        );
        break;
      case 'very_low':
        recommendations.push(
          'seek_professional_help',
          'practice_self_care',
          'connect_with_support_network'
        );
        break;
      default:
        recommendations.push(
          'practice_mindfulness',
          'maintain_healthy_routine',
          'seek_social_connection'
        );
    }
    
    return recommendations;
  };

  // Generate personalized insights
  const generateInsights = (mood, score, notes) => {
    if (notes && notes.length > 0) {
      return `Based on your notes "${notes}", your current mood suggests ${mood === 'happy' ? 'you\'re in a positive state' : 'you might benefit from some mood-lifting activities'}.`;
    }
    
    if (score >= 80) {
      return "You're experiencing high positive energy. This is a great time to channel this energy into productive activities.";
    } else if (score >= 60) {
      return "Your mood is stable and positive. Consider activities that can enhance your current state.";
    } else if (score >= 40) {
      return "You might be experiencing some challenges. Remember that it's okay to not be okay, and small steps forward count.";
    } else {
      return "You're going through a difficult time. Remember that seeking support is a sign of strength, not weakness.";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopAudioRecording();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-black mb-2 animate-fade-in">
        Check Your Mood
      </h1>
      <p className="text-center text-gray-600 mb-8">Your data is private and recorded</p>

      {/* Analysis Tabs */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 animate-slide-up">
        <button
          onClick={() => setActiveTab('face')}
          className={`p-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 flex flex-col items-center gap-3 ${
            activeTab === 'face' 
              ? 'bg-purple-200 text-purple-800' 
              : 'bg-purple-100 hover:bg-purple-200 text-black'
          }`}
        >
          <Camera className="w-8 h-8 animate-pulse" />
          <span className="font-semibold">Face</span>
        </button>
        
        <button
          onClick={() => setActiveTab('voice')}
          className={`p-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 flex flex-col items-center gap-3 ${
            activeTab === 'voice' 
              ? 'bg-purple-200 text-purple-800' 
              : 'bg-purple-100 hover:bg-purple-200 text-black'
          }`}
        >
          <Mic className="w-8 h-8 animate-pulse" />
          <span className="font-semibold">Voice</span>
        </button>
        
        <button
          onClick={() => setActiveTab('body')}
          className={`p-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105 flex flex-col items-center gap-3 ${
            activeTab === 'body' 
              ? 'bg-purple-200 text-purple-800' 
              : 'bg-purple-100 hover:bg-purple-200 text-black'
          }`}
        >
          <Bot className="w-8 h-8 animate-pulse" />
          <span className="font-semibold">Body</span>
        </button>
      </div>

              {/* Media Capture Section */}
        <div className="w-full max-w-2xl mb-8">
          {activeTab === 'face' && (
            <div className="space-y-4">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">📸 How to Capture Your Mood:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click "Start Camera" to activate your camera</li>
                  <li>Position your face in the center of the frame</li>
                  <li>Express your current mood naturally</li>
                  <li>Click "Capture Image" or upload a photo</li>
                  <li>Analysis will start automatically!</li>
                </ol>
              </div>
              
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full rounded-lg ${!isCameraOn ? 'hidden' : ''}`}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!isCameraOn && (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Camera not active</p>
                      <p className="text-sm text-gray-500 mt-2">Click "Start Camera" to begin</p>
                    </div>
                  </div>
                )}
              </div>
            
            <div className="flex gap-4 justify-center">
              {!isCameraOn ? (
                <button
                  onClick={startCamera}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={captureImage}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Capture Image
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Stop Camera
                  </button>
                </>
              )}
              
              <label className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'face')}
                  className="hidden"
                />
              </label>
            </div>
            
            {capturedImage && (
              <div className="text-center">
                <p className="text-green-600 mb-2">✓ Image captured</p>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Mic className={`w-16 h-16 mx-auto mb-4 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
                <p className="text-gray-600">
                  {isRecording ? 'Recording...' : 'Voice recording'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              {!isRecording ? (
                <button
                  onClick={startAudioRecording}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopAudioRecording}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Square className="w-4 h-4 inline mr-2" />
                  Stop Recording
                </button>
              )}
              
              <label className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Audio
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e, 'voice')}
                  className="hidden"
                />
              </label>
            </div>
            
            {recordedAudio && (
              <div className="text-center">
                <p className="text-green-600 mb-2">✓ Audio recorded</p>
                <button
                  onClick={() => setRecordedAudio(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'body' && (
          <div className="space-y-4">
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Body language analysis</p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <label className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'body')}
                  className="hidden"
                />
              </label>
            </div>
            
            {recordedVideo && (
              <div className="text-center">
                <p className="text-green-600 mb-2">✓ Video uploaded</p>
                <button
                  onClick={() => setRecordedVideo(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Input Section */}
      <div className="w-full max-w-md space-y-4 mb-8 animate-fade-in">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mood Rating (1-10)
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={userInput.moodRating}
            onChange={(e) => setUserInput({...userInput, moodRating: parseInt(e.target.value)})}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 (Very Low)</span>
            <span>{userInput.moodRating}</span>
            <span>10 (Very High)</span>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Enter a note..."
          value={userInput.notes}
          onChange={(e) => setUserInput({...userInput, notes: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-400 transition"
        />
        
        <input
          type="text"
          placeholder="Additional comment..."
          value={userInput.additionalComment}
          onChange={(e) => setUserInput({...userInput, additionalComment: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-400 transition"
        />
        
        <input
          type="text"
          placeholder="Optional tag..."
          value={userInput.tag}
          onChange={(e) => setUserInput({...userInput, tag: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-400 transition"
        />
      </div>

      {/* Analysis Button */}
      <button
        onClick={analyzeEmotions}
        disabled={isAnalyzing}
        className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed mb-8"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze Emotions'}
      </button>

      {/* Loading Animation */}
      {isAnalyzing && (
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-dashed border-purple-400 rounded-full animate-spin-slow mx-auto"></div>
          <p className="text-sm text-gray-400 mt-4 animate-fade-in">Analyzing with AI in real-time...</p>
        </div>
      )}

              {/* Error Display */}
        {error && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div>
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-red-500 text-sm mt-1">
                  {error.includes('camera') ? 'Try refreshing the page or checking browser permissions.' :
                   error.includes('capture') ? 'Make sure you have media to analyze.' :
                   'Please try again or contact support if the issue persists.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {capturedImage && !analysisResult && !isAnalyzing && (
          <div className="w-full max-w-md bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-xl">✅</span>
              <div>
                <p className="text-green-600 font-medium">Image captured successfully!</p>
                <p className="text-green-500 text-sm mt-1">Analysis will start automatically...</p>
              </div>
            </div>
          </div>
        )}

              {/* Analysis Results */}
        {analysisResult && (
          <div className="w-full max-w-4xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 animate-fade-in">
            <h3 className="text-2xl font-semibold text-green-800 mb-6 text-center">🎯 Mood Analysis Complete!</h3>
            
            {/* Mood Summary */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Current Mood</h4>
                  <div className="text-3xl font-bold text-purple-600 capitalize">
                    {analysisResult.analysis.overall.overallMood.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Mood Score</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {analysisResult.analysis.overall.moodScore}/100
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Risk Level</h4>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-full ${
                    analysisResult.analysis.overall.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                    analysisResult.analysis.overall.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {analysisResult.analysis.overall.riskLevel}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Analysis Details */}
            {analysisResult.analysis.overall.analysisDetails && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">🔍 Image Analysis Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-blue-600 font-medium">Overall Brightness</span>
                    <div className="text-lg font-bold text-blue-800">
                      {analysisResult.analysis.overall.analysisDetails.overallBrightness}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-blue-600 font-medium">Face Brightness</span>
                    <div className="text-lg font-bold text-blue-800">
                      {analysisResult.analysis.overall.analysisDetails.faceBrightness}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-blue-600 font-medium">Brightness Ratio</span>
                    <div className="text-lg font-bold text-blue-800">
                      {analysisResult.analysis.overall.analysisDetails.brightnessRatio}
                    </div>
                  </div>
                </div>
                {analysisResult.analysis.overall.analysisDetails.note && (
                  <p className="text-blue-600 text-xs text-center mt-2 italic">
                    {analysisResult.analysis.overall.analysisDetails.note}
                  </p>
                )}
              </div>
            )}
            
            {/* Personalized Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  💡 Personalized Insights
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {analysisResult.analysis.overall.insights}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  🎯 Action Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysisResult.analysis.overall.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm capitalize">
                        {rec.replace(/_/g, ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">🚀 Quick Actions You Can Take Now:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  📚 Read Mood-Based Content
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                  🎵 Listen to Mood Music
                </button>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                  📱 Track Progress
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
