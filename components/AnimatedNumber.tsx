import React, { useEffect, useRef, useState } from "react";
import { Text, TextProps } from "react-native";

interface AnimatedNumberProps extends TextProps {
  value: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  style,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === value) return;

    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out quad: f(t) = t * (2 - t)
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(
        startValue + (endValue - startValue) * easeProgress,
      );

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = value;
      }
    };

    const animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return (
    <Text {...props} style={style}>
      {displayValue}
    </Text>
  );
};

export default AnimatedNumber;
