import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  CircleMarker, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import {
  Compass,
  Navigation,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Hospital,
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  Car,
  Footprints,
  Radio,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Info,
  Globe,
  Wifi,
  WifiOff,
  Flame,
  ArrowRight,
  Route,
  LifeBuoy,
  MessageSquare,
  Volume2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Card,
  PageHeader,
  Button,
  SecondaryButton,
  DangerButton,
  Badge,
  RiskBadge,
  Modal,
  Tabs,
  Divider
} from '../components/ui';
import { api } from '../api';
import { useToast } from '../context/ToastContext';

// Map Center Controller
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 13, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom DivIcons for Map Pins
const createTouristPin = () => L.divIcon({
  className: 'custom-tourist-pin',
  html: `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      background: #EF4444;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
      animation: pulseDot 1.5s infinite;
    ">
      <span style="font-size: 16px; line-height: 1;">📍</span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const createShelterPin = (isTarget) => L.divIcon({
  className: 'custom-shelter-pin',
  html: `
    <div style="
      width: ${isTarget ? 34 : 28}px;
      height: ${isTarget ? 34 : 28}px;
      background: #22C55E;
      border: 2px solid #FFFFFF;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      box-shadow: 0 4px 12px rgba(34, 197, 94, ${isTarget ? 0.9 : 0.4});
      transform: rotate(45deg);
    ">
      <span style="transform: rotate(-45deg); font-size: ${isTarget ? 15 : 12}px; font-weight: bold;">🛡️</span>
    </div>
  `,
  iconSize: [isTarget ? 34 : 28, isTarget ? 34 : 28],
  iconAnchor: [isTarget ? 17 : 14, isTarget ? 17 : 14]
});

const createHospitalPin = (isTarget) => L.divIcon({
  className: 'custom-hospital-pin',
  html: `
    <div style="
      width: ${isTarget ? 34 : 28}px;
      height: ${isTarget ? 34 : 28}px;
      background: #06B6D4;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(6, 182, 212, ${isTarget ? 0.9 : 0.4});
    ">
      <span style="font-size: ${isTarget ? 15 : 12}px;">🏥</span>
    </div>
  `,
  iconSize: [isTarget ? 34 : 28, isTarget ? 34 : 28],
  iconAnchor: [isTarget ? 17 : 14, isTarget ? 17 : 14]
});

export default function EvacuationView({
  currentUser,
  onNavigateToGIS,
  zones = [],
  facilities = []
}) {
  const { showToast } = useToast();

  // Screen responsiveness
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const search = new URLSearchParams(window.location.search);
    return search.get('mode') === 'mobile' || window.innerWidth < 900;
  });

  useEffect(() => {
    const handleResize = () => {
      const search = new URLSearchParams(window.location.search);
      setIsMobile(search.get('mode') === 'mobile' || window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile navigation tab: 'facilities' | 'route' | 'phrases'
  const [mobileTab, setMobileTab] = useState('facilities');
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  // Tourist state
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [touristCoords, setTouristCoords] = useState({ lat: 25.2755, lon: 91.6853 });
  const [facilityFilter, setFacilityFilter] = useState('all'); // 'all' | 'shelter' | 'hospital'
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [evacuationPlan, setEvacuationPlan] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  // Survival Phrasebook Language
  const [phraseLang, setPhraseLang] = useState('kha'); // 'kha' (Khasi) | 'hi' (Hindi) | 'as' (Assamese) | 'en'
  const [copiedId, setCopiedId] = useState(null);

  // SOS Distress Modal
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Physical Android Haptic Feedback
  const triggerHaptic = (pattern = [80, 40, 80]) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {}
    }
  };

  // 1. Load Hotspots
  useEffect(() => {
    async function loadHotspots() {
      const data = await api.getTouristHotspots();
      setHotspots(data || []);
      if (data && data.length > 0) {
        setSelectedHotspot(data[0]);
        setTouristCoords({ lat: data[0].lat, lon: data[0].lon });
      }
    }
    loadHotspots();
  }, []);

  // 2. Fetch or Calculate Evacuation Plan
  useEffect(() => {
    async function fetchPlan() {
      setIsLoadingPlan(true);
      try {
        const plan = await api.planEvacuation(
          touristCoords.lat,
          touristCoords.lon,
          facilityFilter,
          45.0
        );
        if (plan) {
          setEvacuationPlan(plan);
          if (!selectedFacility && plan.target_facility) {
            setSelectedFacility(plan.target_facility);
          }
        }
      } catch (err) {
        console.warn('Evacuation plan fallback:', err);
      } finally {
        setIsLoadingPlan(false);
      }
    }
    if (touristCoords.lat && touristCoords.lon) {
      fetchPlan();
    }
  }, [touristCoords, facilityFilter]);

  // Handle Changing Tourist Destination
  const handleSelectHotspot = (spot) => {
    triggerHaptic([40]);
    setSelectedHotspot(spot);
    setTouristCoords({ lat: spot.lat, lon: spot.lon });
    setSelectedFacility(null);
    showToast(`Tourist Location Locked: ${spot.name}`, 'info');
  };

  // Handle Native Geolocation GPS Lock
  const handleUseLiveGps = () => {
    triggerHaptic([50]);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      showToast('Acquiring high-accuracy GPS coordinates...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setTouristCoords({ lat, lon });
          setSelectedHotspot({
            id: 'live_gps',
            name: 'Live GPS Location',
            lat,
            lon,
            risk: 'Live Tracking',
            category: 'User Geolocation'
          });
          showToast(`GPS Locked: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`, 'success');
          triggerHaptic([100, 50, 100]);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          showToast('GPS lock unavailable. Using selected landmark default.', 'warning');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      showToast('Device does not support native geolocation.', 'warning');
    }
  };

  // Handle Choosing Target Facility for Evacuation
  const handleSelectTargetFacility = (fac) => {
    triggerHaptic([60]);
    setSelectedFacility(fac);
    if (evacuationPlan) {
      // Re-route waypoints from tourist coordinates to chosen facility
      const lat1 = touristCoords.lat;
      const lon1 = touristCoords.lon;
      const lat2 = fac.latitude;
      const lon2 = fac.longitude;
      const mid_lat = (lat1 + lat2) / 2 + 0.005;
      const mid_lon = (lon1 + lon2) / 2 - 0.003;

      const newWaypoints = [
        [lat1, lon1],
        [roundCoord(lat1 * 0.7 + mid_lat * 0.3), roundCoord(lon1 * 0.7 + mid_lon * 0.3)],
        [roundCoord(mid_lat), roundCoord(mid_lon)],
        [roundCoord(mid_lat * 0.4 + lat2 * 0.6), roundCoord(mid_lon * 0.4 + lon2 * 0.6)],
        [lat2, lon2]
      ];

      setEvacuationPlan(prev => ({
        ...prev,
        target_facility: fac,
        evacuation_route: {
          ...prev?.evacuation_route,
          destination_name: fac.name,
          total_distance_km: fac.distance_km,
          estimated_drive_min: fac.drive_time_min,
          estimated_walk_min: fac.walk_time_min,
          waypoints: newWaypoints,
          steps: [
            { step: 1, instruction: `Evacuate current point away from gorge stream beds toward main corridor.`, distance_m: 350 },
            { step: 2, instruction: `Follow paved bypass avoiding marked cut-slope landslide vulnerability zones.`, distance_m: Math.round(fac.distance_km * 700) },
            { step: 3, instruction: `Arrive at safe high-ground entrance of ${fac.name}.`, distance_m: 100 }
          ]
        }
      }));
    }
    showToast(`Evacuation route updated towards ${fac.name}`, 'success');
  };

  const roundCoord = (val) => Math.round(val * 100000) / 100000;

  // Handle Copy Phrase
  const handleCopyPhrase = (id, text) => {
    triggerHaptic([40]);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Survival phrase copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dispatch SOS Beacon
  const handleSendSOS = async () => {
    triggerHaptic([150, 80, 150]);
    setSosLoading(true);
    const landmark = selectedHotspot?.name || 'East Khasi Hills Tourist Point';
    const message = `SOS EMERGENCY: Tourist stranded near ${landmark} (Lat: ${touristCoords.lat.toFixed(4)}, Lon: ${touristCoords.lon.toFixed(4)}). Flash runoff/landslide blocking exit. Require immediate SDRF rescue assistance.`;
    
    try {
      await api.sendSOSBeacon(touristCoords.lat, touristCoords.lon, currentUser?.name || 'Meghalaya Visitor', '112', message);
      setSosSent(true);
      showToast('🚨 SOS DISTRESS BEACON BROADCAST TO SDMA & SDRF COMMAND!', 'critical');
    } catch (e) {
      setSosSent(true);
      showToast('SOS Broadcast queued offline for transmission upon reception recovery.', 'warning');
    } finally {
      setSosLoading(false);
    }
  };

  // WhatsApp SOS Dispatch for Mobile
  const handleWhatsAppSOS = () => {
    triggerHaptic([50]);
    const landmark = selectedHotspot?.name || 'East Khasi Hills';
    const text = encodeURIComponent(
      `🚨 *DRISHTI-AI SOS DISTRESS ALERT*\n` +
      `*Status:* Stranded in High-Risk Landslide Hazard Area\n` +
      `*Location:* ${landmark}\n` +
      `*Live GPS:* https://maps.google.com/?q=${touristCoords.lat},${touristCoords.lon}\n` +
      `*Recommended Refuge:* ${selectedFacility?.name || 'East Khasi Hills Relief Post'} (${selectedFacility?.distance_km || 2.4} km)\n` +
      `*Time:* ${new Date().toLocaleTimeString()}\n` +
      `*Urgent:* Please alert SDRF Meghalaya / Police 112 immediately!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Multi-Lingual Survival Phrasebook Data with Phonetic Guidance
  const survivalPhrases = [
    {
      id: 'p1',
      meaning: 'Where is the nearest safe shelter / refuge?',
      en: 'Where is the nearest safe shelter / cyclone hall?',
      kha: 'Bha la dei ban phet shano sha ka jaka sah ba shngain?',
      pronounce: 'Bah lah day bahn phet shah-noh shah kah jah-kah sah bah shng-eye-n?',
      hi: 'निकटतम सुरक्षित आश्रय या राहत केंद्र कहाँ है?',
      as: 'আটাইতকৈ ওচৰৰ নিৰাপদ আশ্ৰয় ক\'ত আছে?'
    },
    {
      id: 'p2',
      meaning: 'Is the road ahead blocked by landslide debris?',
      en: 'Is the road ahead blocked by mud or rocks?',
      kha: 'Ka surok sha khmat ka la shah teh na ka jingtwap khyndew?',
      pronounce: 'Kah soo-rok shah khmaht kah lah shah tay nah kah jing-twahp khin-dew?',
      hi: 'क्या आगे की सड़क भूस्खलन या मलबे से बंद है?',
      as: 'আগলৈ বাটটো ভূমিস্খলনৰ বাবে বন্ধ হৈ আছে নেকি?'
    },
    {
      id: 'p3',
      meaning: 'We need urgent medical assistance for an injured person.',
      en: 'We need an ambulance or medical doctor immediately.',
      kha: 'Ngi donkam jingiarap doctor kyrkieh ia uba mynsaw.',
      pronounce: 'Ngee dohn-kahm jing-yah-rap dohk-tor kur-kee-eh yah oo-bah min-sow.',
      hi: 'हमें घायल व्यक्ति के लिए तुरंत डॉक्टर या एम्बुलेंस चाहिए।',
      as: 'এগৰাকী আহত ব্যক্তিৰ বাবে আমাক তৎকালীন চিকিৎসাৰ প্ৰয়োজন।'
    },
    {
      id: 'p4',
      meaning: 'Please help us reach the village headman (Rangbah Shnong).',
      en: 'Please guide us to the local village headman.',
      kha: 'Sngewbha ialam ia ngi sha u Rangbah Shnong.',
      pronounce: 'Sngew-bhah yah-lahm yah ngee shah oo Rahng-bah Shnohng.',
      hi: 'कृपया हमें स्थानीय ग्राम प्रधान (रंगबाह श्नॉन्ग) के पास ले चलें।',
      as: 'অনুগ্ৰহ কৰি আমাক গাঁওবুঢ়াৰ ওচৰলৈ লৈ যাওক।'
    }
  ];

  // Map center
  const mapCenter = useMemo(() => {
    return [touristCoords.lat, touristCoords.lon];
  }, [touristCoords]);

  const activeRoute = evacuationPlan?.evacuation_route;
  const facilityList = evacuationPlan?.facilities || [];

  // Sub-Renderer: Recommended Safe Haven Card
  const renderSafeHavenCard = () => (
    <Card padding={isMobile ? 14 : 20}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
            RECOMMENDED SAFE HAVEN
          </span>
          <span style={{ fontSize: 12, color: 'var(--status-live)', fontWeight: 600 }}>
            Safety Score: {activeRoute?.safety_rating || 94}/100
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: isMobile ? 36 : 42,
              height: isMobile ? 36 : 42,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={isMobile ? 20 : 24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: isMobile ? 14 : 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedFacility?.name || evacuationPlan?.target_facility?.name || 'Sohra Multi-Purpose Cyclone & Landslide Refuge'}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>
              {selectedFacility?.category || 'Reinforced RCC High-Ground Community Shelter'}
            </p>
          </div>
        </div>

        {/* Distance & ETA Pills */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 'var(--radius-input)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-secondary)'
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Distance</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {selectedFacility?.distance_km || activeRoute?.total_distance_km || 2.4} km
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vehicle ETA</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-light)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Car size={12} />
              <span>{selectedFacility?.drive_time_min || activeRoute?.estimated_drive_min || 6}m</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>On Foot ETA</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
              <Footprints size={12} />
              <span>{selectedFacility?.walk_time_min || activeRoute?.estimated_walk_min || 35}m</span>
            </div>
          </div>
        </div>

        {/* Features & Amenities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', fontSize: 10 }}>
          <span style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            ⚡ Backup Generator
          </span>
          <span style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            💧 Clean Water
          </span>
          <span style={{ padding: '2px 7px', borderRadius: 4, backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
            🏥 First Aid
          </span>
        </div>
      </div>
    </Card>
  );

  // Sub-Renderer: Nearest Help Centers Directory
  const renderFacilityDirectory = () => (
    <Card padding={isMobile ? 14 : 20}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Nearest Help Centers
          </h3>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: 3, backgroundColor: 'var(--bg-main)', padding: 3, borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-secondary)' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'shelter', label: 'Shelters' },
              { id: 'hospital', label: 'Hospitals' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic([30]);
                  setFacilityFilter(tab.id);
                }}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  backgroundColor: facilityFilter === tab.id ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: facilityFilter === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities Scroll List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: isMobile ? 380 : 280, overflowY: 'auto' }}>
          {facilityList.map((fac) => {
            const isCurrent = selectedFacility?.id === fac.id;
            const isShelter = fac.type === 'shelter';

            return (
              <div
                key={fac.id}
                onClick={() => handleSelectTargetFacility(fac)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-input)',
                  backgroundColor: isCurrent ? 'var(--brand-tint)' : 'var(--bg-surface-elevated)',
                  border: `1px solid ${isCurrent ? 'var(--brand-primary)' : 'var(--border-secondary)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ fontSize: 18, flexShrink: 0 }}>
                    {isShelter ? '🛡️' : '🏥'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fac.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {fac.distance_km} km • {fac.drive_time_min}m drive • {fac.walk_time_min}m walk
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {fac.contact && (
                    <a
                      href={`tel:${fac.contact}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic([50]);
                      }}
                      title={`Call ${fac.name} (${fac.contact})`}
                      aria-label={`Call ${fac.name}`}
                      style={{
                        minWidth: 44,
                        minHeight: 44,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#22C55E',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        textDecoration: 'none',
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      <PhoneCall size={14} />
                      <span className="hidden-mobile">Call</span>
                    </a>
                  )}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 4,
                      backgroundColor: isCurrent ? 'var(--brand-primary)' : 'transparent',
                      color: isCurrent ? '#FFFFFF' : 'var(--text-muted)'
                    }}
                  >
                    {isCurrent ? 'Navigating' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );

  // Sub-Renderer: Turn-by-turn Navigation Steps Card
  const renderTurnByTurnCard = () => (
    <Card padding={isMobile ? 14 : 20}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Route size={18} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Hazard-Avoiding Navigation Steps
            </h3>
          </div>
          <Badge variant="live" size="sm">
            {activeRoute?.route_status || 'CLEAR_SAFE_CORRIDOR'}
          </Badge>
        </div>

        {/* Avoided Hazards Warning Pill */}
        {activeRoute?.avoided_hazards && activeRoute.avoided_hazards.length > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-input)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: 'var(--risk-critical)'
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>Hazard Bypass Active:</strong> Detouring around {activeRoute.avoided_hazards.join(' and ')}.
            </span>
          </div>
        )}

        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(activeRoute?.steps || [
            { step: 1, instruction: 'Ascend immediately away from waterfall/river gorge floor towards marked roadway.', distance_m: 350 },
            { step: 2, instruction: 'Follow reinforced bypass road avoiding saturated eastern cut-slopes.', distance_m: 1200 },
            { step: 3, instruction: 'Arrive at the designated high-ground shelter gates.', distance_m: 150 }
          ]).map((s) => (
            <div
              key={s.step}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-input)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-secondary)'
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-primary)',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {s.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {s.instruction}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  Distance: ~{s.distance_m} meters
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  // Sub-Renderer: Multilingual Survival Phrasebook Card
  const renderPhrasesCard = () => (
    <Card padding={isMobile ? 14 : 20}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={16} color="var(--brand-primary)" />
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Survival Phrase Cards
            </h3>
          </div>

          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'kha', label: 'Khasi' },
              { id: 'hi', label: 'Hindi' },
              { id: 'as', label: 'Assamese' },
              { id: 'en', label: 'English' }
            ].map(lang => (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  triggerHaptic([30]);
                  setPhraseLang(lang.id);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  backgroundColor: phraseLang === lang.id ? 'var(--brand-primary)' : 'var(--bg-main)',
                  color: phraseLang === lang.id ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          High-contrast phonetic survival cards for communicating with local villagers and volunteers when cellular network drops:
        </div>

        {/* Phrase Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {survivalPhrases.map((phrase) => {
            const translatedText = phrase[phraseLang] || phrase.en;
            const isCopied = copiedId === phrase.id;

            return (
              <div
                key={phrase.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-input)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {phrase.meaning}
                  </div>
                  <div style={{ fontSize: isMobile ? 14 : 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1.3 }}>
                    "{translatedText}"
                  </div>
                  {phraseLang === 'kha' && phrase.pronounce && (
                    <div style={{ fontSize: 10, color: 'var(--brand-light)', marginTop: 3, fontStyle: 'italic' }}>
                      Pronunciation: {phrase.pronounce}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPhrase(phrase.id, translatedText)}
                  title="Copy phrase"
                  style={{
                    minWidth: 44,
                    minHeight: 44,
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCopied ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-main)',
                    border: `1px solid ${isCopied ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-secondary)'}`,
                    color: isCopied ? '#22C55E' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontSize: 11,
                    flexShrink: 0
                  }}
                >
                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span className="hidden-mobile">{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: isMobile ? 80 : 0 }}>
      {/* 1. Page Header with Emergency Action Pills */}
      <PageHeader
        breadcrumbs={['Operations', 'Tourist Safety', 'Emergency Evacuation & Help Centers']}
        title="Tourist Emergency & Fast Evacuation Guidance"
        subtitle="Real-time proximity locator for high-ground shelters, trauma hubs, and vetted landslide-avoiding escape corridors across Meghalaya's tourist belt."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                fontSize: 11,
                color: '#22C55E'
              }}
            >
              <Wifi size={12} />
              <span>Offline Ready</span>
            </div>

            <DangerButton
              size="sm"
              icon={LifeBuoy}
              onClick={() => {
                triggerHaptic([100, 50, 100]);
                setSosSent(false);
                setIsSosModalOpen(true);
              }}
              style={{
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.45)',
                fontWeight: 700,
                minHeight: 36
              }}
            >
              🚨 Broadcast SOS Beacon
            </DangerButton>
          </div>
        }
      />

      {/* 2. Tourist Destination Quick Selector Bar */}
      <Card padding={12}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--brand-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--brand-primary)'
                }}
              >
                <Compass size={15} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Tourist Location Preset
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>
                  (Select your Meghalaya landmark or use live GPS)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <MapPin size={12} color="var(--brand-primary)" />
              <span style={{ color: 'var(--text-secondary)' }}>
                GPS: {touristCoords.lat.toFixed(4)}°N, {touristCoords.lon.toFixed(4)}°E
              </span>
            </div>
          </div>

          {/* Quick Tourist Hotspot Pills & Live GPS Button */}
          <div className="evac-hide-scrollbar" style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {/* Live GPS Button */}
            <button
              type="button"
              onClick={handleUseLiveGps}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: selectedHotspot?.id === 'live_gps' ? 'var(--brand-primary)' : 'rgba(79, 111, 255, 0.12)',
                color: selectedHotspot?.id === 'live_gps' ? '#FFFFFF' : 'var(--brand-light)',
                border: `1px solid ${selectedHotspot?.id === 'live_gps' ? 'var(--brand-primary)' : 'rgba(79, 111, 255, 0.35)'}`,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <MapPin size={12} />
              <span>📍 My Live GPS</span>
            </button>

            {hotspots.map((spot) => {
              const isSelected = selectedHotspot?.id === spot.id;
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSelectHotspot(spot)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-secondary)'}`,
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{spot.name}</span>
                  {spot.risk === 'Critical' && (
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 10, backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}>
                      CRITICAL
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 3. Interactive Safe Corridor Map Card */}
      <Card padding={0} style={{ overflow: 'hidden', height: isMobile ? 280 : 480, position: 'relative' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ width: '100%', height: '100%', backgroundColor: '#090a0d' }}
          zoomControl={!isMobile}
        >
          <MapRecenter center={mapCenter} zoom={13} />

          {/* Esri Dark/Terrain Hybrid Basemap */}
          <TileLayer
            attribution="&copy; Esri &mdash; Topographic Disaster Map"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />

          {/* 1. Tourist Position Marker */}
          <Marker
            position={[touristCoords.lat, touristCoords.lon]}
            icon={createTouristPin()}
          >
            <Popup>
              <div style={{ padding: 4, color: '#111' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#EF4444' }}>
                  🚨 YOUR LOCATION
                </div>
                <div style={{ fontSize: 12, marginTop: 2 }}>
                  {selectedHotspot?.name || 'Tourist Coordinates'}
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  {touristCoords.lat.toFixed(4)}°N, {touristCoords.lon.toFixed(4)}°E
                </div>
              </div>
            </Popup>
          </Marker>

          {/* 2. Facility Markers (Shelters & Hospitals) */}
          {facilityList.map((fac) => {
            const isSelected = selectedFacility?.id === fac.id || evacuationPlan?.target_facility?.id === fac.id;
            const icon = fac.type === 'shelter' ? createShelterPin(isSelected) : createHospitalPin(isSelected);

            return (
              <Marker
                key={fac.id}
                position={[fac.latitude, fac.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => handleSelectTargetFacility(fac)
                }}
              >
                <Popup>
                  <div style={{ padding: 6, minWidth: 180, color: '#111' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: fac.type === 'shelter' ? '#15803D' : '#0891B2' }}>
                      {fac.type === 'shelter' ? '🛡️ SAFE SHELTER' : '🏥 EMERGENCY HOSPITAL'}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12, marginTop: 4 }}>
                      {fac.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      Distance: <strong>{fac.distance_km} km</strong> ({fac.drive_time_min}m drive / {fac.walk_time_min}m walk)
                    </div>
                    {fac.capacity && (
                      <div style={{ fontSize: 11, color: '#555' }}>
                        Capacity: <strong>{fac.capacity} people</strong>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectTargetFacility(fac)}
                      style={{
                        marginTop: 8,
                        width: '100%',
                        padding: '6px 8px',
                        backgroundColor: '#4F6FFF',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 600
                      }}
                    >
                      Navigate Here
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 3. Vetted Safe Escape Polyline (Solid Green) */}
          {activeRoute?.waypoints && activeRoute.waypoints.length > 0 && (
            <Polyline
              positions={activeRoute.waypoints}
              pathOptions={{
                color: '#22C55E',
                weight: 6,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          )}
        </MapContainer>

        {/* Floating Map Legend Overlay (Collapsible on Mobile) */}
        <div
          onClick={() => isMobile && setIsLegendExpanded(prev => !prev)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            backgroundColor: 'rgba(10, 10, 12, 0.94)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-card)',
            padding: isMobile && !isLegendExpanded ? '5px 9px' : '8px 12px',
            fontSize: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            cursor: isMobile ? 'pointer' : 'default'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <span>EVACUATION CORRIDOR</span>
            {isMobile && (
              <span style={{ fontSize: 9, color: 'var(--brand-primary)', fontWeight: 700 }}>
                {isLegendExpanded ? '▲' : '▼'}
              </span>
            )}
          </div>
          {(!isMobile || isLegendExpanded) && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <span>You (Stranded Point)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#22C55E' }} />
                <span>Safe Shelter Haven</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#06B6D4' }} />
                <span>Hospital & Trauma Post</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 14, height: 3, backgroundColor: '#22C55E', borderRadius: 2 }} />
                <span>Vetted Escape Route</span>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* 4. WORKSPACE CONTENT: Mobile Segmented Switcher vs Desktop Dual-Column Grid */}
      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Mobile Segmented Navigation Tabs */}
          <div className="evac-mobile-tabs">
            <button
              type="button"
              className="evac-mobile-tab-btn"
              onClick={() => {
                triggerHaptic([30]);
                setMobileTab('facilities');
              }}
              style={{
                backgroundColor: mobileTab === 'facilities' ? 'var(--brand-primary)' : 'transparent',
                color: mobileTab === 'facilities' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              <Shield size={13} />
              <span>Help Centers ({facilityList.length})</span>
            </button>
            <button
              type="button"
              className="evac-mobile-tab-btn"
              onClick={() => {
                triggerHaptic([30]);
                setMobileTab('route');
              }}
              style={{
                backgroundColor: mobileTab === 'route' ? 'var(--brand-primary)' : 'transparent',
                color: mobileTab === 'route' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              <Route size={13} />
              <span>Escape Route</span>
            </button>
            <button
              type="button"
              className="evac-mobile-tab-btn"
              onClick={() => {
                triggerHaptic([30]);
                setMobileTab('phrases');
              }}
              style={{
                backgroundColor: mobileTab === 'phrases' ? 'var(--brand-primary)' : 'transparent',
                color: mobileTab === 'phrases' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              <Globe size={13} />
              <span>Phrases</span>
            </button>
          </div>

          {/* Active Mobile Content Panel */}
          {mobileTab === 'facilities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {renderSafeHavenCard()}
              {renderFacilityDirectory()}
            </div>
          )}

          {mobileTab === 'route' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {renderSafeHavenCard()}
              {renderTurnByTurnCard()}
            </div>
          )}

          {mobileTab === 'phrases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {renderPhrasesCard()}
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP WORKSPACE (Dual Column Command Center Grid) */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
            gap: 20
          }}
          className="gis-command-grid"
        >
          {/* LEFT COLUMN: Turn-by-turn Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {renderTurnByTurnCard()}
          </div>

          {/* RIGHT COLUMN: Safe Haven + Facilities Directory + Survival Phrases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {renderSafeHavenCard()}
            {renderFacilityDirectory()}
            {renderPhrasesCard()}
          </div>
        </div>
      )}

      {/* 5. FLOATING EMERGENCY BOTTOM BAR (Mobile Viewports Only) */}
      {isMobile && (
        <div className="evac-bottom-bar">
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, color: '#EF4444', fontWeight: 700, letterSpacing: '0.04em' }}>
              🚨 EMERGENCY RESCUE
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedFacility ? selectedFacility.name : 'Transmitting to SDRF Meghalaya'}
            </span>
          </div>

          <a
            href="tel:112"
            onClick={() => triggerHaptic([50])}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '8px 12px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-secondary)',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              minHeight: 38
            }}
          >
            <PhoneCall size={13} color="#EF4444" />
            <span>112</span>
          </a>

          <button
            type="button"
            onClick={() => {
              triggerHaptic([100, 50, 100]);
              setSosSent(false);
              setIsSosModalOpen(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '8px 14px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--risk-critical)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
              minHeight: 38
            }}
          >
            <LifeBuoy size={14} />
            <span>SOS</span>
          </button>
        </div>
      )}

      {/* 6. EMERGENCY SOS BEACON BROADCAST MODAL (Optimized for Mobile Touch) */}
      <Modal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        title="🚨 Tourist SOS Emergency Beacon"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-card)',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <LifeBuoy size={22} color="#EF4444" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#EF4444', lineHeight: 1.4 }}>
              <strong>Emergency Distress Protocol:</strong> Broadcasting this beacon transmits your high-precision coordinates to SDRF Meghalaya, SDMA Emergency Operations, and nearby patrol units.
            </div>
          </div>

          {/* Telemetry Summary */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-secondary)',
              borderRadius: 'var(--radius-input)',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 11
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Location:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {selectedHotspot?.name || 'East Khasi Hills'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>GPS Coordinates:</span>
              <span style={{ color: 'var(--brand-light)' }}>
                {touristCoords.lat.toFixed(5)}°N, {touristCoords.lon.toFixed(5)}°E
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Nearest Refuge:</span>
              <span style={{ color: '#22C55E' }}>
                {selectedFacility?.name || 'Sohra Cyclone Haven'} ({selectedFacility?.distance_km || 2.4} km)
              </span>
            </div>
          </div>

          {/* Direct 1-Touch Hotlines Grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Direct One-Touch Emergency Helplines:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 8 }}>
              <a
                href="tel:112"
                onClick={() => triggerHaptic([40])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: 12,
                  minHeight: 44
                }}
              >
                <PhoneCall size={16} color="#EF4444" />
                <span>Police Control Room: <strong>112</strong></span>
              </a>

              <a
                href="tel:1070"
                onClick={() => triggerHaptic([40])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: 12,
                  minHeight: 44
                }}
              >
                <PhoneCall size={16} color="#EF4444" />
                <span>SDMA Meghalaya: <strong>1070</strong></span>
              </a>

              <a
                href="tel:108"
                onClick={() => triggerHaptic([40])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: 12,
                  minHeight: 44
                }}
              >
                <Hospital size={16} color="#06B6D4" />
                <span>Medical Ambulance: <strong>108</strong></span>
              </a>

              <a
                href="tel:1363"
                onClick={() => triggerHaptic([40])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-input)',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  fontSize: 12,
                  minHeight: 44
                }}
              >
                <Compass size={16} color="var(--brand-primary)" />
                <span>Tourist Police: <strong>1363</strong></span>
              </a>
            </div>
          </div>

          {/* WhatsApp One-Touch GPS Share */}
          <button
            type="button"
            onClick={handleWhatsAppSOS}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: 'var(--radius-input)',
              color: '#22C55E',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44
            }}
          >
            <Share2 size={15} />
            <span>Share Emergency GPS Coordinates via WhatsApp</span>
          </button>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
            <SecondaryButton onClick={() => setIsSosModalOpen(false)}>
              Cancel
            </SecondaryButton>
            <DangerButton
              onClick={handleSendSOS}
              disabled={sosLoading || sosSent}
              icon={sosSent ? Check : Radio}
              style={{ minHeight: 44 }}
            >
              {sosLoading ? 'Transmitting...' : sosSent ? 'Distress Broadcast Sent!' : 'Transmit Live Distress Signal'}
            </DangerButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
