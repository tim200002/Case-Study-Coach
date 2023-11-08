import { ReactNode, useEffect, useState } from "react";

const HydrationZustand = (props: { children: ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <>{isHydrated ? <div>{props.children}</div> : null}</>;
};

export default HydrationZustand;
