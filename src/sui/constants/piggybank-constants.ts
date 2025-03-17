// const initialPackageId = process.env.NEXT_PUBLIC_INITIAL_PIGGY_BANK_PACKAGE_ID;
const currentPackageId = import .meta.env.VITE_PIGGY_BANK_PACKAGE_ID;

export const CONTEXT_TYPE = currentPackageId + "::context" + "::PiggyBankContext";
export const INTERACT_EVENT_TYPE = currentPackageId + "::game" + "::InteractedWithGame";
export const INTERACT_FUNCTION_TARGET = currentPackageId + "::game" + "::interact";

export const EMPTY_POSITION = 255;
export const NEW_STATUS = "New";
export const INITIALIZED_STATUS = "Initialized";
export const GAME_ONGOING_STATUS = "GameOngoing";
export const GAME_FINISHED_STATUS = "GameFinished";
export const START_GAME_ACTION = "StartGame";
export const ADVANCE_ACTION = "Advance";
export const CASH_OUT_ACTION = "CashOut";