import { useMemo, useState } from 'react';
import './hall-helpers.css';
import HallHelpersHome from './HallHelpersHome';
import HallHelperPage from './HallHelperPage';
import { hallHelperGroups, getHallHelperById } from './hall-helpers';

export default function App() {
  const [activeHelperId, setActiveHelperId] = useState<string | null>(null);

  const activeHelper = useMemo(() => {
    if (!activeHelperId) return null;
    return getHallHelperById(activeHelperId);
  }, [activeHelperId]);

  if (activeHelper) {
    return (
      <HallHelperPage
        helper={activeHelper}
        onBack={() => setActiveHelperId(null)}
      />
    );
  }

  return (
    <HallHelpersHome
      title="Помощники по залу"
      groups={hallHelperGroups}
      onOpenHelper={setActiveHelperId}
    />
  );
}