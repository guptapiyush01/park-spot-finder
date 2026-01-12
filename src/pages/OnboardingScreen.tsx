import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const slides = [
  {
    icon: MapPin,
    title: 'Find Parking Instantly',
    description: 'Locate available parking spots near you in real-time with our smart map.',
    color: 'primary',
  },
  {
    icon: Clock,
    title: 'Save Your Time',
    description: 'Book your spot in advance and drive straight to your reserved parking.',
    color: 'accent',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'All parking locations are verified with 24/7 security monitoring.',
    color: 'success',
  },
];

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { setHasSeenOnboarding } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = () => {
    setHasSeenOnboarding(true);
    navigate('/auth');
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    navigate('/auth');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          key={currentSlide}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl ${
            slide.color === 'primary'
              ? 'bg-primary/20'
              : slide.color === 'accent'
              ? 'bg-accent/20'
              : 'bg-success/20'
          }`}
        />
      </div>

      {/* Skip button */}
      <div className="absolute top-6 right-6 z-20">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
              className={`w-28 h-28 mx-auto rounded-3xl flex items-center justify-center mb-8 ${
                slide.color === 'primary'
                  ? 'gradient-primary shadow-glow'
                  : slide.color === 'accent'
                  ? 'gradient-accent'
                  : 'bg-success'
              }`}
            >
              <Icon className="w-14 h-14 text-primary-foreground" />
            </motion.div>

            {/* Text */}
            <h2 className="text-3xl font-bold text-foreground mb-4">{slide.title}</h2>
            <p className="text-muted-foreground text-lg max-w-xs mx-auto leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-12 relative z-10">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <Button variant="outline" size="lg" onClick={handlePrev} className="flex-1">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button size="lg" onClick={handleNext} className="flex-1">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;
