

export const WIDTH = 1440;
export const HEIGHT = 1080;

export const WORLD_HEIGHT = 1080;
export const WORLD_WIDTH = 4000;

export const COLUMN_WIDTH = 256;
export const Y_POS = HEIGHT / 2 - 50;

export const PLATFORM_PASSED_TINT = 0x555555;

// === Events ===
export const INTERACTED_EVENT = 'interacted-event';
export const ERROR_EVENT = 'error-event';
export const PLATFORM_CLICKED_EVENT = 'platform-clicked-event';
export const START_GAME_REQUESTED_EVENT = 'start-game-requested-event';
export const ADVANCE_REQUESTED_EVENT = 'advance-requested-event';
export const CASH_OUT_REQUESTED_EVENT = 'cash-out-requested-event';
export const BALANCE_UPDATED_EVENT = 'balance-updated-event';
export const STAKE_CHANGED_EVENT = 'stake-changed-event';
export const STATUS_UPDATED_EVENT = 'status-updated-event';
export const INIT_DATA_READY_EVENT = 'init-data-ready-event';
export const DIFFICULTY_CHANGED_EVENT = 'difficulty-changed-event';
export const GAME_LOADED_EVENT = 'game-loaded-event';
export const RELOAD_REQUESTED_EVENT = 'reload-requested-event';
export const BALANCE_UPDATE_REQUESTED_EVENT = 'balance-update-requested-event';

// === Data ===
export const CONTEXT_DATA = 'context-data'; // Current working context
export const CONTEXT_MAP_DATA = 'context-map-data'; // Per difficulty
export const BALANCE_DATA = 'balance-data';
export const BALANCE_MANAGER_DATA = 'balance-manager-data';
export const GAME_DATA = 'game-data'; // Current game
export const GAME_MAP_DATA = 'game-map-data'; // Per difficulty
export const STAKE_DATA = 'stake-data';
export const DIFFICULTY_DATA = 'difficulty-data';
export const STATUS_DATA = 'status-data';

// === UI ===
export const MOBILE_UI_HEIGHT = 0.4;
export const DESKTOP_UI_HEIGHT = 0.2;
export const BALANCE_BAR_HEIGHT_PX = 50;