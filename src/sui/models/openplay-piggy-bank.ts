import {MoveObject, Table, Uid, VecSet} from "./shared-models";

export const errorMessages: Record<string, Record<number, string>> = {
    context: {
    },
    game: {
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