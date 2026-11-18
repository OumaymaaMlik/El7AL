import type { LucideIcon } from 'lucide-react-native';

/** The one step the live mission screen offers as a slide bar. */
export interface PrimaryAction {
  title: string;
  onPress: () => void;
  Icon: LucideIcon;
  busy: boolean;
}
