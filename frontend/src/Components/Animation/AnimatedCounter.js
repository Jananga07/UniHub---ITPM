import React, { useEffect, useState } from "react";

function AnimatedCounter({ value, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = Math.ceil(end / (duration / 50)); // 50ms step

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 50);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <p>{count}</p>;
}

export default AnimatedCounter;