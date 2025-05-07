import GlitchText from './GlitchText';

const GOLD = '#FAD12B';
const GOLD2 = '#FCF6BA';

export default function GoldGlitchText({ text, ...props }) {
  return (
    <GlitchText
      text={text}
      goldEffect={true}
      color={GOLD}
      glitchColor1={GOLD2}
      glitchColor2={GOLD}
      fontSize="2rem"
      {...props}
    />
  );
} 