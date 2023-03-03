import { useCallback, useEffect, useState } from "react";

const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    x: 0,
    y: 0,
  });

  const handleWindowResize = useCallback(() => {
    setWindowDimensions({
      x: window.innerWidth,
      y: window.innerHeight,
    });
  }, [setWindowDimensions]);

  useEffect(() => {
    setWindowDimensions({
      x: window.innerWidth,
      y: window.innerHeight,
    });

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    }
  }, []);

  return windowDimensions;
}

export default useWindowDimensions;
