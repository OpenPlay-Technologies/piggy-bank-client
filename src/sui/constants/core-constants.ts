// const initialPackageId = process.env.NEXT_PUBLIC_INITIAL_CORE_PACKAGE_ID;
const currentPackageId = process.env.NEXT_PUBLIC_CURRENT_CORE_PACKAGE_ID;

// === Types ====
export const BALANCE_MANAGER_CAP_TYPE = currentPackageId + "::balance_manager" + "::BalanceManagerCap";
export const PLAY_CAP_TYPE = currentPackageId + "::balance_manager" + "::PlayCap";
export const HOUSE_ADMIN_CAP_TYPE = currentPackageId + "::house" + "::HouseAdminCap";
export const PARTICIPATION_TYPE = currentPackageId + "::participation" + "::Participation";
export const HOUSE_TYPE = currentPackageId + "::house" + "::House";

export const BALANCE_MANAGER_TYPE = currentPackageId + "::balance_manager" + "::BalanceManager";
// === Targets ===
export const NEW_HOUSE_FUNCTION_TARGET = currentPackageId + "::house" + "::new";
export const SHARE_HOUSE_FUNCTION_TARGET = currentPackageId + "::house" + "::share";
export const STAKE_FUNCTION_TARGET = currentPackageId + "::house" + "::stake";
export const UNSTAKE_FUNCTION_TARGET = currentPackageId + "::house" + "::unstake";
export const UPDATE_PARTICIPATION_FUNCTION_TARGET = currentPackageId + "::house" + "::update_participation";
export const NEW_PARTICIPATION_FUNCTION_TARGET = currentPackageId + "::house" + "::new_participation";
export const ADMIN_NEW_PARTICIPATION_FUNCTION_TARGET = currentPackageId + "::house" + "::admin_new_participation";
export const CLAIM_PARTICIPATION_FUNCTION_TARGET = currentPackageId + "::house" + "::claim_all";
export const DESTROY_PARTICIPATION_FUNCTION_TARGET = currentPackageId + "::participation" + "::destroy_empty";
export const ADMIN_CLAIM_HOUSE_FEES_FUNCTION_TARGET = currentPackageId + "::house" + "::admin_claim_house_fees";
export const NEW_BALANCE_MANAGER_FUNCTION_TARGET = currentPackageId + "::balance_manager" + "::new";
export const DEPOSIT_BALANCE_MANAGER_FUNCTION_TARGET = currentPackageId + "::balance_manager" + "::deposit";
export const WITHDRAW_BALANCE_MANAGER_FUNCTION_TARGET = currentPackageId + "::balance_manager" + "::withdraw";
export const MINT_PLAY_CAP_FUNCTION_TARGET = currentPackageId + "::balance_manager" + "::mint_play_cap";
export const SHARE_BALANCE_MANAGER_FUNCTION_TARGET = currentPackageId + "::balance_manager" + "::share";
export const ADD_ALLOW_TX_FUNCTION_TARGET = currentPackageId + "::house" + "::admin_add_tx_allowed";
export const REVOKE_ALLOW_TX_FUNCTION_TARGET = currentPackageId + "::house" + "::admin_revoke_tx_allowed";