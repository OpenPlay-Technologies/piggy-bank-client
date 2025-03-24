import { Transaction } from "@mysten/sui/transactions";
import { v4 as uuidv4 } from 'uuid';
import { isMessage, Message, TX_SIGN_AND_EXECUTE_REQUEST, TX_SIGN_AND_EXECUTE_RESPONSE } from "./messages";
import { SuiTransactionBlockResponse } from "@mysten/sui/dist/cjs/client";

export function signAndExecuteTransaction(
    tx: Transaction,
    timeoutMs = 5000
): Promise<SuiTransactionBlockResponse> {
    return new Promise(async (resolve, reject) => {
        const json = await tx.toJSON();

        const requestId = uuidv4();
        const postMessage: Message = {
            type: TX_SIGN_AND_EXECUTE_REQUEST,
            txJson: json,
            request_id: requestId,
        };

        // Timeout to reject the promise if no response is received in time.
        const timeoutId = setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            reject(new Error('Response timed out'));
        }, timeoutMs);

        const messageHandler = (event: MessageEvent) => {
            const data = event.data;

            if (!isMessage(data)) {
                return;
            }
            console.log('Received message from host:', event.data);

            if (data.type == TX_SIGN_AND_EXECUTE_RESPONSE && data.requestId === requestId) {
                console.log('Received response for request:', requestId);
                clearTimeout(timeoutId);
                window.removeEventListener('message', messageHandler);

                if (data.isSuccessful) {
                    resolve(data.result);
                }
                else {
                    reject(new Error(data.errorMsg));
                }
            }
        };

        // Attach the listener before sending the message.
        window.addEventListener('message', messageHandler);
        window.parent.postMessage(postMessage, '*');
    });
}
