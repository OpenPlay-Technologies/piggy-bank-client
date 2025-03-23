import { SuiTransactionBlockResponse } from "@mysten/sui/dist/cjs/client";

export const TX_SIGN_AND_EXECUTE_REQUEST = "TX_SIGN_AND_EXECUTE_REQUEST";
export const TX_SIGN_AND_EXECUTE_RESPONSE = "TX_SIGN_AND_EXECUTE_RESPONSE";
export const INIT_REQUEST = "INIT_REQUEST";
export const INIT_RESPONSE = "INIT_RESPONSE";

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
    }
    |
    {
        type: typeof INIT_RESPONSE;
        isSuccessful: boolean;
        errorMsg?: string;
    };

export function isMessage(value: any): value is Message {
    if (typeof value !== "object" || value === null) return false;
    return (
        value.type === TX_SIGN_AND_EXECUTE_REQUEST ||
        value.type === TX_SIGN_AND_EXECUTE_RESPONSE ||
        value.type === INIT_REQUEST ||
        value.type === INIT_RESPONSE
    );
}