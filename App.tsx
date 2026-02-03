
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icons, SAMPLE_OREUMS, SAMPLE_COUPONS } from './constants';
import { RecommendationResponse, Oreum, ClimbSession, PurchasedCoupon } from './types';
import { getOreumRecommendations, getJejuWeather } from './services/geminiService';

const translations = {
  ko: {
    tab_home: '홈',
    tab_climb: '등반 시작',
    tab_ai: '오름피커',
    tab_shop: '상점',
    tab_collection: '라이브러리',
    hero_status: 'SENTINEL-2 위성 활성화',
    home_recommended: '여유로운 탐사 추천',
    home_coupons: '탐험가를 위한 혜택',
    home_ai_picker: '오름피커 🔍',
    climb_start: '오름 등반 시작 ⛰️',
    climb_subtitle: '제주도의 오름을 같이 알아봐요 !',
    climb_progress: '정상까지 남은 거리',
    climb_finish: '등반 완료!',
    climb_completed_tag: '등반 완료',
    reviews_title: '탐방객 후기',
    reviews_placeholder: '이 오름의 매력을 공유해주세요...',
    reviews_locked: '등반을 완료해야 작성할 수 있습니다.',
    reviews_quota_exceeded: '등반 횟수만큼만 작성 가능합니다.',
    reviews_empty: '아직 후기가 없습니다.',
    reviews_submit: '게시',
    reviews_reward_hint: '작성 시 100P 지급 🎁',
    climb_action_finish: '등반 완료',
    climb_verifying: '잠시 후 등반이 완료 됩니다 !\n(위성 데이터 동기화 중...)',
    wallet_title: '내 지갑',
    wallet_total: '보유 포인트',
    wallet_history: '포인트 상세 내역',
    wallet_empty: '아직 내역이 없습니다.',
    ranking_title: '실시간 명예의 전당 🏆',
    ranking_empty: '아직 기록된 랭커가 없습니다.',
    review_reward_msg: '후기 보상 100P가 적립되었습니다.',
    my_climb_stats: '나의 등반 기록',
    shop_title: '오름 포인트 상점 🛒',
    shop_subtitle: '포인트로 제휴 쿠폰을 교환하세요 !',
    shop_buy: '교환하기',
    shop_owned: '보유 중',
    shop_insufficient: '포인트가 부족합니다.',
    shop_success: '교환 완료! 쿠폰함에서 확인하세요.',
    coupon_box_title: '나의 쿠폰함',
    coupon_box_empty: '보유한 쿠폰이 없습니다.',
    open_coupon_box: '쿠폰함 열기',
    coupon_use_now: '지금 사용하기',
    profile_name_default: '제주 탐험가님',
    profile_points: '보유 포인트',
    profile_climb_count: '등반한 오름',
    ai_recommend_title: '오름피커 🔍',
    ai_recommend_subtitle: '당신이 가고싶은 분위기에 오름을 찾아보세요 !',
    view_more: '더보기',
    climb_search_placeholder: '어떤 오름을 찾으시나요 ?',
    climb_search_empty: '검색 결과가 없습니다.',
    name_edit_placeholder: '새로운 이름을 입력하세요',
    name_edit_title: '이름 수정',
    name_edit_save: '저장하기',
    live_hikers: '등반 중',
    refresh_msg: '실시간 탐사 데이터를 동기화합니다...',
    my_climb_count_label: '내 등반',
    goto_coupon_box: '쿠폰함 바로가기',
    wallet_close: '닫기',
    coupon_used_success: '사용이 완료되었습니다 !',
    difficulty_label: '난이도',
    est_time_label: '소요 시간',
    evi_label: '식생 지수',
    hiker_sync_msg: '탐방객 동기화 중',
    location_label: '위치',
    desc_label: '설명',
    climb_stats_title: '나의 탐방 기록 📝',
    best_record_label: 'BEST'
  },
  en: {
    tab_home: 'Home',
    tab_climb: 'Start Climb',
    tab_ai: 'Oreum Picker',
    tab_shop: 'Shop',
    tab_collection: 'Library',
    hero_status: 'SENTINEL-2 ACTIVE',
    home_recommended: 'Quiet Exploration',
    home_coupons: 'Featured Benefits',
    home_ai_picker: 'Oreum Picker 🔍',
    climb_start: 'Start Climbing ⛰️',
    climb_subtitle: "Let's explore Jeju's Oreums together!",
    climb_progress: 'Distance to Summit',
    climb_finish: 'Summit Reached!',
    climb_completed_tag: 'Completed',
    reviews_title: 'Reviews',
    reviews_placeholder: 'Share your thoughts...',
    reviews_locked: 'Climb required to review.',
    reviews_quota_exceeded: 'Quota reached (1 per climb).',
    reviews_empty: 'No reviews yet.',
    reviews_submit: 'Post',
    reviews_reward_hint: 'Get 100P Reward 🎁',
    climb_action_finish: 'Finish',
    climb_verifying: 'Climb finishing soon...\n(Syncing with Satellite...)',
    wallet_title: 'Wallet',
    wallet_total: 'Balance',
    wallet_history: 'History',
    wallet_empty: 'No history.',
    ranking_title: 'Hall of Fame 🏆',
    ranking_empty: 'No records yet.',
    review_reward_msg: '100P rewarded for review.',
    my_climb_stats: 'Stats',
    shop_title: 'Point Shop 🛒',
    shop_subtitle: 'Redeem points for coupons!',
    shop_buy: 'Exchange',
    shop_owned: 'Owned',
    shop_insufficient: 'Insufficient points.',
    shop_success: 'Exchanged! Check Coupon Box.',
    coupon_box_title: 'Coupon Box',
    coupon_box_empty: 'Empty.',
    open_coupon_box: 'Open Box',
    coupon_use_now: 'Use Now',
    profile_name_default: 'Jeju Explorer',
    profile_points: 'Total Points',
    profile_climb_count: 'Oreums Climbed',
    ai_recommend_title: 'Oreum Picker 🔍',
    ai_recommend_subtitle: 'Find an oreum for the mood you want!',
    view_more: 'More',
    climb_search_placeholder: 'Search oreum name...',
    climb_search_empty: 'No results found.',
    name_edit_placeholder: 'Enter new name',
    name_edit_title: 'Edit Name',
    name_edit_save: 'Save Changes',
    live_hikers: 'Climbing',
    refresh_msg: 'Syncing live exploration data...',
    my_climb_count_label: 'My Climbs',
    goto_coupon_box: 'Go to Coupon Box',
    wallet_close: 'Close',
    coupon_used_success: 'Usage complete!',
    difficulty_label: 'Difficulty',
    est_time_label: 'Est. Time',
    evi_label: 'NDVI/EVI',
    hiker_sync_msg: 'Hikers Synced',
    location_label: 'Location',
    desc_label: 'Description',
    climb_stats_title: 'My Trek Records 📝',
    best_record_label: 'BEST'
  }
};

const BottomNavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-full transition-all duration-300 active-scale ${active ? 'text-blue-500' : 'text-gray-500'}`}
  >
    <div className={`mb-1.5 transition-all ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'scale-100'}`}>{icon}</div>
    <span className={`text-[9px] font-bold tracking-tight leading-none ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const t = translations[lang];
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeTab, setActiveTab] = useState<'home' | 'climb' | 'ai' | 'shop' | 'collection'>('home');
  const [selectedOreum, setSelectedOreum] = useState<Oreum | null>(null);
  
  const [userName, setUserName] = useState(t.profile_name_default);
  const [isNameEditOpen, setIsNameEditOpen] = useState(false);
  const [newNameInput, setNewNameInput] = useState('');

  const [totalPoints, setTotalPoints] = useState(4000); 
  const [pointHistory, setPointHistory] = useState<any[]>([]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCouponBoxOpen, setIsCouponBoxOpen] = useState(false);
  
  const [purchasedCoupons, setPurchasedCoupons] = useState<PurchasedCoupon[]>([]);
  const [usedCoupons, setUsedCoupons] = useState<number[]>([]);
  const [activeCouponDetail, setActiveCouponDetail] = useState<(PurchasedCoupon & any) | null>(null);

  const [climbCounts, setClimbCounts] = useState<Record<string, number>>({});
  const [completedRecords, setCompletedRecords] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, any[]>>({});
  const [reviewInput, setReviewInput] = useState('');

  const [isRefreshingRecs, setIsRefreshingRecs] = useState(false);

  const [liveHikers, setLiveHikers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SAMPLE_OREUMS.forEach(o => {
      initial[o.id] = o.hikerCount || Math.floor(Math.random() * 50) + 10;
    });
    return initial;
  });

  const refreshLiveHikers = useCallback(() => {
    setIsRefreshingRecs(true);
    showToast(t.refresh_msg, 'success');
    
    setTimeout(() => {
      setLiveHikers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          next[id] = Math.max(1, Math.floor(Math.random() * 120) + 5);
        });
        return next;
      });
      setIsRefreshingRecs(false);
    }, 1200);
  }, [t.refresh_msg]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveHikers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          const change = Math.floor(Math.random() * 5) - 2; 
          next[id] = Math.max(1, next[id] + change);
        });
        return next;
      });
    }, 15000); 
    return () => clearInterval(interval);
  }, []);

  const recommendedOreums = useMemo(() => {
    return [...SAMPLE_OREUMS]
      .sort((a, b) => {
        const countA = liveHikers[a.id] || 0;
        const countB = liveHikers[b.id] || 0;
        return countA - countB;
      })
      .slice(0, 8); 
  }, [liveHikers]);

  const homeRecommendedShopItems = useMemo(() => {
    return SAMPLE_COUPONS.slice(0, 4);
  }, []);

  const [climbSearchQuery, setClimbSearchQuery] = useState('');

  const [modalDragY, setModalDragY] = useState(0);
  const modalTouchStartY = useRef(0);
  const modalScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingModal = useRef(false);

  const handleModalTouchStart = (e: React.TouchEvent) => {
    modalTouchStartY.current = e.touches[0].pageY;
    isDraggingModal.current = false;
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].pageY;
    const deltaY = currentY - modalTouchStartY.current;
    if (modalScrollRef.current && modalScrollRef.current.scrollTop <= 0 && deltaY > 0) {
      isDraggingModal.current = true;
      setModalDragY(deltaY);
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleModalTouchEnd = () => {
    if (modalDragY > 150) setSelectedOreum(null);
    setModalDragY(0);
    isDraggingModal.current = false;
  };

  const [rankings, setRankings] = useState<Record<string, any[]>>(() => {
    const initial: Record<string, any[]> = {};
    SAMPLE_OREUMS.forEach(o => {
      initial[o.id] = [
        { username: 'JejuExplorer', time: 145.2, date: '2024.03.10' },
        { username: 'MountainLover', time: 188.5, date: '2024.03.12' },
        { username: 'WindyJeju', time: 210.3, date: '2024.03.15' },
        { username: 'BlueSea', time: 245.1, date: '2024.03.18' },
        { username: 'OrangeFarm', time: 290.8, date: '2024.03.20' }
      ].sort((a, b) => a.time - b.time);
    });
    return initial;
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({ message: '', type: null });
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const [session, setSession] = useState<ClimbSession>({
    isActive: false, targetOreum: null, startTime: null, endTime: null, currentLat: null, currentLng: null, distanceToSummit: 0, isCompleted: false
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const initialDistanceRef = useRef<number>(0);

  const formatTimeFull = (seconds: number | undefined) => {
    if (seconds === undefined) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startClimbing = (oreum: Oreum) => {
    initialDistanceRef.current = oreum.height * 2.5;
    setSession({ isActive: true, targetOreum: oreum, startTime: Date.now(), endTime: null, currentLat: null, currentLng: null, distanceToSummit: initialDistanceRef.current, isCompleted: false });
    setElapsedTime(0); setActiveTab('climb');
  };

  const finishClimbing = (finalTime: number) => {
    if (session.targetOreum) {
      const oreum = session.targetOreum;
      const reward = 300;
      setTotalPoints(prev => prev + reward);
      const oreumName = lang === 'ko' ? oreum.name : oreum.name_en;
      setPointHistory(prev => [{ id: Date.now(), oreumName: `${oreumName} 등반 보상`, points: reward, date: new Date().toLocaleString() }, ...prev]);
      setClimbCounts(prev => ({ ...prev, [oreum.id]: (prev[oreum.id] || 0) + 1 }));
      setCompletedRecords(prev => ({ ...prev, [oreum.id]: (prev[oreum.id] === undefined || finalTime < prev[oreum.id]) ? finalTime : prev[oreum.id] }));
      const newRank = { username: userName, time: finalTime, date: new Date().toLocaleDateString() };
      setRankings(prev => ({ ...prev, [oreum.id]: [...(prev[oreum.id] || []), newRank].sort((a, b) => a.time - b.time).slice(0, 10) }));
    }
    setSession(prev => ({ ...prev, isCompleted: true, endTime: Date.now(), distanceToSummit: 0 }));
    setIsVerifying(false);
  };

  const handlePurchase = (coupon: any) => {
    if (totalPoints < coupon.price) {
      showToast(t.shop_insufficient, 'error');
    } else {
      setTotalPoints(prev => prev - coupon.price);
      const couponName = lang === 'ko' ? coupon.name : coupon.name_en;
      setPointHistory(prev => [{ id: Date.now(), oreumName: `쿠폰 교환: ${couponName}`, points: coupon.price, date: new Date().toLocaleString(), isSpending: true }, ...prev]);
      setPurchasedCoupons(prev => [...prev, { id: coupon.id, instanceId: Date.now() }]);
      showToast(t.shop_success, 'success');
    }
  };

  const handleAddReview = () => {
    if (!selectedOreum || !reviewInput.trim()) return;
    const count = climbCounts[selectedOreum.id] || 0;
    const userRev = (reviews[selectedOreum.id] || []).filter(r => r.isUser).length;
    if (count === 0) { showToast(t.reviews_locked, 'error'); return; }
    if (userRev >= count) { showToast(t.reviews_quota_exceeded, 'error'); return; }
    setTotalPoints(p => p + 100);
    const oreumName = lang === 'ko' ? selectedOreum.name : selectedOreum.name_en;
    setPointHistory(p => [{ id: Date.now(), oreumName: `${oreumName} 후기 보상`, points: 100, date: new Date().toLocaleString() }, ...p]);
    setReviews(p => ({ ...p, [selectedOreum.id]: [{ id: Date.now(), text: reviewInput, date: new Date().toLocaleDateString(), isUser: true }, ...(p[selectedOreum.id] || [])] }));
    setReviewInput('');
    showToast(t.review_reward_msg, 'success');
  };

  useEffect(() => {
    if (session.isActive && !session.isCompleted && !isVerifying) {
      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 0.1;
          const ratio = Math.min(1, next / 10); 
          const newDistance = Math.max(0, initialDistanceRef.current * (1 - ratio));
          if (newDistance === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsVerifying(true);
            setTimeout(() => finishClimbing(next), 2000);
            return next;
          }
          setSession(s => ({ ...s, distanceToSummit: newDistance }));
          return next;
        });
      }, 100);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session.isActive, session.isCompleted, isVerifying, userName, lang]);

  const themeClasses = {
    bg: theme === 'dark' ? 'bg-black' : 'bg-gray-50',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    card: theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm',
    nav: theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white/80 border-gray-200',
    input: theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-gray-900'
  };

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);

  const handleAiRecommend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setRecommendations(null);
    try {
      const res = await getOreumRecommendations(query, SAMPLE_OREUMS.map(o => ({ name: o.name, name_en: o.name_en })), lang);
      if (res && res.suggestedOreums) {
        setRecommendations(res);
      } else {
        showToast(lang === 'ko' ? "유효한 추천 결과를 받지 못했습니다." : "Failed to receive valid recommendations.", "error");
      }
    } catch (e: any) { 
      console.error(e);
      showToast(e.message || "AI 추천 중 오류가 발생했습니다.", "error");
    } finally { setLoading(false); }
  };

  const handleNameSave = () => {
    if (!newNameInput.trim()) return;
    setUserName(newNameInput.trim());
    setIsNameEditOpen(false);
    showToast(lang === 'ko' ? "이름이 성공적으로 변경되었습니다." : "Name changed successfully.", "success");
  };

  const filteredOreums = SAMPLE_OREUMS.filter(o => {
    const searchTarget = lang === 'ko' ? o.name : o.name_en;
    return searchTarget.toLowerCase().includes(climbSearchQuery.toLowerCase());
  });

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}>
      {toast.type && (
        <div className="fixed top-12 left-0 right-0 z-[300] px-6 pointer-events-none">
          <div className={`mx-auto max-w-xs p-4 rounded-3xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-full duration-500 ${toast.type === 'success' ? 'bg-blue-600' : 'bg-orange-600'} text-white`}>
            <div className="shrink-0">{toast.type === 'success' ? <Icons.Check /> : <Icons.X />}</div>
            <p className="text-xs font-black">{toast.message}</p>
          </div>
        </div>
      )}

      <main className="flex-1 tab-content overflow-y-auto no-scrollbar scroll-smooth">
        {activeTab === 'home' && (
          <div className="p-6 pb-28 space-y-12 pt-10 animate-in fade-in duration-500">
            <header className="flex justify-between items-start">
              <div className="flex flex-col items-start px-1">
                <h1 className={`text-3xl font-black tracking-tighter mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {lang === 'ko' ? '어디오름?' : 'Where Oreum?'}
                </h1>
                <p className="text-blue-500/60 text-[10px] font-black tracking-[0.2em] uppercase">JEJU OREUM EXPLORER</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-lg ${themeClasses.card} text-blue-500`}>
                  <Icons.Globe />
                  <span className="sr-only">Toggle Language</span>
                </button>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-lg ${themeClasses.card}`}>{theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}</button>
                <button onClick={() => setIsWalletOpen(true)} className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-lg ${themeClasses.card} text-blue-500`}><Icons.Wallet /></button>
              </div>
            </header>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{t.home_recommended}</h2>
                </div>
                <button 
                  onClick={refreshLiveHikers} 
                  disabled={isRefreshingRecs} 
                  className={`group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 active-scale shadow-sm ${themeClasses.card} ${isRefreshingRecs ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isRefreshingRecs ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'}`}></span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isRefreshingRecs ? 'text-blue-500' : 'opacity-40'}`}>
                    {isRefreshingRecs ? 'Syncing' : 'Live'}
                  </span>
                  <div className={`transition-transform duration-500 ${isRefreshingRecs ? 'animate-spin text-blue-500' : 'opacity-30 group-hover:rotate-180 group-hover:opacity-100'}`}>
                    <Icons.Refresh />
                  </div>
                </button>
              </div>
              <div className="relative">
                {isRefreshingRecs && (
                   <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[3.5rem] bg-white/20 dark:bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300">
                     <div className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl animate-bounce">SYNCING LIVE SATELLITE...</div>
                   </div>
                )}
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6 py-4">
                  {recommendedOreums.map(o => (
                    <div key={o.id} onClick={() => setSelectedOreum(o)} className="min-w-[200px] h-[280px] relative rounded-[2.5rem] overflow-hidden active-scale shadow-2xl cursor-pointer group snap-center">
                      <img src={o.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${(liveHikers[o.id] || 0) < 30 ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                          <span className="text-white text-[8px] font-black uppercase tracking-widest leading-none">EVI {o.evi} • {liveHikers[o.id] || 0} {t.live_hikers}</span>
                        </div>
                        <h3 className="text-white font-black text-xl leading-none mb-1 tracking-tighter">{lang === 'ko' ? o.name : o.name_en}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-2xl font-black uppercase tracking-tight">{t.home_coupons}</h2>
                <button onClick={() => setActiveTab('shop')} className="text-blue-500 text-[11px] font-black uppercase tracking-widest active-scale">{t.view_more}</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {homeRecommendedShopItems.map(item => (
                  <div key={item.id} onClick={() => setActiveTab('shop')} className={`p-4 rounded-[2rem] border flex flex-col gap-3 active-scale cursor-pointer transition-all ${themeClasses.card}`}>
                    <div className="w-full aspect-square rounded-2xl overflow-hidden">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="px-1">
                      <div className="text-blue-500 text-[9px] font-black uppercase mb-1">{lang === 'ko' ? item.partner : item.partner_en}</div>
                      <h3 className="text-xs font-black leading-tight line-clamp-1">{lang === 'ko' ? item.name : item.name_en}</h3>
                      <div className="text-sm font-black text-blue-600 tracking-tighter mt-1">{item.price.toLocaleString()}P</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-6 pt-10 pb-28 space-y-12 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-black uppercase leading-tight tracking-tighter">{t.ai_recommend_title}</h2>
              <p className="opacity-50 text-[10px] font-black uppercase tracking-widest mt-2">{t.ai_recommend_subtitle}</p>
            </div>
            <div className={`p-2 rounded-3xl flex items-center gap-2 border ${themeClasses.input} shadow-xl shadow-blue-500/5`}>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && handleAiRecommend()} className="bg-transparent flex-1 p-4 outline-none font-bold text-sm" placeholder={lang === 'ko' ? "오늘 가고 싶은 오름 분위기는?" : "Mood you want today?"} />
              <button onClick={handleAiRecommend} disabled={loading} className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg active-scale">
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Search />}
              </button>
            </div>

            {loading && (
              <div className="py-20 flex flex-col items-center gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <p className="text-sm font-black text-blue-500 uppercase tracking-widest text-center px-6">
                  {lang === 'ko' ? "AI가 최적의 오름을 분석하고 있습니다..." : "AI is analyzing the best oreums..."}
                </p>
              </div>
            )}

            {!loading && !recommendations && (
              <section className="space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-2xl font-black uppercase tracking-tight">{lang === 'ko' ? '오늘의 탐사 추천' : "Today's Picks"}</h2>
                </div>
                <div className="grid gap-4">
                  {SAMPLE_OREUMS.slice(0, 5).map(o => (
                    <div key={o.id} onClick={() => setSelectedOreum(o)} className={`p-5 rounded-[2.5rem] border flex items-center gap-5 active-scale cursor-pointer shadow-sm ${themeClasses.card}`}>
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                        <img src={o.imageUrl} className="w-full h-full object-cover" alt={o.name} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black leading-none mb-2 truncate">{lang === 'ko' ? o.name : o.name_en}</h3>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">EVI {o.evi} • {liveHikers[o.id] || 0} {t.live_hikers}</span>
                        </div>
                      </div>
                      <div className="text-blue-500 shrink-0 opacity-40 group-hover:opacity-100"><Icons.Play /></div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {recommendations && (
              <div className="space-y-10 animate-in slide-in-from-bottom-5 duration-700">
                <div className="p-5 bg-blue-600/5 border border-blue-600/10 rounded-[2rem] flex items-center gap-4">
                   <div className="text-blue-500 shrink-0 scale-125"><Icons.Activity /></div>
                   <p className="text-xs font-black leading-relaxed opacity-80">{recommendations.satelliteSummary}</p>
                </div>

                <div className="space-y-8">
                  {recommendations.suggestedOreums.map((r, i) => {
                    const found = SAMPLE_OREUMS.find(o => {
                      const cleanName = r.name.toLowerCase();
                      return o.name.toLowerCase().includes(cleanName) || o.name_en.toLowerCase().includes(cleanName);
                    });
                    
                    return (
                      <div key={i} onClick={() => { if(found) setSelectedOreum(found); }} className={`group relative rounded-[3rem] border overflow-hidden active-scale cursor-pointer shadow-2xl transition-all duration-500 ${themeClasses.card}`}>
                        {found ? (
                          <div className="relative h-64 overflow-hidden">
                            <img src={found.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
                            <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                               <div className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                                 {r.difficulty} {lang === 'ko' ? '난이도' : 'Difficulty'}
                               </div>
                               <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest">{found.height}m</div>
                            </div>
                            <div className="absolute bottom-6 left-8 flex items-center gap-3">
                               <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                               </span>
                               <span className="text-white text-[10px] font-black uppercase tracking-[0.1em]">{liveHikers[found.id] || 0} {t.hiker_sync_msg}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-40 bg-gray-100 dark:bg-white/5 flex flex-col items-center justify-center space-y-2 opacity-60">
                             <div className="text-lg">⛰️</div>
                             <div className="text-[10px] font-black uppercase tracking-widest">Matching Data: {r.name}</div>
                          </div>
                        )}
                        <div className="p-8 space-y-6">
                          <div>
                            <div className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">AI BEST PICK #{i+1}</div>
                            <h3 className="text-3xl font-black tracking-tighter leading-none mb-3">{r.name}</h3>
                            <p className="text-sm font-medium leading-relaxed opacity-70 italic">{r.reason}</p>
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                                <div className="text-[9px] opacity-40 font-black uppercase mb-1">{t.est_time_label}</div>
                                <div className="text-sm font-black tracking-tight">{r.estimatedTime}</div>
                             </div>
                             <div className="flex-1 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                                <div className="text-[9px] opacity-40 font-black uppercase mb-1">{t.evi_label}</div>
                                <div className="text-sm font-black text-emerald-500 tracking-tight">{found?.evi || '0.72'}</div>
                             </div>
                          </div>
                          <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                             <div className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Icons.Check /> {lang === 'ko' ? '탐험 팁!' : 'Explore Tip!'}</div>
                             <p className="text-[11px] font-bold opacity-80">{r.tips}</p>
                          </div>
                          {found && (
                             <div className="text-center pt-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
                                  {lang === 'ko' ? '카드를 눌러 탐방 준비하기 →' : 'Tap to prepare trekking →'}
                                </span>
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'climb' && (
          <div className="p-6 pt-10 pb-28 animate-in slide-in-from-right-10 duration-500 h-full overflow-y-auto no-scrollbar">
            {session.isActive && !session.isCompleted ? (
              <div className="flex flex-col items-center justify-center h-full space-y-12">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-center">{lang === 'ko' ? session.targetOreum?.name : session.targetOreum?.name_en}</h2>
                 
                 <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-blue-600/10" />
                       <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="7" fill="transparent" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={(session.distanceToSummit / (initialDistanceRef.current || 1)) * (2 * Math.PI * 45)} strokeLinecap="round" className="text-blue-600 transition-all duration-500 ease-out" />
                    </svg>

                    <div className="text-center z-10 animate-in fade-in zoom-in duration-700">
                       <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">{t.climb_progress}</div>
                       <div className="flex items-baseline justify-center gap-1">
                          <span className="text-6xl font-black text-blue-600 tracking-tighter">{Math.round(session.distanceToSummit)}</span>
                          <span className="text-xl font-black text-blue-600/50 uppercase">m</span>
                       </div>
                    </div>
                 </div>

                 <div className="w-full max-w-xs space-y-4">
                    <button 
                       onClick={() => { setIsVerifying(true); setTimeout(() => finishClimbing(elapsedTime), 2000); }} 
                       className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase active-scale shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3"
                    >
                       {isVerifying ? (
                          <>
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             <span>{lang === 'ko' ? '인증 중...' : 'Verifying...'}</span>
                          </>
                       ) : t.climb_action_finish}
                    </button>
                    <p className="text-[10px] text-center font-black opacity-30 uppercase tracking-widest">SENTINEL-2 SATELLITE TRACKING ACTIVE</p>
                 </div>
              </div>
            ) : session.isCompleted ? (
               <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl"><Icons.Check /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">{t.climb_finish}</h2>
                  <div className="p-8 rounded-[2.5rem] bg-black/5 w-full mb-8"><div className="text-[10px] opacity-40 font-black uppercase mb-1">{t.est_time_label}</div><div className="text-4xl font-black text-blue-600 tracking-tighter">{elapsedTime.toFixed(1)}s</div></div>
                  
                  <div className="w-full space-y-4">
                    <button 
                      onClick={() => setSession({...session, isCompleted: false, isActive: false})} 
                      className={`w-full py-5 rounded-[2rem] font-black uppercase active-scale shadow-xl transition-colors duration-300 ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                      {lang === 'ko' ? '계속 탐험하기' : 'Continue Explore'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        const target = session.targetOreum;
                        setSession({...session, isCompleted: false, isActive: false});
                        if (target) setSelectedOreum(target);
                      }} 
                      className={`w-full py-3 rounded-[2rem] font-black uppercase text-xs active-scale border-2 transition-all ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}
                    >
                      {lang === 'ko' ? '후기 작성하기' : 'Write a Review'}
                    </button>
                  </div>
               </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">{t.climb_start}</h2>
                  <p className="opacity-50 text-[10px] font-black uppercase tracking-widest mt-2">{t.climb_subtitle}</p>
                </div>
                <div className={`p-2 rounded-2xl border flex items-center gap-3 ${themeClasses.input}`}><div className="pl-3 opacity-40"><Icons.Search /></div><input value={climbSearchQuery} onChange={(e)=>setClimbSearchQuery(e.target.value)} className="bg-transparent flex-1 py-3 outline-none font-bold text-sm" placeholder={t.climb_search_placeholder} /></div>
                <div className="grid gap-4">
                  {filteredOreums.map(o => {
                    const myCount = climbCounts[o.id] || 0;
                    return (
                      <div key={o.id} onClick={() => setSelectedOreum(o)} className={`p-5 rounded-[2rem] border flex items-center gap-5 active-scale cursor-pointer ${themeClasses.card}`}>
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                          <img src={o.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-black leading-none mb-2 truncate">{lang === 'ko' ? o.name : o.name_en}</h3>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              {liveHikers[o.id] || 0} {t.live_hikers}
                            </div>
                            {myCount > 0 && (
                              <div className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {t.my_climb_count_label} {myCount}{lang === 'ko' ? '회' : ' times'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-blue-500 shrink-0"><Icons.Play /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="p-6 pt-10 pb-28 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-start">
              <div><h2 className="text-2xl font-black uppercase leading-tight tracking-tighter">{t.shop_title}</h2><p className="opacity-50 text-[10px] font-black uppercase tracking-widest mt-2">{t.shop_subtitle}</p></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsCouponBoxOpen(true)} className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-lg ${themeClasses.card} text-sky-500`} title={t.open_coupon_box}><Icons.Ticket /></button>
                <button onClick={() => setIsWalletOpen(true)} className={`w-12 h-12 flex items-center justify-center rounded-2xl border shadow-lg ${themeClasses.card} text-blue-500 ml-2`}><Icons.Wallet /></button>
              </div>
            </header>
            <div className="grid grid-cols-2 gap-4">
              {SAMPLE_COUPONS.map(c => (
                <div key={c.id} className={`p-4 rounded-[2rem] border flex flex-col justify-between active-scale transition-all ${themeClasses.card}`}>
                  <div className="space-y-3">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm">
                      <img src={c.imageUrl} className="w-full h-full object-cover" alt={c.name} />
                    </div>
                    <div className="px-1">
                      <div className="text-blue-500 text-[8px] font-black uppercase mb-0.5">{lang === 'ko' ? c.partner : (c as any).partner_en}</div>
                      <h3 className="text-xs font-black leading-tight line-clamp-2 min-h-[2.5rem]">{lang === 'ko' ? c.name : (c as any).name_en}</h3>
                      <div className="text-base font-black text-blue-600 tracking-tighter mt-1">{c.price.toLocaleString()}P</div>
                    </div>
                  </div>
                  <button onClick={() => handlePurchase(c)} className="w-full py-2.5 mt-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase active-scale shadow-sm">
                    {t.shop_buy}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'collection' && (
          <div className="p-6 pt-10 pb-28 space-y-10 animate-in fade-in duration-500">
            <header className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0">{userName.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-3xl font-black tracking-tighter leading-none truncate">{userName}</h2>
                  <button 
                    onClick={() => { setNewNameInput(userName); setIsNameEditOpen(true); }} 
                    className="p-1 rounded-full bg-black/5 dark:bg-white/10 active-scale opacity-60 hover:opacity-100"
                  >
                    <Icons.Edit size={12} />
                  </button>
                </div>
                <div className="text-blue-500 text-[10px] font-black uppercase">EXPERT EXPLORER</div>
              </div>
            </header>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-6 rounded-[2rem] border ${themeClasses.card}`}><div className="opacity-40 text-[9px] font-black uppercase mb-1">{t.profile_points}</div><div className="text-2xl font-black text-blue-500 tracking-tighter">{totalPoints.toLocaleString()}P</div></div>
              <div className={`p-6 rounded-[2rem] border ${themeClasses.card}`}><div className="opacity-40 text-[9px] font-black uppercase mb-1">{t.profile_climb_count}</div><div className="text-2xl font-black tracking-tighter">{Object.keys(climbCounts).length} <span className="text-xs opacity-40">{lang === 'ko' ? '곳' : 'Locations'}</span></div></div>
            </div>
            <section className="space-y-6">
               <h3 className="text-2xl font-black uppercase tracking-tight px-1">{t.climb_stats_title}</h3>
               <div className="space-y-3">
                  {Object.entries(climbCounts).map(([id, count]) => {
                    const log = SAMPLE_OREUMS.find(o => o.id === id);
                    if (!log) return null;
                    return (
                      <div key={id} onClick={() => setSelectedOreum(log)} className={`p-4 rounded-2xl border flex items-center gap-4 active-scale cursor-pointer ${themeClasses.card}`}>
                         <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"><img src={log.imageUrl} className="w-full h-full object-cover" /></div>
                         <div className="flex-1">
                           <h4 className="text-sm font-black truncate">{lang === 'ko' ? log.name : log.name_en}</h4>
                           <div className="text-[10px] opacity-40 uppercase font-black">
                             {lang === 'ko' ? '탐방' : 'Trek'} {count}{lang === 'ko' ? '회' : ' times'} • {t.best_record_label} {formatTimeFull(completedRecords[id])}
                           </div>
                         </div>
                         <div className="text-blue-500 scale-75"><Icons.Check /></div>
                      </div>
                    );
                  })}
               </div>
            </section>
          </div>
        )}
      </main>

      {/* Name Edit Modal */}
      {isNameEditOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setIsNameEditOpen(false)}>
          <div className={`w-full max-sm rounded-[2.5rem] border p-8 flex flex-col space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tight">{t.name_edit_title}</h2>
              <button onClick={() => setIsNameEditOpen(false)}><Icons.X /></button>
            </div>
            <div className={`p-4 rounded-2xl border ${themeClasses.input}`}>
              <input 
                autoFocus
                value={newNameInput} 
                onChange={(e) => setNewNameInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="bg-transparent w-full outline-none font-bold text-sm" 
                placeholder={t.name_edit_placeholder} 
              />
            </div>
            <button 
              onClick={handleNameSave}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase active-scale shadow-lg"
            >
              {t.name_edit_save}
            </button>
          </div>
        </div>
      )}

      {selectedOreum && (() => {
        const climbCount = climbCounts[selectedOreum.id] || 0;
        const bestRecord = completedRecords[selectedOreum.id];
        const top5 = (rankings[selectedOreum.id] || []).slice(0, 5);
        const oreumReviews = reviews[selectedOreum.id] || [];
        const userReviewCount = oreumReviews.filter(r => r.isUser).length;
        const canReview = climbCount > 0 && userReviewCount < climbCount;

        return (
          <div className="fixed inset-0 z-[100] flex items-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedOreum(null)}>
            <div 
              className={`w-full max-w-lg mx-auto rounded-t-[3rem] border overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom-full duration-500 ${theme === 'dark' ? 'bg-gray-950 border-white/10' : 'bg-white'}`} 
              onClick={e => e.stopPropagation()}
              onTouchStart={handleModalTouchStart}
              onTouchMove={handleModalTouchMove}
              onTouchEnd={handleModalTouchEnd}
              style={{ transform: `translateY(${modalDragY}px)`, transition: isDraggingModal.current ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
               <div className="shrink-0 pt-2"><div className="grab-handle"></div></div>
               <div ref={modalScrollRef} className="overflow-y-auto no-scrollbar flex-1 flex flex-col pb-10">
                  <div className="relative h-80 shrink-0">
                    <img src={selectedOreum.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <button onClick={() => setSelectedOreum(null)} className="absolute top-4 right-6 bg-black/50 p-3 rounded-2xl text-white active-scale shadow-lg backdrop-blur-md border border-white/10"><Icons.X /></button>
                    <div className="absolute bottom-8 left-10 right-10">
                      <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{t.evi_label}: {selectedOreum.evi}</span></div>
                      <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{lang === 'ko' ? selectedOreum.name : selectedOreum.name_en}</h2>
                      
                      <div className="flex items-center gap-1.5 mt-2 opacity-70 text-white">
                        <Icons.Pin />
                        <span className="text-[10px] font-bold truncate">{lang === 'ko' ? selectedOreum.location : selectedOreum.location_en}</span>
                      </div>

                      <p className="text-white/90 text-sm font-bold mt-4 leading-relaxed line-clamp-3 bg-black/20 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                        {lang === 'ko' ? selectedOreum.description : selectedOreum.description_en}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-3 gap-4">
                       <div className={`p-4 rounded-3xl border text-center ${themeClasses.card}`}><div className="text-[9px] opacity-50 uppercase font-black mb-1">{lang === 'ko' ? '내 등반' : 'My Treks'}</div><div className="text-lg font-black text-blue-500">{climbCount}{lang === 'ko' ? '회' : ''}</div></div>
                       <div className={`p-4 rounded-3xl border text-center ${themeClasses.card}`}><div className="text-[9px] opacity-50 uppercase font-black mb-1">{lang === 'ko' ? '현재 인원' : 'Hikers'}</div><div className="text-lg font-black text-emerald-500">{liveHikers[selectedOreum.id] || 0}</div></div>
                       <div className={`p-4 rounded-3xl border text-center ${themeClasses.card}`}><div className="text-[9px] opacity-50 uppercase font-black mb-1">{lang === 'ko' ? '최고 기록' : 'Best Record'}</div><div className="text-[11px] font-black truncate">{bestRecord ? formatTimeFull(bestRecord) : '--:--'}</div></div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">{t.ranking_title}</h3>
                       <div className={`p-4 rounded-[2rem] border divide-y divide-gray-100 dark:divide-white/5 ${themeClasses.card}`}>
                          {top5.length === 0 ? <div className="py-6 text-center opacity-30 text-xs italic">{t.ranking_empty}</div> : 
                            top5.map((rank, i) => (
                              <div key={i} className="py-3 flex justify-between items-center">
                                 <div className="flex items-center gap-3"><span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${i === 0 ? 'bg-yellow-500 text-white' : 'bg-black/5 opacity-50'}`}>{i + 1}</span><span className="text-xs font-black">{rank.username}</span></div>
                                 <div className="flex flex-col items-end"><span className="text-xs font-mono font-black text-blue-500">{formatTimeFull(rank.time)}</span><span className="text-[8px] opacity-30">{rank.date}</span></div>
                              </div>
                            ))
                          }
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center justify-between"><h3 className="text-sm font-black uppercase tracking-widest">{t.reviews_title}</h3><span className="text-[10px] font-black text-orange-500">{t.reviews_reward_hint}</span></div>
                       <div className={`p-2 rounded-2xl border flex items-center gap-2 ${themeClasses.input} ${!canReview ? 'opacity-50 grayscale' : ''}`}>
                          <input disabled={!canReview} value={reviewInput} onChange={(e)=>setReviewInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter' && canReview && handleAddReview()} className="bg-transparent flex-1 p-2 outline-none font-bold text-xs" placeholder={climbCount === 0 ? t.reviews_locked : t.reviews_placeholder} />
                          <button onClick={handleAddReview} disabled={!canReview || !reviewInput.trim()} className={`px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase active-scale ${canReview && reviewInput.trim() ? 'bg-blue-600' : 'bg-gray-400'}`}>{t.reviews_submit}</button>
                       </div>
                       <div className="space-y-3">
                          {oreumReviews.length === 0 ? <div className="py-10 text-center opacity-30 text-xs italic">{t.reviews_empty}</div> : 
                            oreumReviews.map((rev, i) => (
                              <div key={i} className={`p-4 rounded-2xl border ${themeClasses.card}`}><div className="flex justify-between items-center mb-1 text-[10px] font-black"><span className={rev.isUser ? 'text-blue-500' : ''}>{rev.isUser ? userName : 'Explorer'}</span><span className="opacity-40">{rev.date}</span></div><p className="text-xs font-medium leading-relaxed">{rev.text}</p></div>
                            ))
                          }
                       </div>
                    </div>
                    <button onClick={() => { startClimbing(selectedOreum); setSelectedOreum(null); }} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase active-scale shadow-lg shadow-blue-900/30 tracking-tight">
                      {lang === 'ko' ? '등반 시작하기' : 'Start Trekking'}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        );
      })()}

      {isWalletOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6" onClick={() => setIsWalletOpen(false)}>
          <div className={`w-full max-w-md rounded-[2.5rem] border p-0 flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-gray-100'}`} onClick={e => e.stopPropagation()}>
            <div className={`p-6 flex justify-between items-center ${theme === 'dark' ? 'bg-black' : 'bg-white border-b border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className="text-blue-500"><Icons.Wallet /></div>
                <h2 className={`text-lg font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.wallet_title}</h2>
              </div>
              <button onClick={() => setIsWalletOpen(false)} className={`opacity-40 hover:opacity-100 transition-opacity p-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}><Icons.X /></button>
            </div>
            
            <div className={`p-6 space-y-6 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
              <div className="p-6 rounded-[2rem] bg-blue-600 text-white shadow-[0_10px_40px_rgba(37,99,235,0.3)] flex flex-col items-center">
                <div className="text-[10px] font-black uppercase opacity-70 mb-1">{t.wallet_total}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black tracking-tighter">{totalPoints.toLocaleString()}</span>
                  <span className="text-base font-black opacity-60">P</span>
                </div>
              </div>
              
              <button 
                onClick={() => { setIsWalletOpen(false); setIsCouponBoxOpen(true); }}
                className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-2.5 active-scale font-black uppercase text-[11px] tracking-widest shadow-sm transition-all ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              >
                <div className="text-blue-500 scale-90"><Icons.Ticket /></div>
                {t.goto_coupon_box}
              </button>
            </div>

            <div className={`flex-1 flex flex-col min-h-0 border-t ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-100'}`}>
              <div className="px-6 py-5">
                <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{t.wallet_history}</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-2.5 no-scrollbar">
                {pointHistory.length === 0 ? (
                  <div className={`py-12 text-center opacity-30 text-xs italic ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.wallet_empty}</div>
                ) : (
                  pointHistory.map(item => (
                    <div key={item.id} className={`p-4 rounded-2xl border flex justify-between items-center group transition-colors ${theme === 'dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                      <div className="flex flex-col gap-0.5">
                        <div className={`text-xs font-bold tracking-tight leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.oreumName}</div>
                        <div className={`text-[9px] opacity-40 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.date}</div>
                      </div>
                      <div className={`text-sm font-black ${item.isSpending ? 'text-orange-500' : 'text-blue-500'}`}>
                        {item.isSpending ? '-' : '+'}{item.points.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className={`p-6 border-t ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-100'}`}>
              <button 
                onClick={() => setIsWalletOpen(false)}
                className={`w-full py-4 rounded-2xl font-black uppercase text-xs active-scale transition-colors ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
              >
                {t.wallet_close}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCouponBoxOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-xl p-6" onClick={() => setIsCouponBoxOpen(false)}>
          <div className={`w-full max-w-md rounded-[3rem] border p-8 flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-gray-950 border-white/10' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 shrink-0"><h2 className="text-3xl font-black uppercase tracking-tighter">{t.coupon_box_title}</h2><button onClick={() => setIsCouponBoxOpen(false)}><Icons.X /></button></div>
            <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar pr-1">{purchasedCoupons.length === 0 ? <div className="py-20 text-center opacity-40">{t.coupon_box_empty}</div> : purchasedCoupons.map((pc, index) => { const coupon = SAMPLE_COUPONS.find(c => c.id === pc.id); if (!coupon) return null; const isUsed = usedCoupons.includes(pc.instanceId); return (<div key={pc.instanceId} onClick={() => !isUsed && setActiveCouponDetail({ ...pc, ...coupon })} className={`p-6 rounded-[2.5rem] border flex items-center gap-4 active-scale cursor-pointer overflow-hidden relative ${themeClasses.card} shadow-lg ${isUsed ? 'opacity-30 grayscale' : ''}`}>{isUsed && <div className="absolute inset-0 flex items-center justify-center text-white bg-black/20 font-black text-2xl rotate-[-15deg] z-10 pointer-events-none">USED</div>}<div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md"><img src={coupon.imageUrl} className="w-full h-full object-cover" /></div><div className="flex-1 min-w-0"><div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{lang === 'ko' ? coupon.partner : (coupon as any).partner_en}</div><h3 className="text-sm font-black tracking-tight truncate leading-tight">{lang === 'ko' ? coupon.name : (coupon as any).name_en}</h3></div><div className="text-blue-500"><Icons.Play /></div></div>); })}</div>
          </div>
        </div>
      )}

      {activeCouponDetail && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
           <div className="w-full max-w-sm rounded-[3rem] border overflow-hidden bg-white animate-in zoom-in-90 duration-300 shadow-2xl">
              <div className="p-10 flex flex-col items-center text-center space-y-8">
                 <button onClick={() => setActiveCouponDetail(null)} className="self-end -mt-4 -mr-4 p-4 active-scale"><Icons.X /></button>
                 <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl"><img src={activeCouponDetail.imageUrl} className="w-full h-full object-cover" /></div>
                 <div><div className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-2">{lang === 'ko' ? activeCouponDetail.partner : activeCouponDetail.partner_en}</div><h2 className="text-2xl font-black tracking-tighter leading-tight">{lang === 'ko' ? activeCouponDetail.name : activeCouponDetail.name_en}</h2></div>
                 <button onClick={() => { if(confirm(lang === 'ko' ? "지금 사용하시겠습니까?" : "Use now?")) { setUsedCoupons([...usedCoupons, activeCouponDetail.instanceId]); setActiveCouponDetail(null); showToast(lang === 'ko' ? "사용이 완료되었습니다 !" : "Usage complete!", "success"); } }} className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black uppercase shadow-xl active-scale">{t.coupon_use_now}</button>
              </div>
           </div>
        </div>
      )}

      <nav className={`h-[84px] backdrop-blur-[30px] border-t px-2 flex items-center justify-around shrink-0 pb-safe z-40 transition-colors duration-300 ${themeClasses.nav} shadow-[0_-8px_32px_rgba(0,0,0,0.05)]`}>
        <BottomNavItem active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Icons.Mountain />} label={t.tab_home} />
        <BottomNavItem active={activeTab === 'climb'} onClick={() => setActiveTab('climb')} icon={<Icons.Zap />} label={t.tab_climb} />
        <BottomNavItem active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<Icons.Search />} label={t.tab_ai} />
        <BottomNavItem active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<Icons.Shop />} label={t.tab_shop} />
        <BottomNavItem active={activeTab === 'collection'} onClick={() => setActiveTab('collection')} icon={<Icons.Activity />} label={t.tab_collection} />
      </nav>
    </div>
  );
};

export default App;
