import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPreferences } from '../../store/slices/recommenderSlice';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Sparkles, Sliders, ArrowRight } from 'lucide-react';

export const SmartStayRecommender = () => {
  const { preferences, matchScore } = useSelector((state) => state.recommender);
  const dispatch = useDispatch();

  const handleTogglePreference = (key, value) => {
    dispatch(setPreferences({ [key]: value }));
  };

  return (
    <section className="w-full bg-[#F1EDEA] py-16 px-4 sm:px-6 lg:px-8 border-b-3 border-[#212121] select-none">
      <div className="max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b-2 border-[#212121] pb-6">
          <div>
            <Badge variant="terracotta" className="mb-3">
              <Sparkles size={12} />
              <span>[ ALGORITHMIC CURATION ]</span>
            </Badge>
            <h2 className="font-mono text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#212121]">
              SMARTSTAY™ RECOMMENDER ENGINE
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#212121]/75 max-w-2xl mt-2">
              Our vector-driven match engine synchronizes architectural aesthetics, acoustic
              profiles, and spatial requirements directly with your travel profile.
            </p>
          </div>
          <div className="bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] px-5 py-3 flex items-center gap-3">
            <Sliders size={20} className="text-[#C84B31]" />
            <div>
              <div className="font-mono text-xs uppercase text-[#212121]/60 font-bold">
                CURRENT VECTOR PROFILE
              </div>
              <div className="font-mono text-lg font-bold text-[#C84B31]">
                {matchScore}% SIMILARITY MATCH
              </div>
            </div>
          </div>
        </div>

        {/* Recommender Preferences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <Badge variant="default" className="mb-3">
                [ AESTHETIC PROFILE ]
              </Badge>
              <h3 className="font-mono text-lg font-bold text-[#212121] mb-2">
                {preferences.architecturalStyle}
              </h3>
              <p className="font-sans text-xs text-[#212121]/70 leading-relaxed mb-4">
                Prioritizes exposed board-formed concrete, unlacquered brass hardware,
                and high-contrast structural lines.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={preferences.architecturalStyle === 'Modern Brutalist' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('architecturalStyle', 'Modern Brutalist')}
              >
                BRUTALIST
              </Button>
              <Button
                size="sm"
                variant={preferences.architecturalStyle === 'Minimalist Zen' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('architecturalStyle', 'Minimalist Zen')}
              >
                MINIMALIST
              </Button>
            </div>
          </Card>

          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <Badge variant="default" className="mb-3">
                [ ACOUSTIC & QUIETNESS ]
              </Badge>
              <h3 className="font-mono text-lg font-bold text-[#212121] mb-2">
                Acoustic Rating: {preferences.quietnessLevel}
              </h3>
              <p className="font-sans text-xs text-[#212121]/70 leading-relaxed mb-4">
                Excludes properties within 500m of active nightlife corridors or high-density
                vehicular arteries (`dB &lt; 35` requirement).
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={preferences.quietnessLevel === 'High' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('quietnessLevel', 'High')}
              >
                HIGH QUIET
              </Button>
              <Button
                size="sm"
                variant={preferences.quietnessLevel === 'Standard' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('quietnessLevel', 'Standard')}
              >
                STANDARD
              </Button>
            </div>
          </Card>

          <Card hoverEffect className="flex flex-col justify-between">
            <div>
              <Badge variant="default" className="mb-3">
                [ WORK & PRODUCTIVITY ]
              </Badge>
              <h3 className="font-mono text-lg font-bold text-[#212121] mb-2">
                Dedicated Workstation: {preferences.workFriendly ? 'YES' : 'NO'}
              </h3>
              <p className="font-sans text-xs text-[#212121]/70 leading-relaxed mb-4">
                Guarantees ergonomic task seating, minimum 300 Mbps symmetric optical Wi-Fi,
                and isolated power circuits.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={preferences.workFriendly ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('workFriendly', true)}
              >
                REQUIRED
              </Button>
              <Button
                size="sm"
                variant={!preferences.workFriendly ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('workFriendly', false)}
              >
                OPTIONAL
              </Button>
            </div>
          </Card>
        </div>

        {/* Action button */}
        <div className="flex justify-center">
          <Button variant="secondary" size="lg" className="px-10">
            <span>VIEW CURATED MATCH VECTOR LIST</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SmartStayRecommender;
