import { ReactNode, useEffect, useState } from "react";

/**
 * This component is necessary for when using the persistent Zustand store.
 * Otherwise there will be errors with hydration whenever the state of the store is not the
 * same as the initial hydrated one.
 *
 * For more info see: https://medium.com/intelliconnect-engineering/fixing-hydration-issues-in-next-js-and-zustand-a-simple-solution-bd0a8deff6cc
 */
const HydrationZustand = (props: { children: ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait till Next.js rehydration completes
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return <>{isHydrated ? <div>{props.children}</div> : null}</>;
};

export default HydrationZustand;
