import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * True while the person is typing in a form field: the keyboard is up on a phone, or a field has focus in a
 * browser. The sign-up header uses it to hold its animation still.
 */
export function useFormFocus(): boolean {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const isField = (el: EventTarget | null) => el instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(el.tagName);
      const on = (e: FocusEvent) => isField(e.target) && setTyping(true);
      const off = () => setTyping(false);
      document.addEventListener('focusin', on);
      document.addEventListener('focusout', off);
      return () => {
        document.removeEventListener('focusin', on);
        document.removeEventListener('focusout', off);
      };
    }
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () =>
      setTyping(true),
    );
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () =>
      setTyping(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return typing;
}
