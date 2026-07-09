import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPreferences } from '../../store/slices/recommenderSlice';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Sparkles, Sliders, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const SmartStayRecommender = () => {
  const { preferences, matchScore } = useSelector((state) => state.recommender);
  const dispatch = useDispatch();
  const sectionRef = useRef(null);

  const handleTogglePreference = (key, value) => {
    dispatch(setPreferences({ [key]: value }));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.recommender-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: '.recommender-header',
            start: 'top 85%',
          },
        }
      );
      gsap.fromTo(
        '.recommender-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.recommender-card',
            start: 'top 85%',
          },
        }
      );
      gsap.fromTo(
        '.recommender-cta',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: {
            trigger: '.recommender-cta',
            start: 'top 90%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-[#F1EDEA] py-20 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="recommender-header opacity-0 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="terracotta" className="mb-3">
              <Sparkles size={12} />
              <span>AI-Powered Recommendations</span>
            </Badge>
            <h2 className="font-mono text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#212121]">
              SMARTSTAY™ RECOMMENDATION ENGINE
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#212121]/70 max-w-2xl mt-2">
              Tell us your preferences — we'll match you with the perfect stay based on
              your style, noise tolerance, and workspace needs.
            </p>
          </div>
          <div className="bg-white border-2 border-[#212121] shadow-[4px_4px_0px_#212121] px-5 py-3 flex items-center gap-3 shrink-0">
            <Sliders size={20} className="text-[#C84B31]" />
            <div>
              <div className="font-mono text-xs uppercase text-[#212121]/60 font-bold">Your Preference Match</div>
              <div className="font-mono text-lg font-bold text-[#C84B31]">{matchScore}% Match</div>
            </div>
          </div>
        </div>

        {/* Preference Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card hoverEffect className="recommender-card opacity-0 flex flex-col justify-between">
            <div>
              <Badge variant="default" className="mb-3">Style Preference</Badge>
              <h3 className="font-mono text-lg font-bold text-[#212121] mb-2">
                {preferences.architecturalStyle}
              </h3>
              <p className="font-sans text-xs text-[#212121]/70 leading-relaxed mb-4">
                Choose a design style that suits your taste — bold raw concrete or clean minimal spaces.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={preferences.architecturalStyle === 'Modern Brutalist' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('architecturalStyle', 'Modern Brutalist')}>
                Brutalist
              </Button>
              <Button size="sm" variant={preferences.architecturalStyle === 'Minimalist Zen' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('architecturalStyle', 'Minimalist Zen')}>
                Minimalist
              </Button>
            </div>
          </Card>

          <Card hoverEffect className="recommender-card opacity-0 flex flex-col justify-between">
            <div>
              <Badge variant="default" className="mb-3">Noise Level</Badge>
              <h3 className="font-mono text-lg font-bold text-[#212121] mb-2">
                Quietness: {preferences.quietnessLevel}
              </h3>
              <p className="font-sans text-xs text-[#212121]/70 leading-relaxed mb-4">
                We'll filter out properties near busy nightlife areas or heavy traffic streets.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={preferences.quietnessLevel === 'High' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('quietnessLevel', 'High')}>
                Very Quiet
              </Button>
              <Button size="sm" variant={preferences.quietnessLevel === 'Standard' ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('quietnessLevel', 'Standard')}>
                Standard
              </Button>
            </div>
          </Card>

          <Card hoverEffect className="recommender-card opacity-0 flex flex-col justify-between">
            <div>
              <Badge variant="default" className="mb-3">Work Space</Badge>
              <h3 className="font-mono text-lg font-bold text-[#212121] mb-2">
                Workspace Available: {preferences.workFriendly ? 'Yes' : 'No'}
              </h3>
              <p className="font-sans text-xs text-[#212121]/70 leading-relaxed mb-4">
                Includes stays with a proper desk, fast Wi-Fi, and power outlets.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={preferences.workFriendly ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('workFriendly', true)}>
                Needed
              </Button>
              <Button size="sm" variant={!preferences.workFriendly ? 'primary' : 'outline'}
                onClick={() => handleTogglePreference('workFriendly', false)}>
                Not Required
              </Button>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="recommender-cta opacity-0 flex justify-center">
          <Button variant="secondary" size="lg" className="px-10">
            <span>View My Matches</span>
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SmartStayRecommender;
