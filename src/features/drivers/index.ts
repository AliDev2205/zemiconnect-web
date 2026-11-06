// Écrans et composants du domaine conducteurs. Partagés entre gestion et
// administration via la prop readOnly (jamais d'écran dupliqué).
export { default as DriverListScreen } from './DriverListScreen';
export type { DriverScreenProps } from './DriverListScreen';
export { default as DriverDetailScreen } from './detail/DriverDetailScreen';
export { DRIVER_TABS, toDriverTab } from './detail/tabs';
export type { DriverTab } from './detail/tabs';
