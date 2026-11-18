import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { ensureLocationPermission } from '../../map/services/location';

/**
 * Before the device asks for the position, the client sees why it is needed ("Où êtes-vous ?").
 * `prompt` shows that page; `ready` means the home page can load and locate. Artisans skip it.
 */
export function useLocationGate(isProvider: boolean) {
  const [locStep, setLocStep] = useState<'checking' | 'prompt' | 'ready'>(isProvider ? 'ready' : 'checking');
  const [locBusy, setLocBusy] = useState(false);

  useEffect(() => {
    if (isProvider) {
      setLocStep('ready');
      return;
    }
    let alive = true;
    Location.getForegroundPermissionsAsync()
      .then((p) => alive && setLocStep(p.granted || !p.canAskAgain ? 'ready' : 'prompt'))
      .catch(() => alive && setLocStep('ready'));
    return () => {
      alive = false;
    };
  }, [isProvider]);

  const allowLocation = async () => {
    setLocBusy(true);
    await ensureLocationPermission();
    setLocBusy(false);
    setLocStep('ready');
  };

  return { locStep, setLocStep, locBusy, allowLocation };
}
