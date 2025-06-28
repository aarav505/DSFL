import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ 
  text, 
  speed = 30,
  className = '' 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length && isTyping) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length) {
      // Optional: Add a small delay before allowing the effect to restart
      const timeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, isTyping]);

  // Reset the effect when the text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  return (
    <span className={`${className} inline-block`}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default TypingEffect;
