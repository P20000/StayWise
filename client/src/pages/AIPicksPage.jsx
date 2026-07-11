import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  setPreferences,
  setRecommendedRooms,
  setRecommenderLoading,
} from '../store/slices/recommenderSlice';
import api from '../services/api';
import {
  Sparkles,
  Sliders,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Building2,
  Wifi,
  Volume2,
  VolumeX,
  BriefcaseBusiness,
  Coffee,
  AlertCircle,
} from 'lucide-react';

/* ─── Preference option sets ──────────────────────────────────────────────── */
const STYLE_OPTIONS = [
  { label: 'Brutalist', value: 'Modern Brutalist', icon: Building2 },
  { label: 'Minimalist', value: 'Minimalist Zen', icon: Coffee },
  { label: 'Industrial', value: 'Industrial', icon: Sliders },
];

const NOISE_OPTIONS = [
  { label: 'Very Quiet', value: 'High', icon: VolumeX },
  { label: 'Standard', value: 'Standard', icon: Volume2 },
];

const WORKSPACE_OPTIONS = [
  { label: 'Work Space Needed', value: true, icon: BriefcaseBusiness },
  { label: 'Not Required', value: false, icon: Coffee },
];

/* ─── Scoring helper (pure client-side) ───────────────────────────────────── */
const scoreRoom = (room, prefs) => {
  let score = 0;
  if (room.architecturalStyle === prefs.architecturalStyle) score += 40;
  if (prefs.quietnessLevel === 'High' && room.quietnessLevel === 'High') score += 30;
  if (prefs.quietnessLevel === 'Standard') score += 20;
  if (prefs.workFriendly && room.amenities?.some((a) => /wifi|desk|fiber/i.test(a))) score += 30;
  if (!prefs.workFriendly) score += 20;
  return Math.min(score, 100);
};

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export const AIPicksPage = () => {
  const dispatch = useDispatch();
  const { preferences, recommendedRooms, loading } = useSelector(
    (state) => state.recommender
  );

  const [allRooms, setAllRooms] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [matchScore, setMatchScore] = useState(null);

  /* Fetch all rooms once on mount */
  useEffect(() => {
    const load = async () => {
      dispatch(setRecommenderLoading(true));
      setFetchError(null);
      try {
        const res = await api.get('/rooms');
        const data = res.data.data || [];
        setAllRooms(data);
      } catch (err) {
        err.message = `Could not load listings: ${err.message}`;
        setFetchError(err);
      } finally {
        dispatch(setRecommenderLoading(false));
      }
    };
    load();
  }, [dispatch]);

  /* Re-score whenever preferences change and we've already run a search */
  useEffect(() => {
    if (hasFetched && allRooms.length > 0) runMatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  const runMatch = () => {
    setHasFetched(true);
    const scored = allRooms
      .map((room) => ({ ...room, _score: scoreRoom(room, preferences) }))
      .sort((a, b) => b._score - a._score);

    const topMatches = scored.slice(0, 6);
    dispatch(setRecommendedRooms(topMatches));

    const avg =
      topMatches.length > 0
        ? Math.round(topMatches.reduce((s, r) => s + r._score, 0) / topMatches.length)
        : 0;
    setMatchScore(avg);
  };

  const handleToggle = (key, value) => {
    dispatch(setPreferences({ [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F1EDEA] select-none">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#212121] border-b-2 border-[#212121] px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-7xl mx-auto">
          <Badge variant="terracotta" className="mb-4">
            <Sparkles size={12} />
            <span>AI-Powered</span>
          </Badge>
          <h1 className="font-mono text-4xl sm:text-6xl font-bold uppercase tracking-tight text-[#F1EDEA] leading-none">
            YOUR PERFECT<br />
            <span className="text-[#C84B31]">STAY MATCH</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#F1EDEA]/60 max-w-xl mt-4 leading-relaxed">
            Set your preferences below and let our recommendation engine surface
            architectural stays tailored specifically to your lifestyle.
          </p>
        </div>
      </div>

      {/* ── Preferences Panel ───────────────────────────────────────────────── */}
      <div className="w-full border-b-2 border-[#212121] px-4 sm:px-6 lg:px-8 py-10 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#C84B31]" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-[#212121]">
              Tune Your Preferences
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Architectural Style */}
            <div className="border-2 border-[#212121] p-5 shadow-[4px_4px_0px_#212121] bg-[#F1EDEA]">
              <Badge variant="default" className="mb-4">Style</Badge>
              <p className="font-sans text-xs text-[#212121]/70 mb-4 leading-relaxed">
                Pick a design aesthetic that speaks to you — raw concrete or calming minimal.
              </p>
              <div className="flex flex-col gap-2">
                {STYLE_OPTIONS.map(({ label, value, icon: Icon }) => {
                  const active = preferences.architecturalStyle === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleToggle('architecturalStyle', value)}
                      className={`flex items-center gap-2 px-3 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-100
                        ${active
                          ? 'bg-[#212121] text-[#F1EDEA] border-[#212121] shadow-[2px_2px_0px_#C84B31]'
                          : 'bg-white text-[#212121] border-[#212121]/30 hover:border-[#212121]'
                        }`}
                    >
                      <Icon size={13} />
                      {label}
                      {active && <CheckCircle2 size={12} className="ml-auto text-[#C84B31]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Noise Level */}
            <div className="border-2 border-[#212121] p-5 shadow-[4px_4px_0px_#212121] bg-[#F1EDEA]">
              <Badge variant="default" className="mb-4">Noise</Badge>
              <p className="font-sans text-xs text-[#212121]/70 mb-4 leading-relaxed">
                We'll filter out properties near busy streets so you can rest undisturbed.
              </p>
              <div className="flex flex-col gap-2">
                {NOISE_OPTIONS.map(({ label, value, icon: Icon }) => {
                  const active = preferences.quietnessLevel === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleToggle('quietnessLevel', value)}
                      className={`flex items-center gap-2 px-3 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-100
                        ${active
                          ? 'bg-[#212121] text-[#F1EDEA] border-[#212121] shadow-[2px_2px_0px_#C84B31]'
                          : 'bg-white text-[#212121] border-[#212121]/30 hover:border-[#212121]'
                        }`}
                    >
                      <Icon size={13} />
                      {label}
                      {active && <CheckCircle2 size={12} className="ml-auto text-[#C84B31]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Space */}
            <div className="border-2 border-[#212121] p-5 shadow-[4px_4px_0px_#212121] bg-[#F1EDEA]">
              <Badge variant="default" className="mb-4">Work Space</Badge>
              <p className="font-sans text-xs text-[#212121]/70 mb-4 leading-relaxed">
                Stays with a proper desk, fast Wi-Fi, and power outlets for remote work.
              </p>
              <div className="flex flex-col gap-2">
                {WORKSPACE_OPTIONS.map(({ label, value, icon: Icon }) => {
                  const active = preferences.workFriendly === value;
                  return (
                    <button
                      key={String(value)}
                      onClick={() => handleToggle('workFriendly', value)}
                      className={`flex items-center gap-2 px-3 py-2 border-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-100
                        ${active
                          ? 'bg-[#212121] text-[#F1EDEA] border-[#212121] shadow-[2px_2px_0px_#C84B31]'
                          : 'bg-white text-[#212121] border-[#212121]/30 hover:border-[#212121]'
                        }`}
                    >
                      <Icon size={13} />
                      {label}
                      {active && <CheckCircle2 size={12} className="ml-auto text-[#C84B31]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Match CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={runMatch}
              disabled={loading || allRooms.length === 0}
              className="px-10"
            >
              <Sparkles size={16} />
              <span>{loading ? 'Matching...' : 'Find My Matches'}</span>
              <ArrowRight size={16} />
            </Button>
            {matchScore !== null && (
              <div className="bg-[#212121] text-[#F1EDEA] border-2 border-[#212121] shadow-[4px_4px_0px_#C84B31] px-5 py-2.5 flex items-center gap-3">
                <Sparkles size={14} className="text-[#C84B31]" />
                <span className="font-mono text-sm font-bold">
                  Avg. Match Score:{' '}
                  <span className="text-[#C84B31]">{matchScore}%</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {fetchError && (
            <ErrorBanner error={fetchError} className="mb-8" onClose={() => setFetchError(null)} />
          )}

          {!hasFetched ? (
            /* Prompt state — user hasn't run a match yet */
            <div className="border-2 border-dashed border-[#212121]/30 p-16 text-center bg-white space-y-4">
              <Sparkles size={32} className="mx-auto text-[#C84B31]" strokeWidth={1.5} />
              <div className="font-mono text-base font-bold text-[#212121] uppercase tracking-wide">
                Set Your Preferences Above
              </div>
              <p className="font-sans text-xs text-[#212121]/60 max-w-sm mx-auto">
                Adjust the style, noise, and workspace settings, then hit{' '}
                <strong>Find My Matches</strong> to see curated stays ranked by
                how well they fit your lifestyle.
              </p>
            </div>
          ) : loading ? (
            <div className="font-mono text-xs text-center py-20 uppercase text-[#212121]/50">
              Calculating your matches...
            </div>
          ) : recommendedRooms.length === 0 ? (
            <div className="border-2 border-dashed border-[#212121]/30 p-12 text-center bg-white space-y-4">
              <div className="font-mono text-sm font-bold text-[#212121] flex items-center justify-center gap-2">
                <AlertCircle size={16} className="text-[#C84B31]" />
                <span>No Matches Found</span>
              </div>
              <p className="font-sans text-xs text-[#212121]/60 max-w-md mx-auto">
                We couldn't find stays matching your current preferences. Try adjusting the
                style or workspace settings.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b-2 border-[#212121] pb-6">
                <div>
                  <Badge variant="terracotta" className="mb-2">
                    <Sparkles size={11} />
                    <span>AI Matched</span>
                  </Badge>
                  <h2 className="font-mono text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#212121]">
                    YOUR TOP PICKS
                  </h2>
                  <p className="font-sans text-xs text-[#212121]/60 mt-1">
                    {recommendedRooms.length} stays ranked by preference match
                  </p>
                </div>
                <Link to="/explore">
                  <Button variant="outline" size="md">
                    <span>Browse All Stays</span>
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedRooms.map((suite) => (
                  <Card
                    key={suite._id || suite.id}
                    hoverEffect
                    className="flex flex-col justify-between p-0 bg-white"
                  >
                    <div>
                      <div className="relative w-full h-52 border-b-2 border-[#212121] overflow-hidden bg-[#212121]">
                        <img
                          src={
                            suite.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={suite.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="ai">{suite.architecturalStyle}</Badge>
                        </div>
                        {/* Match score pill */}
                        {suite._score !== undefined && (
                          <div className="absolute top-3 right-3 bg-[#C84B31] text-white border border-[#212121] px-2 py-0.5 shadow-[2px_2px_0px_#212121] flex items-center gap-1 font-mono text-xs font-bold">
                            <Sparkles size={10} />
                            <span>{suite._score}% match</span>
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 bg-white border border-[#212121] px-2 py-0.5 shadow-[2px_2px_0px_#212121] flex items-center gap-1 font-mono text-xs font-bold">
                          <Star size={12} className="text-[#C84B31] fill-[#C84B31]" />
                          <span>{suite.rating}</span>
                          <span className="text-[#212121]/50">({suite.reviewsCount})</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-1.5 font-mono text-xs uppercase text-[#C84B31] font-bold mb-1">
                          <MapPin size={14} />
                          <span>{suite.location}</span>
                        </div>
                        <h3 className="font-mono text-lg font-bold text-[#212121] tracking-wide mb-2">
                          {suite.title}
                        </h3>
                        {suite.amenities?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {suite.amenities.slice(0, 3).map((a) => (
                              <span
                                key={a}
                                className="font-mono text-[10px] uppercase bg-[#F1EDEA] border border-[#212121]/20 px-1.5 py-0.5 text-[#212121]/70"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-[#212121]/15 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xl font-bold text-[#212121]">
                          ${suite.basePrice}
                        </span>
                        <span className="font-mono text-xs text-[#212121]/60 uppercase">
                          {' '}/ night
                        </span>
                      </div>
                      <Link to={`/room/${suite.slug}`}>
                        <Button variant="primary" size="sm">
                          RESERVE
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPicksPage;
