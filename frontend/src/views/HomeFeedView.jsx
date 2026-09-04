import React, { useState, useEffect } from 'react';
import HoloNavbar from '../components/HoloNavbar';
import RiskSummaryKPIs from '../components/RiskSummaryKPIs';
import GisMap from '../components/GisMap';
import ZoneInspector from '../components/ZoneInspector';
import ForecastChart from '../components/ForecastChart';
import {
  Plus, Heart, MessageSquare, MapPin, ShieldCheck,
  Clock, Camera, X, Send, Navigation,
  BarChart2, Grid, Compass
} from 'lucide-react';

// MOCKED: Initial seed data for stories & social feed posts
const MOCK_STORIES = [
  {
    id: 'st_01',
    zone: 'Sohra / Cherrapunji',
    ringColor: 'pink',
    riskLevel: 'CRITICAL',
    riskScore: 89,
    authorName: 'Sohra Automatic Weather Station',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    photo: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
    summary: 'Cloudburst warning active in Sohra. Antecedent rainfall > 210mm in 24h.',
    timeAgo: '15m ago (Expires 24h)'
  },
  {
    id: 'st_02',
    zone: 'Pynursla Pass',
    ringColor: 'violet',
    riskLevel: 'HIGH',
    riskScore: 74,
    authorName: 'Pynursla Field Patrol',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    photo: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=900&q=80',
    summary: 'Debris flow reported along NH-40. Single lane traffic movement allowed.',
    timeAgo: '1h ago (Expires 24h)'
  },
  {
    id: 'st_03',
    zone: 'Mawsynram',
    ringColor: 'cyan',
    riskLevel: 'MODERATE',
    riskScore: 52,
    authorName: 'Volunteer Observer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    photo: null,
    summary: 'Continuous drizzle. Soil moisture saturation at 68%.',
    timeAgo: '3h ago (Expires 24h)'
  },
  {
    id: 'st_04',
    zone: 'Shillong Bypass',
    ringColor: 'cyan',
    riskLevel: 'MODERATE',
    riskScore: 45,
    authorName: 'Traffic Safety Squad',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    photo: null,
    summary: 'Clear road conditions. Patrol vehicles inspecting cut slopes.',
    timeAgo: '5h ago (Expires 24h)'
  },
  {
    id: 'st_05',
    zone: 'Nongpriang Valley',
    ringColor: 'pink',
    riskLevel: 'CRITICAL',
    riskScore: 92,
    authorName: 'SDMA Slope Sensor #04',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    photo: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
    summary: 'Creep displacement detected on slope sensor #04. Evacuation notice issued.',
    timeAgo: '6h ago (Expires 24h)'
  }
];

const INITIAL_POSTS = [
  {
    id: 'post_1',
    type: 'official_alert',
    riskCategory: 'CRITICAL',
    riskScore: 92,
    author: 'State Disaster Management Authority (SDMA)',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    verified: true,
    location: 'Sohra - Nongpriang Ravine',
    timestamp: '12 mins ago',
    title: '🚨 RED ALERT: High Susceptibility Landslide Triggered',
    description: 'ML model detected severe slope instability following continuous 215mm rainfall in Cherrapunji catchment. Residents along Sohra-Shella road advised to move to designated shelter camps.',
    image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
    likesCount: 48,
    commentsCount: 19,
    userLiked: false,
    comments: [
      { id: 'c1', author: 'Laban Control Room', text: 'Emergency response teams dispatched with heavy excavation gear.', time: '8m ago' },
      { id: 'c2', author: 'Banrap Kharbhih', text: 'Stay safe everyone in Sohra valley!' }
    ]
  },
  {
    id: 'post_2',
    type: 'citizen_report',
    author: 'Daphishisha K.',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    verified: false,
    location: 'Pynursla - NH-40 Cut Slope',
    timestamp: '45 mins ago',
    title: 'Rockfall & Mudslide Blocking Eastbound Lane',
    description: 'Boulders fell from the upper embankment after heavy downpour. Single-lane movement active. PWD cleared small stones, but heavy rocks remain on shoulder.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=900&q=80',
    likesCount: 29,
    commentsCount: 8,
    userLiked: true,
    comments: [
      { id: 'c3', author: 'Field Officer Mark', text: 'Informed PWD division. Backhoe loader en route.' }
    ]
  },
  {
    id: 'post_3',
    type: 'official_alert',
    riskCategory: 'HIGH',
    riskScore: 78,
    author: 'East Khasi Hills Emergency Control Center',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    verified: true,
    location: 'Mawsynram - Mawlynnong Road',
    timestamp: '2 hours ago',
    title: '⚠️ ORANGE WARNING: Saturated Slope Advisory',
    description: 'Antecedent Rainfall Index (ARI) surpassed 160mm threshold. High saturation level in soil layer. Speed limits reduced to 30km/h for heavy transport vehicles.',
    image: null,
    likesCount: 34,
    commentsCount: 4,
    userLiked: false,
    comments: []
  }
];

