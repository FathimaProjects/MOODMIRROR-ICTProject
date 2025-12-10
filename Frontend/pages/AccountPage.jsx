import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI, formatDate, formatDateTime, calculateAccountAge } from '../services/api.js';

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    profile: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      location: '',
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      joinDate: '',
      lastActive: ''
    },
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profilePublic: false,
        shareProgress: true,
        allowResearch: false
      },
      language: 'English',
      timezone: 'Asia/Colombo'
    },
    stats: {
      totalScans: 0,
      averageMood: 0,
      streakDays: 0,
      totalActivities: 0,
      favoriteEmotion: 'Not set',
      improvement: '0%'
    },
    achievements: [],
    emergencyContacts: []
  });

  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState({});

  // Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const profileResponse = await profileAPI.getProfile();
      if (profileResponse.success) {
        const user = profileResponse.data.user;
        
        setUserData(prev => ({
          ...prev,
          profile: {
            username: user.username || '',
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            dateOfBirth: user.dateOfBirth || '',
            gender: user.gender || 'Prefer not to say',
            phone: user.phone || '',
            location: user.location || '',
            bio: user.bio || '',
            avatar: user.profilePicture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            joinDate: user.createdAt || '',
            lastActive: user.lastLogin || user.createdAt || ''
          },
          preferences: {
            ...prev.preferences,
            theme: user.preferences?.theme || 'light',
            language: user.language === 'si' ? 'Sinhala' : user.language === 'ta' ? 'Tamil' : 'English',
            timezone: user.timezone || 'Asia/Colombo'
          }
        }));
      }
      
      // Get profile statistics
      const statsResponse = await profileAPI.getProfileStats();
      if (statsResponse.success) {
        const stats = statsResponse.data;
        setUserData(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            profileCompletion: stats.profileCompletion || 0,
            accountAge: stats.accountAge || 0,
            daysSinceLastLogin: stats.daysSinceLastLogin || 0
          }
        }));
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If backend is not available, show demo data
      setUserData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          username: 'demo_user',
          email: 'demo@moodmirror.com',
          firstName: 'Demo',
          lastName: 'User',
          bio: 'Mental health advocate and wellness enthusiast. Love meditation, yoga, and helping others on their mental health journey.',
          location: 'Colombo, Sri Lanka',
          joinDate: '2024-01-15',
          lastActive: '2024-01-20'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    setTempProfile({ ...userData.profile });
  }, [userData.profile]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Simulate logout process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update profile using real API
      const response = await profileAPI.updateProfile(tempProfile);
      
      if (response.success) {
        // Refresh user data
        await fetchUserData();
        setEditMode(false);
        alert('Profile updated successfully! ✅');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTempProfile({ ...userData.profile });
    setEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img 
                src={userData.profile.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
              />
              <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                📷
              </button>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {userData.profile.firstName || 'Demo'} {userData.profile.lastName || 'User'}
              </h3>
              <p className="text-gray-600">@{userData.profile.username || 'demo_user'}</p>
              <p className="text-gray-500 text-sm">
                Member since {userData.profile.joinDate ? formatDate(userData.profile.joinDate) : 'Not set'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">
                  Last active: {userData.profile.lastActive ? formatDate(userData.profile.lastActive) : 'Not set'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {editMode ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              value={editMode ? tempProfile.firstName : userData.profile.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              value={editMode ? tempProfile.lastName : userData.profile.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={editMode ? tempProfile.email : userData.profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={editMode ? tempProfile.phone : userData.profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={editMode ? tempProfile.dateOfBirth : userData.profile.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={editMode ? tempProfile.gender : userData.profile.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              disabled={!editMode}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={editMode ? tempProfile.bio : userData.profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!editMode}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>
        </div>
        
        {editMode && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Stats & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userData.stats.totalScans}</div>
              <div className="text-sm text-gray-600">Total Scans</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userData.stats.averageMood}</div>
              <div className="text-sm text-gray-600">Avg Mood</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userData.stats.streakDays}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{userData.stats.improvement}</div>
              <div className="text-sm text-gray-600">Improvement</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h4>
          <div className="space-y-3">
            {userData.achievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                </div>
                <div className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Preferences */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Email Notifications</div>
              <div className="text-sm text-gray-600">Receive updates via email</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Push Notifications</div>
              <div className="text-sm text-gray-600">Receive push notifications</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">SMS Notifications</div>
              <div className="text-sm text-gray-600">Receive SMS alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Public Profile</div>
              <div className="text-sm text-gray-600">Allow others to see your profile</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Share Progress</div>
              <div className="text-sm text-gray-600">Share your progress with friends</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderEmergencyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contacts</h4>
        <div className="space-y-4">
          {userData.emergencyContacts.map((contact, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-sm text-gray-600">{contact.relationship}</div>
                  <div className="text-sm text-gray-500">{contact.phone}</div>
                  {contact.email && <div className="text-sm text-gray-500">{contact.email}</div>}
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    📞
                  </button>
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    ✉️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          + Add New Contact
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-red-800 mb-2">🚨 Crisis Resources</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-red-700">National Suicide Prevention Lifeline</span>
            <span className="font-bold text-red-800">1-800-273-8255</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-700">Crisis Text Line</span>
            <span className="font-bold text-red-800">Text HOME to 741741</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-700">Emergency Services</span>
            <span className="font-bold text-red-800">911</span>
          </div>
        </div>
        <p className="text-sm text-red-600 mt-3">
          If you're experiencing a mental health crisis, please reach out to these resources immediately.
        </p>
      </div>
    </div>
  );

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
                👤 Account Settings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Settings</h2>
          <p className="text-lg text-gray-600">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ⚙️ Settings
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'emergency'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🚨 Emergency
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'emergency' && renderEmergencyTab()}
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Sign Out</h4>
              <p className="text-gray-600">Sign out of your account on this device</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing Out...' : '🚪 Sign Out'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>Need help? Contact our support team at support@moodmirror.com</p>
          <p className="mt-1">MoodMirror v1.0.0 - Mental Health Companion</p>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;