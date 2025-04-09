/* eslint-disable @typescript-eslint/no-empty-object-type */
import { MoveObject, Table, Uid, VecSet } from "./shared-models";

export const errorMessages: Record<string, Record<number, string>> = {
    context: {
        1: "Invalid state transition"
    },
    /**
     * // === Errors ===
const EInvalidSuccessRate: u64 = 1;
const EInvalidSteps: u64 = 2;
const EUnsupportedStake: u64 = 3;
const EInvalidCashOut: u64 = 3;
const EGameAlreadyOngoing: u64 = 4;
const EGameNotInProgress: u64 = 5;
const EUnsupportedAction: u64 = 6;
const ECannotAdvanceFurther: u64 = 7;
const EPackageVersionDisabled: u64 = 8;
const EVersionAlreadyAllowed: u64 = 9;
const EVersionAlreadyDisabled: u64 = 10;
const EContextAlreadyExists: u64 = 11;
     * 
     */
    game: {
        1: "Invalid success rate",
        2: "Invalid steps",
        3: "Unsupported stake",
        4: "Invalid cash out",
        5: "Game already ongoing",
        6: "Game not in progress",
        7: "Unsupported action",
        8: "Cannot advance further",
        9: "Package version disabled",
        10: "Version already allowed",
        11: "Version already disabled",
    }
};

export interface PiggyBankContextModel {
    stake: number,
    status: string,
    win: bigint;
    current_position: number;
}

export interface GameModel {
    id: Uid;
    allowed_versions: MoveObject<VecSet<bigint>>;
    min_stake: bigint,
    max_stake: bigint,
    steps_payout_bps: number[],
    success_rate_bps: number,
    contexts: MoveObject<Table>,
}

export interface InteractionTypeModel {
    START_GAME: {
        stake: bigint;
    },
    ADVANCE: {},
    CASH_OUT: {}
}

export interface InteractionModel {
    balance_manager_id: string;
    interact_type: InteractionTypeModel;
}

export interface InteractedWithGameModel {
    old_balance: bigint;
    new_balance: bigint;
    context: PiggyBankContextModel;
    balance_manager_id: string;
}