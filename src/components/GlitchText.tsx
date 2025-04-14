
import React, { useEffect, useState } from 'react';
import '../styles/glitch.css';

interface GlitchTextProps {
  text: string;
  className?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  color?: string;
  glitchColor1?: string;
  glitchColor2?: string;
  noAnimate?: boolean;
  children?: React.ReactNode;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  text = '',
  className = '',
  tag = 'p',
  color = '#FAD12B',
  glitchColor1 = '#d86a49',
  glitchColor2 = '#D39948',
  noAnimate = false,
  children
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(!noAnimate);
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (shouldAnimate) {
      interval = setInterval(() => {
        setShouldAnimate(false);
        setTimeout(() => {
          setShouldAnimate(true);
        }, 3000 + Math.random() * 3000);
      }, 8000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [shouldAnimate]);

  const style = {
    '--glitch-text-color': color,
    '--glitch-text-before-color': glitchColor1,
    '--glitch-text-after-color': glitchColor2,
  } as React.CSSProperties;

  const content = (
    <div className="glitch-wrapper">
      <div
        className={`glitch ${shouldAnimate ? 'glitching' : ''} ${className}`}
        style={style}
        data-text={displayText}
      >
        {displayText || children}
      </div>
    </div>
  );

  switch (tag) {
    case 'h1':
      return <h1>{content}</h1>;
    case 'h2':
      return <h2>{content}</h2>;
    case 'h3':
      return <h3>{content}</h3>;
    case 'h4':
      return <h4>{content}</h4>;
    case 'h5':
      return <h5>{content}</h5>;
    case 'h6':
      return <h6>{content}</h6>;
    case 'span':
      return <span>{content}</span>;
    case 'div':
      return <div>{content}</div>;
    default:
      return <p>{content}</p>;
  }
};

export default GlitchText;
