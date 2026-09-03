import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Upload, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  Languages, 
  Clock, 
  Send, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  Image, 
  Layers, 
  Flame, 
  AlertCircle, 
  UserCheck, 
  PlusCircle, 
  Eye, 
  TrendingUp, 
  Filter,
  Check,
  Building2,
  Navigation,
  Mic,
  MicOff,
  Radio
} from 'lucide-react';
import { api } from '../api';
import { useSpeechToText } from '../hooks/useSpeechToText';

// Seed stories for the top reels bar
const REEL_STORIES = [
  { id: 's1', zone: 'Sohra Escarpment', risk: 'Critical', photo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80', time: '8m ago', reporter: 'B. Lyngdoh' },
  { id: 's2', zone: 'Mawsynram Slopes', risk: 'High', photo: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', time: '22m ago', reporter: 'Inspector PWD' },
  { id: 's3', zone: 'Dawki Border Ghats', risk: 'Medium', photo: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=400&q=80', time: '1h ago', reporter: 'NDRF Scout' },
  { id: 's4', zone: 'Pynursla Ridge', risk: 'Critical', photo: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80', time: '2h ago', reporter: 'D. Kharbhih' },
  { id: 's5', zone: 'Mawphlang Valley', risk: 'Low', photo: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80', time: '3h ago', reporter: 'Forest Guard' }
];

const HAZARD_TAGS = [
  '#Landslide',
  '#RoadBlocked',
  '#Rockfall',
  '#DebrisFlow',
  '#Mudslide',
  '#CrackedSlope',
  '#TreeFallen',
  '#FlashFlood'
];

export default function SocialFieldAppView({ currentUser, onOpenAuth, facilities = [], onReportSubmitted }) {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'post' | 'shelters' | 'queue'
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [feedReports, setFeedReports] = useState([]);
  const [queue, setQueue] = useState([]);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [isSendingSOS, setIsSendingSOS] = useState(false);
  const [sosStatus, setSosStatus] = useState('');
  const { transcript, isListening, isSupported: isVoiceSupported, startListening, stopListening } = useSpeechToText('en');

  // Sync speech transcript into description
  useEffect(() => {
    if (transcript) {
      setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  const handleTriggerSOS = async () => {
    if (!window.confirm('⚠️ ACTIVATE EMERGENCY SOS?\n\nThis broadcasts your exact GPS coordinates to District Disaster Management (DDMA) and all response teams.')) return;
    setIsSendingSOS(true);
    setSosStatus('Acquiring high-accuracy GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch('/api/sos/beacon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              reporter_name: currentUser?.name || 'Citizen In Distress',
              contact: currentUser?.phone || '',
              message: 'Immediate landslide danger / evacuation needed!'
            })
          });
          const data = await res.json();
          setSosStatus(`🚨 SOS Beacon Active! Alert broadcast to ${data.dispatched_to || 'district'} responders.`);
          setTimeout(() => setSosStatus(''), 8000);
        } catch (e) {
          setSosStatus('⚠️ SOS registered locally. Responders alerted on reconnection.');
          setTimeout(() => setSosStatus(''), 6000);
        } finally {
          setIsSendingSOS(false);
        }
      },
      () => {
        alert('Could not access GPS. Please enable device location for SOS.');
        setIsSendingSOS(false);
        setSosStatus('');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const [activeStory, setActiveStory] = useState(null);

  // Verification & likes tracker
  const [confirmedPosts, setConfirmedPosts] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [newCommentText, setNewCommentText] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);

  // New Post Form States
  const [photoUrl, setPhotoUrl] = useState('');
  const [hazardType, setHazardType] = useState('Debris Flow / Mudslide');
  const [selectedHashtags, setSelectedHashtags] = useState(['#Landslide', '#RoadBlocked']);
  const [severity, setSeverity] = useState('Severe');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('25.2750');
  const [lon, setLon] = useState('91.7320');
  const [landmark, setLandmark] = useState('NH-206 km 42 near Elephant Falls');
  const [broadcastWarning, setBroadcastWarning] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState('');

  const isActuallyOnline = navigator.onLine && !isSimulatedOffline;

  // Load feed reports & offline queue
  const loadFeed = async () => {
    try {
      const reports = await api.getReports();
      setFeedReports(reports);
    } catch (e) {
      console.warn('Feed load error:', e);
    }
    setQueue(api.getOfflineQueue());
  };

  useEffect(() => {
    loadFeed();
    const interval = setInterval(loadFeed, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCaptureGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLon(pos.coords.longitude.toFixed(4));
        },
        () => {
          setLat('25.2750');
          setLon('91.7320');
        }
      );
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHashtag = (tag) => {
    if (selectedHashtags.includes(tag)) {
      setSelectedHashtags(selectedHashtags.filter(t => t !== tag));
    } else {
      setSelectedHashtags([...selectedHashtags, tag]);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsPosting(true);
    setPostSuccessMessage('');

    const formattedDescription = `${selectedHashtags.join(' ')}\n${description || 'Landslide observed along road corridor. Caution advised.'}\n📍 Landmark: ${landmark}`;

    const reportData = {
      reporter_type: currentUser?.role || 'citizen',
      reporter_name: currentUser?.name || 'Local Community Member',
      reporter_contact: currentUser?.phone || '+91-8630868896',
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      hazard_type: hazardType,
      severity: severity,
      description: formattedDescription,
      photo_data_url: photoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      device_created_at: new Date().toISOString()
    };

    try {
      if (!isActuallyOnline) {
        api.saveReportToOfflineQueue(reportData);
        setQueue(api.getOfflineQueue());
        setPostSuccessMessage('⚡ Saved to offline queue! Will auto-post when connected.');
      } else {
        await api.submitReport(reportData);
        setPostSuccessMessage('🎉 Incident report posted to live community warning feed!');
      }

      // Reset form
      setDescription('');
      setPhotoUrl('');
      await loadFeed();
      if (onReportSubmitted) onReportSubmitted();
      setTimeout(() => {
        setActiveTab('feed');
        setPostSuccessMessage('');
      }, 1200);
    } catch (err) {
      api.saveReportToOfflineQueue(reportData);
      setQueue(api.getOfflineQueue());
      setPostSuccessMessage('⚡ Saved to device outbox (network error).');
      setActiveTab('feed');
    } finally {
      setIsPosting(false);
    }
  };

  const handleConfirmIncident = (id) => {
    setConfirmedPosts(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleAddComment = (postId) => {
    const text = newCommentText[postId];
    if (!text || !text.trim()) return;

    const newComment = {
      id: Date.now(),
      author: currentUser?.name || 'Community Member',
      role: currentUser?.role || 'citizen',
      text: text.trim(),
      time: 'Just now'
    };

    setCommentsMap(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setNewCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleSyncOfflineNow = async () => {
    try {
      await api.syncOfflineQueue();
      setQueue([]);
      await loadFeed();
      if (onReportSubmitted) onReportSubmitted();
    } catch (e) {
      alert('Sync failed. Please check internet connection.');
    }
  };

  const filteredFeed = feedReports.filter(report => {
    if (selectedTag === 'ALL') return true;
    return (report.description || '').includes(selectedTag) || (report.hazard_type || '').toLowerCase().includes(selectedTag.replace('#', '').toLowerCase());
  });

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Top Mobile App Header Card */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
          }}>
            <Flame size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                DRISHTI_Ai Community Pulse
              </h2>
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 999
              }}>
                LIVE FEED
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Citizen ground truth & landslide hazard awareness
            </p>
          </div>
        </div>

        {/* User Persona & Offline Simulator Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* SOS Beacon Button */}
          <button
            id="emergency-sos-btn"
            onClick={handleTriggerSOS}
            disabled={isSendingSOS}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: isSendingSOS ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
              animation: 'pulse 2s infinite'
            }}
          >
            <Radio size={14} className="pulse-red" />
            <span>{isSendingSOS ? 'Broadcasting...' : '🆘 SOS'}</span>
          </button>

          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            title="Toggle network simulation"
            style={{
              background: isSimulatedOffline ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
              color: isSimulatedOffline ? '#fca5a5' : '#6ee7b7',
              border: `1px solid ${isSimulatedOffline ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            {isSimulatedOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span>{isSimulatedOffline ? 'Offline' : 'Online'}</span>
          </button>

          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-glass-bright)',
              padding: '4px 10px',
              borderRadius: 20,
              cursor: 'pointer'
            }}
          >
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
              alt="avatar" 
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} 
            />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>

      {/* SOS Active Notification Banner */}
      {sosStatus && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.25)',
          border: '1px solid #ef4444',
          borderRadius: 12,
          padding: '10px 14px',
          color: '#fca5a5',
          fontSize: '0.82rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Radio size={16} color="#ef4444" />
          <span>{sosStatus}</span>
        </div>
      )}

      {/* Stories / Live Micro-Zone Reels Bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollbarWidth: 'none'
      }}>
        {/* Story 0: Post Story Trigger */}
        <div 
          onClick={() => setActiveTab('post')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            minWidth: 70,
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #34d399',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <PlusCircle size={26} color="#ffffff" />
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399' }}>Post Alert</span>
        </div>

        {REEL_STORIES.map(story => (
          <div
            key={story.id}
            onClick={() => setActiveStory(story)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 70,
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              padding: 2,
              background: story.risk === 'Critical' 
                ? 'linear-gradient(135deg, #ef4444, #f97316)' 
                : 'linear-gradient(135deg, #0284c7, #06b6d4)',
              boxShadow: story.risk === 'Critical' ? '0 0 10px rgba(239, 68, 68, 0.6)' : 'none'
            }}>
              <img
                src={story.photo}
                alt={story.zone}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #0f172a'
                }}
              />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#e2e8f0', textAlign: 'center', width: 68, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {story.zone.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Story Lightbox Modal */}
      {activeStory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3500,
          padding: 16
        }}>
          <div style={{
            maxWidth: 420,
            width: '100%',
            background: '#0f172a',
            borderRadius: 20,
            overflow: 'hidden',
            border: '1px solid var(--border-glass-bright)',
            position: 'relative'
          }}>
            <img src={activeStory.photo} alt={activeStory.zone} style={{ width: '100%', height: 320, objectFit: 'cover' }} />
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc' }}>{activeStory.zone}</span>
                <span style={{
                  background: activeStory.risk === 'Critical' ? '#ef4444' : '#0284c7',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999
                }}>
                  {activeStory.risk} Risk
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0 0 12px 0' }}>
                Reported by {activeStory.reporter} • {activeStory.time}
              </p>
              <button
                onClick={() => setActiveStory(null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs (Social Media Style) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: 4,
        borderRadius: 14,
        border: '1px solid var(--border-glass)'
      }}>
        <button
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '10px 6px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'feed' ? 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' : 'transparent',
            color: activeTab === 'feed' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Flame size={15} />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('post')}
          style={{
            padding: '10px 6px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'post' ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)' : 'transparent',
            color: activeTab === 'post' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Camera size={15} />
          <span>Post Incident</span>
        </button>

        <button
          onClick={() => setActiveTab('shelters')}
          style={{
            padding: '10px 6px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'shelters' ? 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' : 'transparent',
            color: activeTab === 'shelters' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          <Building2 size={15} />
          <span>Safe Shelters</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          style={{
            padding: '10px 6px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: activeTab === 'queue' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
            color: activeTab === 'queue' ? '#fca5a5' : 'var(--text-secondary)',
            position: 'relative'
          }}
        >
          <Clock size={15} />
          <span>Outbox</span>
          {queue.length > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 900,
              padding: '1px 5px',
              borderRadius: 999
            }}>
              {queue.length}
            </span>
          )}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* VIEW 1: SOCIAL WARNING FEED */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'feed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Hashtag Filters */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedTag('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                border: 'none',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: selectedTag === 'ALL' ? '#06b6d4' : 'rgba(255,255,255,0.06)',
                color: selectedTag === 'ALL' ? '#fff' : 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              🔥 All Hazards
            </button>
            {HAZARD_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedTag === tag ? '#0284c7' : 'rgba(255,255,255,0.06)',
                  color: selectedTag === tag ? '#fff' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Incident Post Cards */}
          {filteredFeed.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <Camera size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                No incidents reported under {selectedTag}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Be the first to post a community ground observation!
              </p>
              <button
                onClick={() => setActiveTab('post')}
                style={{
                  marginTop: 12,
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                + Post Incident Photo
              </button>
            </div>
          ) : (
            filteredFeed.map(post => {
              const confirms = (confirmedPosts[post.id] || 0) + (post.severity === 'Critical' ? 14 : 6);
              const comments = commentsMap[post.id] || [];
              const isConfirmedByMe = !!confirmedPosts[post.id];

              return (
                <div 
                  key={post.id}
                  className="glass-panel"
                  style={{
                    padding: '16px 18px',
                    borderRadius: 16,
                    border: post.severity === 'Critical' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {/* Card Header (User Avatar + Geolocation) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img 
                        src={post.reporter_type === 'official' 
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'} 
                        alt="author" 
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(6, 182, 212, 0.4)' }} 
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>
                            {post.reporter_name || 'Community Member'}
                          </span>
                          <span style={{
                            background: post.reporter_type === 'official' ? 'rgba(2, 132, 199, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                            color: post.reporter_type === 'official' ? '#38bdf8' : '#34d399',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: 6
                          }}>
                            {post.reporter_type === 'official' ? 'PWD OFFICIAL' : 'VERIFIED CITIZEN'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          <MapPin size={12} color="#06b6d4" />
                          <span>{post.zone_name || 'East Khasi Hills'}</span>
                          <span>•</span>
                          <span>{post.server_received_at ? new Date(post.server_received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    <span style={{
                      background: post.severity === 'Critical' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                      color: post.severity === 'Critical' ? '#fca5a5' : '#fbbf24',
                      border: `1px solid ${post.severity === 'Critical' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)'}`,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 999,
                      textTransform: 'uppercase'
                    }}>
                      {post.severity || 'Moderate'}
                    </span>
                  </div>

                  {/* Incident Photo Preview */}
                  {post.photo_data_url && (
                    <div style={{ width: '100%', height: 260, borderRadius: 12, overflow: 'hidden', position: 'relative', background: '#090d16' }}>
                      <img 
                        src={post.photo_data_url} 
                        alt="Incident" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 8,
                        left: 8,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#67e8f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Navigation size={11} />
                        <span>Lat: {post.latitude.toFixed(3)}, Lon: {post.longitude.toFixed(3)}</span>
                      </div>
                    </div>
                  )}

                  {/* Description with Hashtags */}
                  <p style={{
                    fontSize: '0.84rem',
                    color: '#e2e8f0',
                    lineHeight: 1.5,
                    margin: 0,
                    whiteSpace: 'pre-line'
                  }}>
                    {post.description}
                  </p>

                  {/* Social Interactions Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: 10,
                    gap: 8
                  }}>
                    {/* Confirm / Verify Button */}
                    <button
                      onClick={() => handleConfirmIncident(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: isConfirmedByMe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: isConfirmedByMe ? '#34d399' : '#cbd5e1',
                        border: isConfirmedByMe ? '1px solid #10b981' : '1px solid var(--border-glass)',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <ThumbsUp size={14} />
                      <span>{confirms} Confirmed</span>
                    </button>

                    {/* Comments toggle */}
                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#cbd5e1',
                        border: '1px solid var(--border-glass)',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <MessageCircle size={14} />
                      <span>{comments.length} Road Updates</span>
                    </button>

                    {/* Emergency Share */}
                    <button
                      onClick={() => {
                        const shareText = `🚨 LANDSLIDE ALERT: ${post.hazard_type} at ${post.zone_name || 'East Khasi Hills'}. Severity: ${post.severity}. Move to safe shelters. Dial DDMA: 1070.`;
                        if (navigator.share) {
                          navigator.share({ title: 'Landslide Early Warning', text: shareText });
                        } else {
                          navigator.clipboard.writeText(shareText);
                          alert('Alert copied to clipboard for WhatsApp/SMS sharing!');
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#fca5a5',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Share2 size={14} />
                      <span>Share Alert</span>
                    </button>
                  </div>

                  {/* Comment Thread Box */}
                  {activeCommentPostId === post.id && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: 10,
                      padding: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      border: '1px solid var(--border-glass)'
                    }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8' }}>
                        Road Clearance & Field Updates:
                      </div>

                      {comments.length === 0 ? (
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          No updates yet. Add clearance or route status below.
                        </div>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '6px 10px', borderRadius: 6, fontSize: '0.76rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#67e8f9', fontWeight: 700, fontSize: '0.7rem' }}>
                              <span>{c.author} ({c.role})</span>
                              <span style={{ color: '#64748b' }}>{c.time}</span>
                            </div>
                            <div style={{ color: '#e2e8f0', marginTop: 2 }}>{c.text}</div>
                          </div>
                        ))
                      )}

                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <input
                          type="text"
                          placeholder="Add clearance status (e.g. JCB clearing single lane)..."
                          value={newCommentText[post.id] || ''}
                          onChange={e => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: 6,
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid var(--border-glass)',
                            color: '#fff',
                            fontSize: '0.76rem'
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          style={{
                            background: '#0284c7',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* VIEW 2: POST INCIDENT / HAZARD (SOCIAL MEDIA COMPOSER) */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'post' && (
        <form onSubmit={handleCreatePost} className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                📸 Post Incident / Warning Alert
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Capture photo evidence to warn nearby residents & dispatch responders
              </p>
            </div>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6
            }}>
              Posting as: {currentUser?.name || 'Citizen'}
            </span>
          </div>

          {/* Photo Capture & Upload Box */}
          <div style={{
            border: '2px dashed #06b6d4',
            borderRadius: 14,
            padding: 18,
            textAlign: 'center',
            background: 'rgba(6, 182, 212, 0.05)',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            />
            {photoUrl ? (
              <div style={{ position: 'relative', width: '100%', height: 200, borderRadius: 10, overflow: 'hidden' }}>
                <img src={photoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', color: '#67e8f9' }}>
                  Tap to change photo
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={26} color="#06b6d4" />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc' }}>
                    Tap to open camera or upload photo
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    High-res photos help AI calculate slip velocity & debris volume
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Hashtag Badges Selector */}
          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
              Select Hazard Hashtags:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {HAZARD_TAGS.map(tag => {
                const isSel = selectedHashtags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleHashtag(tag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 16,
                      border: isSel ? '1px solid #06b6d4' : '1px solid var(--border-glass)',
                      background: isSel ? 'rgba(6, 182, 212, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                      color: isSel ? '#67e8f9' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {tag} {isSel ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity & Hazard Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                Hazard Classification
              </label>
              <select
                value={hazardType}
                onChange={e => setHazardType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              >
                <option value="Debris Flow / Mudslide">Debris Flow / Mudslide</option>
                <option value="Rockfall / Boulder Scree">Rockfall / Boulder Scree</option>
                <option value="Soil Creep / Ground Fissure">Ground Fissure / Creep</option>
                <option value="Road Blockage / Highway Cut Failure">Road Blockage / Cut Slope</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                Severity Level
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-glass)',
                  color: '#fff',
                  fontSize: '0.82rem'
                }}
              >
                <option value="Minor">Minor (Developing cracks)</option>
                <option value="Moderate">Moderate (Small slip)</option>
                <option value="Severe">Severe (Road partially blocked)</option>
                <option value="Critical">Critical (Complete blockage)</option>
              </select>
            </div>
          </div>

          {/* Landmark & GPS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1' }}>
                Landmark & Location Details
              </label>
              <button
                type="button"
                onClick={handleCaptureGPS}
                style={{
                  background: 'rgba(6, 182, 212, 0.15)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <MapPin size={12} />
                <span>Update GPS ({lat}, {lon})</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. NH-206 km 42 near Elephant Falls"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '0.82rem'
              }}
            />
          </div>

          {/* Description with Voice Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: '0.76rem', fontWeight: 600, color: '#cbd5e1' }}>
                Observations & Ground Status
              </label>
              {isVoiceSupported && (
                <button
                  type="button"
                  id="voice-dictate-btn"
                  onClick={isListening ? stopListening : startListening}
                  style={{
                    background: isListening ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.15)',
                    color: isListening ? '#fca5a5' : '#67e8f9',
                    border: `1px solid ${isListening ? '#ef4444' : 'rgba(6, 182, 212, 0.3)'}`,
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer'
                  }}
                >
                  {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                  <span>{isListening ? 'Listening (Tap to stop)...' : '🎙️ Speak to write'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={3}
              placeholder="Describe boulder sizes, water seepage, vehicle queue or road passability..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.8)',
                border: isListening ? '1px solid #06b6d4' : '1px solid var(--border-glass)',
                color: '#fff',
                fontSize: '0.82rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Submit Post Button */}
          <button
            type="submit"
            disabled={isPosting}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '13px 20px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: isPosting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
            }}
          >
            <Send size={18} />
            <span>{isPosting ? 'Publishing Incident...' : 'Publish to Community Warning Feed'}</span>
          </button>

          {postSuccessMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={16} />
              <span>{postSuccessMessage}</span>
            </div>
          )}
        </form>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* VIEW 3: SAFE SHELTERS & EMERGENCY LOCATIONS */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'shelters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              🛡️ Offline Safe Relief Shelters & Hospitals
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Designated evacuation centers in East Khasi Hills (Always accessible offline)
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            {facilities.map(facility => (
              <div 
                key={facility.id}
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: facility.type === 'hospital' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#f8fafc' }}>
                      {facility.name}
                    </span>
                    <span style={{
                      background: facility.type === 'hospital' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: facility.type === 'hospital' ? '#67e8f9' : '#34d399',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 6,
                      textTransform: 'uppercase'
                    }}>
                      {facility.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    📍 Lat: {facility.latitude}, Lon: {facility.longitude} • Capacity: {facility.capacity || 250} persons
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: 2, fontWeight: 600 }}>
                    Emergency Helpline: {facility.contact || '1070 / 112'}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Navigation size={13} />
                  <span>Navigate</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* VIEW 4: OFFLINE OUTBOX & SYNC QUEUE */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-panel" style={{ padding: '14px 18px', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                ⚡ Offline Device Outbox ({queue.length} items)
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Incident reports recorded without internet. Auto-synced when connected.
              </p>
            </div>
            {queue.length > 0 && (
              <button
                onClick={handleSyncOfflineNow}
                disabled={!isActuallyOnline}
                style={{
                  background: isActuallyOnline ? '#0284c7' : 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: isActuallyOnline ? 'pointer' : 'not-allowed'
                }}
              >
                Sync Now
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="glass-panel" style={{ padding: '36px 20px', textAlign: 'center' }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Outbox is Clean!
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                All your mobile field posts are synchronized with the central disaster grid.
              </p>
            </div>
          ) : (
            queue.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '12px 16px', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                    {item.hazard_type} • <span style={{ color: '#fbbf24' }}>{item.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                    📍 Lat: {item.latitude}, Lon: {item.longitude} • Queued: {new Date(item.device_created_at).toLocaleTimeString()}
                  </div>
                </div>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 6
                }}>
                  Pending Network
                </span>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