export const HomeFeedView = ({
  currentUser,
  onNavigate,
  summary = {},
  zones = [],
  selectedZone = null,
  setSelectedZone = () => {},
  facilities = [],
  roads = [],
  reports = [],
  alerts = [],
  onRefreshAll = () => {}
}) => {
  // Navigation tab on Home: 'overview' | 'feed' | 'analytics'
  const [homeTab, setHomeTab] = useState('overview');

  // Stories State
  const [stories, setStories] = useState(() => {
    try {
      const saved = localStorage.getItem('drishti_stories_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return MOCK_STORIES;
  });

  // Social Posts State
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('drishti_social_posts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_POSTS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'official' | 'citizen'
  const [selectedStory, setSelectedStory] = useState(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);

  // New Story Form State
  const [storyZone, setStoryZone] = useState('Sohra / Cherrapunji');
  const [storyRiskLevel, setStoryRiskLevel] = useState('HIGH');
  const [storySummary, setStorySummary] = useState('');
  const [storyPhotoPreview, setStoryPhotoPreview] = useState(null);

  // New Report Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('East Khasi Hills');
  const [newSeverity, setNewSeverity] = useState('HIGH');
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);

  const [expandedPostComments, setExpandedPostComments] = useState({});
  const [commentInputText, setCommentInputText] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem('drishti_stories_data', JSON.stringify(stories));
    } catch (e) {}
  }, [stories]);

  useEffect(() => {
    try {
      localStorage.setItem('drishti_social_posts', JSON.stringify(posts));
    } catch (e) {}
  }, [posts]);

  // Handle Story Creation
  const handleCreateStory = (e) => {
    e.preventDefault();
    if (!storySummary.trim()) return;

    const ringColors = { CRITICAL: 'pink', HIGH: 'violet', MODERATE: 'cyan', LOW: 'cyan' };
    const newStoryItem = {
      id: `st_${Date.now()}`,
      zone: storyZone,
      ringColor: ringColors[storyRiskLevel] || 'pink',
      riskLevel: storyRiskLevel,
      riskScore: storyRiskLevel === 'CRITICAL' ? 88 : storyRiskLevel === 'HIGH' ? 72 : 48,
      authorName: currentUser?.name || 'Community Responder',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      photo: storyPhotoPreview,
      summary: storySummary.trim(),
      timeAgo: 'Just now (Expires 24h)',
      isUserStory: true
    };

    setStories([newStoryItem, ...stories]);
    setIsAddStoryModalOpen(false);
    setStorySummary('');
    setStoryPhotoPreview(null);
  };

  const handleStoryPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLikeToggle = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const liked = !p.userLiked;
        return {
          ...p,
          userLiked: liked,
          likesCount: liked ? p.likesCount + 1 : p.likesCount - 1
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId) => {
    const text = commentInputText[postId];
    if (!text || !text.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      author: currentUser?.name || 'Community Responder',
      text: text.trim(),
      time: 'Just now'
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));

    setCommentInputText(prev => ({ ...prev, [postId]: '' }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const createdPost = {
      id: `post_${Date.now()}`,
      type: 'citizen_report',
      riskCategory: newSeverity,
      author: currentUser?.name || 'Community Responder',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verified: false,
      location: newLocation,
      timestamp: 'Just now',
      title: newTitle,
      description: newDescription,
      image: newPhotoPreview || 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=900&q=80',
      likesCount: 1,
      commentsCount: 0,
      userLiked: true,
      comments: []
    };

    setPosts([createdPost, ...posts]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewPhotoPreview(null);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'official' && post.type !== 'official_alert') return false;
    if (activeFilter === 'citizen' && post.type !== 'citizen_report') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        post.description.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getBadgeClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'holo-badge-critical';
      case 'HIGH': return 'holo-badge-high';
      case 'MODERATE': return 'holo-badge-moderate';
      default: return 'holo-badge-low';
    }
  };

  const getBorderColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#FF6EC7';
      case 'HIGH': return '#7873F5';
      case 'MODERATE': return '#4FD8EA';
      default: return '#52D199';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060608', paddingBottom: 90 }}>
      {/* Navigation Header */}
      <HoloNavbar
        currentPath="/home"
        onNavigate={onNavigate}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

        {/* ─── 1. INSTAGRAM/WHATSAPP STYLE "ADD STORY" & RADAR STORIES ROW ─── */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="holo-heading" style={{ fontSize: '0.86rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Live Zone Radar Stories (24h Updates)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#4FD8EA', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="holo-live-dot" /> {stories.length} Stories Active
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none'
          }}>
            {/* FIRST CIRCULAR BUTTON: "+ Add Story" */}
            <div
              onClick={() => setIsAddStoryModalOpen(true)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <div style={{
                position: 'relative',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 110, 199, 0.2), rgba(79, 216, 234, 0.2))',
                border: '2px dashed rgba(79, 216, 234, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}>
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt="Your Profile"
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    opacity: 0.85
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6EC7, #7873F5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(255, 110, 199, 0.8)',
                  border: '2px solid #060608'
                }}>
                  <Plus size={14} color="#ffffff" />
                </div>
              </div>
              <span style={{
                fontSize: '0.74rem',
                color: '#FF6EC7',
                fontWeight: 700,
                maxWidth: 72,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center'
              }}>
                + Add Story
              </span>
            </div>

            {/* STORIES LIST */}
            {stories.map(story => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div className={`avatar-ring-${story.ringColor}`} style={{ transition: 'transform 0.2s ease' }}>
                  <img
                    src={story.avatar}
                    alt={story.zone}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                      border: '2px solid #060608'
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '0.74rem',
                  color: '#f8fafc',
                  maxWidth: 72,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center'
                }}>
                  {story.zone.split('/')[0]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 2. HOME SECTION NAVIGATION TABS: OVERVIEW | FEED | ANALYTICS ─── */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: 10
        }}>
          <button
            onClick={() => setHomeTab('overview')}
            className={homeTab === 'overview' ? 'holo-btn-primary' : 'holo-btn-secondary'}
            style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Grid size={16} />
            <span>Dashboard & Map</span>
          </button>

          <button
            onClick={() => setHomeTab('feed')}
            className={homeTab === 'feed' ? 'holo-btn-primary' : 'holo-btn-secondary'}
            style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <MessageSquare size={16} />
            <span>Community Feed</span>
          </button>

          <button
            onClick={() => setHomeTab('analytics')}
            className={homeTab === 'analytics' ? 'holo-btn-primary' : 'holo-btn-secondary'}
            style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BarChart2 size={16} />
            <span>48h Forecast & AI</span>
          </button>
        </div>

        {/* ─── 3. RESTORED DASHBOARD COMPONENTS (KPIs + MAP PREVIEW + FORECAST + PREDICTION) ─── */}
        {(homeTab === 'overview' || homeTab === 'analytics') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
            {/* Top Landslide Risk Level Indicator Cards */}
            <RiskSummaryKPIs summary={summary} />

            {/* Grid Layout: Interactive Map Preview + AI Prediction Inspector */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
              gap: 18,
              alignItems: 'start'
            }}>
              {/* Left: Interactive Map Preview Widget */}
              <div className="holo-card" style={{ padding: 16, height: 480, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={18} color="#FF6EC7" />
                    <span className="holo-heading" style={{ fontSize: '0.96rem', color: '#ffffff' }}>
                      Interactive GIS Map Preview
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate && onNavigate('/app')}
                    className="holo-btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>Full Command Center</span>
                    <Navigation size={12} />
                  </button>
                </div>
                <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
                  <GisMap
                    zones={zones}
                    selectedZone={selectedZone}
                    onSelectZone={setSelectedZone}
                    facilities={facilities}
                    roads={roads}
                    reports={reports}
                  />
                </div>
              </div>

              {/* Right: AI Prediction Level Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ZoneInspector
                  zone={selectedZone || (zones.length > 0 ? zones[0] : null)}
                  onAlertDispatched={onRefreshAll}
                />

                {/* 48-Hour Forecast & Trend Data */}
                <ForecastChart
                  zoneId={selectedZone ? selectedZone.id : 1}
                  zoneName={selectedZone ? selectedZone.name : 'East Khasi Hills'}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── 4. SOCIAL INCIDENT & ALERTS FEED ─── */}
        {(homeTab === 'overview' || homeTab === 'feed') && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 className="holo-heading" style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>
                Live Incident & Citizen Reports
              </h2>
              {/* Filter Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setActiveFilter('all')}
                  className={activeFilter === 'all' ? 'holo-btn-primary' : 'holo-btn-secondary'}
                  style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('official')}
                  className={activeFilter === 'official' ? 'holo-btn-primary' : 'holo-btn-secondary'}
                  style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                >
                  Official
                </button>
                <button
                  onClick={() => setActiveFilter('citizen')}
                  className={activeFilter === 'citizen' ? 'holo-btn-primary' : 'holo-btn-secondary'}
                  style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                >
                  Citizen
                </button>
              </div>
            </div>

            {/* Posts Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {filteredPosts.map(post => {
                const isOfficial = post.type === 'official_alert';
                const borderColor = getBorderColor(post.riskCategory);
                const isCommentsExpanded = expandedPostComments[post.id];

                return (
                  <article
                    key={post.id}
                    className="holo-card holo-card-interactive"
                    style={{
                      padding: '20px 22px',
                      borderLeft: isOfficial ? `4px solid ${borderColor}` : '1px solid transparent'
                    }}
                  >
                    {/* Post Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={post.authorAvatar}
                          alt={post.author}
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: `1.5px solid ${borderColor}`
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#ffffff' }}>
                              {post.author}
                            </span>
                            {post.verified && (
                              <ShieldCheck size={16} color="#4FD8EA" title="Verified Authority" />
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={12} color="#FF6EC7" /> {post.location}
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={12} color="#7873F5" /> {post.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={getBadgeClass(post.riskCategory)}>
                        {post.riskCategory}
                      </span>
                    </div>

                    {/* Post Content */}
                    <h3 className="holo-heading" style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: 8, lineHeight: 1.35 }}>
                      {post.title}
                    </h3>
                    <p className="holo-body" style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: post.image ? 14 : 16 }}>
                      {post.description}
                    </p>

                    {/* Optional Image */}
                    {post.image && (
                      <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <img
                          src={post.image}
                          alt={post.title}
                          style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 12,
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <button
                          onClick={() => handleLikeToggle(post.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: post.userLiked ? '#FF6EC7' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            fontSize: '0.86rem',
                            fontWeight: 600
                          }}
                        >
                          <Heart size={18} fill={post.userLiked ? '#FF6EC7' : 'none'} color={post.userLiked ? '#FF6EC7' : '#94a3b8'} />
                          <span>{post.likesCount}</span>
                        </button>

                        <button
                          onClick={() => setExpandedPostComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: isCommentsExpanded ? '#4FD8EA' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            fontSize: '0.86rem',
                            fontWeight: 600
                          }}
                        >
                          <MessageSquare size={18} color={isCommentsExpanded ? '#4FD8EA' : '#94a3b8'} />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => onNavigate && onNavigate('/app')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4FD8EA',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        <span>View in GIS Map</span>
                        <Navigation size={14} />
                      </button>
                    </div>

                    {/* Comments Expander */}
                    {isCommentsExpanded && (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map(c => (
                              <div key={c.id} style={{
                                background: 'rgba(15, 15, 20, 0.6)',
                                padding: '8px 12px',
                                borderRadius: 10,
                                fontSize: '0.82rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                  <span style={{ fontWeight: 600, color: '#7873F5' }}>{c.author}</span>
                                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.time}</span>
                                </div>
                                <span style={{ color: '#cbd5e1' }}>{c.text}</span>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>No comments yet. Be the first to reply!</p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            placeholder="Write a response..."
                            value={commentInputText[post.id] || ''}
                            onChange={(e) => setCommentInputText(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            className="holo-input"
                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="holo-btn-primary"
                            style={{ padding: '8px 14px', borderRadius: 10 }}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Floating "+" Action Button */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="holo-btn-primary"
        style={{
          position: 'fixed',
          bottom: 92,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(255, 110, 199, 0.6)'
        }}
        title="Create New Report"
      >
        <Plus size={26} color="#ffffff" />
      </button>

      {/* ─── 5. MODAL: ADD STORY (INSTAGRAM/WHATSAPP STYLE) ─── */}
      {isAddStoryModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(6, 6, 8, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="holo-card" style={{ width: '100%', maxWidth: 460, padding: 28, position: 'relative' }}>
            <button
              onClick={() => setIsAddStoryModalOpen(false)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 className="holo-gradient-text" style={{ fontSize: '1.3rem', marginBottom: 6 }}>
              Add Live Zone Story (24h Status)
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 18 }}>
              Post a quick geo-tagged photo status or landslide observation visible at the top of the Home Radar stream.
            </p>

            <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Target Zone / Sector
                </label>
                <select
                  value={storyZone}
                  onChange={(e) => setStoryZone(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', backgroundColor: '#0f0f14' }}
                >
                  <option value="Sohra / Cherrapunji">Sohra / Cherrapunji</option>
                  <option value="Pynursla Pass">Pynursla Pass</option>
                  <option value="Mawsynram">Mawsynram</option>
                  <option value="Shillong Bypass">Shillong Bypass</option>
                  <option value="Nongpriang Valley">Nongpriang Valley</option>
                  <option value="Dawki Road Section">Dawki Road Section</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Risk Category
                </label>
                <select
                  value={storyRiskLevel}
                  onChange={(e) => setStoryRiskLevel(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', backgroundColor: '#0f0f14' }}
                >
                  <option value="CRITICAL">CRITICAL (Cloudburst / Slide Active)</option>
                  <option value="HIGH">HIGH (Debris Flow / Heavy Rain)</option>
                  <option value="MODERATE">MODERATE (Saturated Soil / Drizzle)</option>
                  <option value="LOW">LOW (Normal Patrol / Clear)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Story Update Summary
                </label>
                <textarea
                  placeholder="e.g. Traffic moving smoothly. PWD cleared small stones..."
                  value={storySummary}
                  onChange={(e) => setStorySummary(e.target.value)}
                  className="holo-input"
                  rows={3}
                  style={{ width: '100%', resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Attach Geo-tagged Photo
                </label>
                {storyPhotoPreview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', maxHeight: 180 }}>
                    <img src={storyPhotoPreview} alt="Story Preview" style={{ width: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setStoryPhotoPreview(null)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: 4,
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '16px',
                    border: '1.5px dashed rgba(79, 216, 234, 0.4)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: '#4FD8EA',
                    fontSize: '0.84rem'
                  }}>
                    <Camera size={20} />
                    <span>Take or Upload Story Photo</span>
                    <input type="file" accept="image/*" onChange={handleStoryPhotoSelect} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsAddStoryModalOpen(false)}
                  className="holo-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="holo-btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Share Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STORY DETAIL VIEWER MODAL */}
      {selectedStory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(6, 6, 8, 0.92)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="holo-card" style={{ width: '100%', maxWidth: 440, padding: 24, position: 'relative' }}>
            <button
              onClick={() => setSelectedStory(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>

            {/* Story Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <img
                src={selectedStory.avatar}
                alt={selectedStory.zone}
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #FF6EC7' }}
              />
              <div>
                <h3 className="holo-gradient-text" style={{ fontSize: '1.2rem', margin: 0 }}>
                  {selectedStory.zone}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span className={getBadgeClass(selectedStory.riskLevel)}>
                    {selectedStory.riskLevel} ({selectedStory.riskScore || 75}/100)
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {selectedStory.timeAgo || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Story Image if Present */}
            {selectedStory.photo && (
              <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16, maxHeight: 260, border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={selectedStory.photo} alt="Story update" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            <p className="holo-body" style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: 20 }}>
              {selectedStory.summary}
            </p>

            <button
              onClick={() => { setSelectedStory(null); onNavigate && onNavigate('/app'); }}
              className="holo-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
            >
              Open Zone in GIS Command Center
            </button>
          </div>
        </div>
      )}

      {/* CREATE NEW REPORT MODAL */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          backgroundColor: 'rgba(6, 6, 8, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div className="holo-card" style={{ width: '100%', maxWidth: 480, padding: 28, position: 'relative' }}>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 className="holo-gradient-text" style={{ fontSize: '1.35rem', marginBottom: 16 }}>
              Submit Citizen Hazard Report
            </h3>

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mudslide near Pynursla Bend"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Location / Zone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sohra Highway, East Khasi Hills"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Observed Severity
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                  className="holo-input"
                  style={{ width: '100%', backgroundColor: '#0f0f14' }}
                >
                  <option value="CRITICAL">CRITICAL (Road Blocked / Imminent Collapse)</option>
                  <option value="HIGH">HIGH (Debris Fall / Cracks on Slope)</option>
                  <option value="MODERATE">MODERATE (Heavy Water Runoff / Drizzle)</option>
                  <option value="LOW">LOW (Informational / Precautionary)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Description & Road Status
                </label>
                <textarea
                  placeholder="Describe slope conditions, blockages, or shelter availability..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="holo-input"
                  rows={3}
                  style={{ width: '100%', resize: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Attach Geo-tagged Photo
                </label>
                {newPhotoPreview ? (
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', maxHeight: 180 }}>
                    <img src={newPhotoPreview} alt="Preview" style={{ width: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setNewPhotoPreview(null)}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: 4,
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    padding: '16px',
                    border: '1.5px dashed rgba(79, 216, 234, 0.4)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: '#4FD8EA',
                    fontSize: '0.84rem'
                  }}>
                    <Camera size={20} />
                    <span>Upload Photo from Camera/Gallery</span>
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="holo-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="holo-btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Post Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeFeedView;
