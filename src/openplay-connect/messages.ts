import { SuiTransactionBlockResponse } from "@mysten/sui/client";


export const TX_SIGN_AND_EXECUTE_REQUEST = "TX_SIGN_AND_EXECUTE_REQUEST";
export const TX_SIGN_AND_EXECUTE_RESPONSE = "TX_SIGN_AND_EXECUTE_RESPONSE";
export const INIT_REQUEST = "INIT_REQUEST";
export const INIT_RESPONSE = "INIT_RESPONSE";
export const CLOSE_GAME_REQUEST = "CLOSE_GAME_REQUEST";
export const BALANCE_UPDATE_NOTIFICATION = "BALANCE_UPDATE_NOTIFICATION";

export type Message =
    |
    {
        type: typeof TX_SIGN_AND_EXECUTE_REQUEST;
        request_id: string;
        txJson: string;
    }
    |
    {
        type: typeof TX_SIGN_AND_EXECUTE_RESPONSE;
        requestId: string;
        isSuccessful: true;
        result: SuiTransactionBlockResponse;
    }
    |
    {
        type: typeof TX_SIGN_AND_EXECUTE_RESPONSE;
        requestId: string;
        isSuccessful: false;
        errorMsg: string;
    }
    |
    {
        type: typeof INIT_REQUEST;
        balanceManagerId: string;
        houseId: string;
        playCapId: string;
        referralId?: string;
        mobile?: boolean;
    }
    |
    {
        type: typeof INIT_RESPONSE;
        isSuccessful: boolean;
        errorMsg?: string;
    }
    |
    {
        type: typeof CLOSE_GAME_REQUEST;
    }
    |
    {
        type: typeof BALANCE_UPDATE_NOTIFICATION;
    };

export function isMessage(value: Message) {
    if (typeof value !== "object" || value === null) return false;
    return (
        value.type === TX_SIGN_AND_EXECUTE_REQUEST ||
        value.type === TX_SIGN_AND_EXECUTE_RESPONSE ||
        value.type === INIT_REQUEST ||
        value.type === INIT_RESPONSE ||
        value.type === CLOSE_GAME_REQUEST ||
        value.type === BALANCE_UPDATE_NOTIFICATION
    );
}