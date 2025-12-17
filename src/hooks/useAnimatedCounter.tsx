import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  delay?: number;
  startOnMount?: boolean;
}

export function useAnimatedCounter(
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
) {
  const { duration = 2000, delay = 0, startOnMount = true } = options;
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  const startAnimation = () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsAnimating(true);

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(easedProgress * targetValue);

      setCount(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
        setIsAnimating(false);
      }
    };

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, delay);
  };

  useEffect(() => {
    if (startOnMount && targetValue > 0) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, startOnMount]);

  return { count, isAnimating, startAnimation };
}

// Component for animated numbers with formatting
export function AnimatedNumber({
  value,
  duration = 2000,
  delay = 0,
  prefix = '',
  suffix = '',
  formatFn,
  className = ''
}: {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  formatFn?: (n: number) => string;
  className?: string;
}) {
  const { count } = useAnimatedCounter(value, { duration, delay });
  
  const displayValue = formatFn ? formatFn(count) : count.toLocaleString();
  
  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
