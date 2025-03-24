import { Transaction } from "@mysten/sui/transactions";
import { ADVANCE_ACTION, CASH_OUT_ACTION, INTERACT_EVENT_TYPE, INTERACT_FUNCTION_TARGET, START_GAME_ACTION } from "../sui/constants/piggybank-constants";

import { signAndExecuteTransaction } from "../openplay-connect/functions";
import { InteractedWithGameModel, PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { BALANCE_DATA, CONTEXT_DATA, STAKE_DATA } from "../constants";
import { OpenPlayGame } from "../game";

export interface IBackendService {
    handleAdvance(): Promise<void>;
    handleStartGame(): Promise<void>;
    handleCashOut(): Promise<void>;
}

export default class BackendService implements IBackendService {
    // Removed unused 'scene' property
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        // this.scene.events.on(ADVANCE_REQUESTED_EVENT, this.handleAdvance, this);
        // this.scene.events.on(START_GAME_REQUESTED_EVENT, this.handleStartGame, this);
    }

    public async handleCashOut(): Promise<void> {
        const game = this.scene.game as OpenPlayGame;

        if (!game.initData) {
            throw new Error('Game not initialized');
        }

        try {
            const gameId = import.meta.env.VITE_GAME_ID;
            const registryId = import.meta.env.VITE_REGISTRY_ID;
            const balanceManagerId = game.initData.balanceManagerId;
            const houseId = game.initData.houseId;
            const playCapId = game.initData.playCapId;

            // console.log(gameId);
            // console.log(tx.object(gameId));
            // tx.object(Inputs.ObjectRef({ digest, objectId, version }));

            const tx = new Transaction();

            tx.moveCall({
                target: INTERACT_FUNCTION_TARGET,
                arguments: [
                    tx.object(gameId),
                    tx.object(registryId),
                    tx.object(balanceManagerId),
                    tx.object(houseId),
                    tx.object(playCapId),
                    tx.pure.string(CASH_OUT_ACTION),
                    tx.pure.u64(0),
                    tx.object('0x8'), // random
                ],
            });

            const result = await signAndExecuteTransaction(tx);

            const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);

            if (interactEvent) {
                const parsedEvent = parseInteractedWithGameModel(interactEvent.parsedJson) as InteractedWithGameModel;
                this.scene.events.emit('interacted-event', parsedEvent);
            }
            else {
                this.scene.events.emit('error-event', 'No interact event found');
            }
        }
        catch (error) {
            console.error(error);
            this.scene.events.emit('error-event', error instanceof Error ? error.message : "An unknown error occurred");
        }
    }

    // Called when the button is clicked in the Phaser scene
    public async handleAdvance(): Promise<void> {
        const game = this.scene.game as OpenPlayGame;

        if (!game.initData) {
            throw new Error('Game not initialized');
        }
        try {
            const gameId = import.meta.env.VITE_GAME_ID;
            const registryId = import.meta.env.VITE_REGISTRY_ID;
            const balanceManagerId = game.initData.balanceManagerId;
            const houseId = game.initData.houseId;
            const playCapId = game.initData.playCapId;

            // console.log(gameId);
            // console.log(tx.object(gameId));
            // tx.object(Inputs.ObjectRef({ digest, objectId, version }));

            const tx = new Transaction();

            tx.moveCall({
                target: INTERACT_FUNCTION_TARGET,
                arguments: [
                    tx.object(gameId),
                    tx.object(registryId),
                    tx.object(balanceManagerId),
                    tx.object(houseId),
                    tx.object(playCapId),
                    tx.pure.string(ADVANCE_ACTION),
                    tx.pure.u64(0),
                    tx.object('0x8'), // random
                ],
            });

            const result = await signAndExecuteTransaction(tx);

            const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);

            if (interactEvent) {
                const parsedEvent = parseInteractedWithGameModel(interactEvent.parsedJson) as InteractedWithGameModel;
                this.scene.events.emit('interacted-event', parsedEvent);
            }
            else {
                this.scene.events.emit('error-event', 'No interact event found');
            }
        }
        catch (error) {
            console.error(error);
            this.scene.events.emit('error-event', error instanceof Error ? error.message : "An unknown error occurred");
        }
    }


    // Called when the button is clicked in the Phaser scene
    public async handleStartGame(): Promise<void> {
        const game = this.scene.game as OpenPlayGame;

        if (!game.initData) {
            throw new Error('Game not initialized');
        }

        try {
            const gameId = import.meta.env.VITE_GAME_ID;
            const registryId = import.meta.env.VITE_REGISTRY_ID;
            const balanceManagerId = game.initData.balanceManagerId;
            const houseId = game.initData.houseId;
            const playCapId = game.initData.playCapId;
            const stake = this.getCurrentStake();
            // console.log(gameId);
            // console.log(tx.object(gameId));
            // tx.object(Inputs.ObjectRef({ digest, objectId, version }));

            const tx = new Transaction();

            tx.moveCall({
                target: INTERACT_FUNCTION_TARGET,
                arguments: [
                    tx.object(gameId),
                    tx.object(registryId),
                    tx.object(balanceManagerId),
                    tx.object(houseId),
                    tx.object(playCapId),
                    tx.pure.string(START_GAME_ACTION),
                    tx.pure.u64(stake),
                    tx.object('0x8'), // random
                ],
            });

            const result = await signAndExecuteTransaction(tx);

            const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);

            if (interactEvent) {
                const parsedEvent = parseInteractedWithGameModel(interactEvent.parsedJson) as InteractedWithGameModel;
                this.scene.events.emit('interacted-event', parsedEvent);
            }
        }
        catch (error) {
            console.error(error);
            this.scene.events.emit('error-event', error instanceof Error ? error.message : "An unknown error occurred");
        }
    }

    getCurrentBalance(): bigint | undefined {
        return this.scene.registry.get(BALANCE_DATA);
    }

    getCurrentContext(): PiggyBankContextModel | undefined {
        return this.scene.registry.get(CONTEXT_DATA);
    }

    getCurrentStake(): number {
        return this.scene.registry.get(STAKE_DATA);
    }
}


function parseInteractedWithGameModel(raw: any): InteractedWithGameModel {
    return {
        old_balance: BigInt(raw.old_balance),
        new_balance: BigInt(raw.new_balance),
        balance_manager_id: raw.balance_manager_id,
        context: {
            stake: raw.context.stake,
            status: raw.context.status,
            win: BigInt(raw.context.win),
            current_position: raw.context.current_position,
        },
    };
}
