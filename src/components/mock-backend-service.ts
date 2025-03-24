import { EMPTY_POSITION, GAME_FINISHED_STATUS, GAME_ONGOING_STATUS } from "../sui/constants/piggybank-constants";

import { GameModel, InteractedWithGameModel, PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { BalanceManagerModel } from "../sui/models/openplay-core";
import { BALANCE_DATA, CONTEXT_DATA, INTERACTED_EVENT, STAKE_DATA } from "../constants";
import { IBackendService } from "./backend-service";

const START_BALANCE = BigInt(100e9);

const gameData: GameModel = {
    id: {
        id: "0x0"
    },
    allowed_versions: {
        fields: {
            contents: [BigInt(1)]
        },
        type: "VecSet"

    },
    min_stake: BigInt(0),
    max_stake: BigInt(100e9),
    steps_payout_bps: [12000, 15000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
    // steps_payout_bps: [10000, 15000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
    // steps_payout_bps: [10000, 15000],
    success_rate_bps: 10000,
    contexts: {
        fields: {
            id: {
                id: "0x0"
            },
            size: 1
        },
        type: "Table"
    },
};


export default class MockBackendService implements IBackendService {
    // Removed unused 'scene' property
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    handleCashOut(): Promise<void> {
        const context = this.getCurrentContext();

        // Cannot cash out if the position is not set
        if (context?.current_position == EMPTY_POSITION) {
            return Promise.resolve();
        }
        // Cannot cash out if the game is ont ongoing
        if (context?.status != GAME_ONGOING_STATUS) {
            return Promise.resolve();
        }

        const currentPosition = context.current_position;
        const currentBalance = this.getCurrentBalance() ?? 0n;
        const winAmount = this.getPayoutForPosition(currentPosition);

        // Note: the balance was already visually deducted in the UI
        const newBalance = currentBalance + BigInt(winAmount);


        const event = {
            old_balance: currentBalance,
            new_balance: newBalance,
            context: {
                stake: this.getCurrentStake(),
                status: GAME_FINISHED_STATUS,
                win: 1e9,
                current_position: currentPosition
            },
            balance_manager_id: "",
        };
        this.scene.time.delayedCall(1500, () => {
            this.scene.events.emit(INTERACTED_EVENT, event);
        });
        return Promise.resolve();
    }

    public async handleStartGame(): Promise<void> {
        const context = this.getCurrentContext();

        // Cannot cash out if the game is ont ongoing
        if (context?.status == GAME_ONGOING_STATUS) {
            return Promise.resolve();
        }

        const currentBalance = this.getCurrentBalance() ?? 0n;
        const stakeAmount = this.getCurrentStake();

        if (currentBalance < BigInt(stakeAmount)) {
            return Promise.resolve();
        }
        
        const newBalance = currentBalance - BigInt(stakeAmount);

        var event: InteractedWithGameModel;

        if (this.mayAdvance()) {
            event = {
                old_balance: currentBalance,
                new_balance: newBalance,
                context: {
                    stake: this.getCurrentStake(),
                    status: GAME_ONGOING_STATUS,
                    win: 0n,
                    current_position: 0
                },
                balance_manager_id: "",
            };
        }
        else {
            event = {
                old_balance: currentBalance,
                new_balance: newBalance,
                context: {
                    stake: this.getCurrentStake(),
                    status: GAME_FINISHED_STATUS,
                    win: 0n,
                    current_position: EMPTY_POSITION
                },
                balance_manager_id: "",
            };
        }

        this.scene.time.delayedCall(1500, () => {
            this.scene.events.emit(INTERACTED_EVENT, event);
        });
        return Promise.resolve();
    }

    // Called when the button is clicked in the Phaser scene
    public async handleAdvance(): Promise<void> {

        const context = this.getCurrentContext();

        // Cannot cash out if the position is not set
        if (context?.current_position == EMPTY_POSITION) {
            return Promise.resolve();
        }
        // Cannot cash out if the game is ont ongoing
        if (context?.status != GAME_ONGOING_STATUS) {
            return Promise.resolve();
        }

        const currentPosition = context.current_position;
        const currentBalance = this.getCurrentBalance() ?? 0n;
        const currentStake = this.getCurrentStake();

        var event: InteractedWithGameModel;
        if (this.mayAdvance()) {
            if (currentPosition + 1 == gameData.steps_payout_bps.length - 1) {
                const winAmount = this.getPayoutForPosition(currentPosition + 1);
                event = {
                    old_balance: currentBalance,
                    new_balance: currentBalance + BigInt(winAmount),
                    context: {
                        stake: currentStake,
                        status: GAME_FINISHED_STATUS,
                        win: winAmount,
                        current_position: currentPosition + 1
                    },
                    balance_manager_id: "",
                };
            }
            else {
                event = {
                    old_balance: currentBalance,
                    new_balance: currentBalance,
                    context: {
                        stake: currentStake,
                        status: GAME_ONGOING_STATUS,
                        win: 0n,
                        current_position: currentPosition + 1
                    },
                    balance_manager_id: "",
                };
            }
        }
        else {
            event = {
                old_balance: currentBalance,
                new_balance: currentBalance,
                context: {
                    stake: currentStake,
                    status: GAME_FINISHED_STATUS,
                    win: 0n,
                    current_position: currentPosition
                },
                balance_manager_id: "",
            };
        }


        this.scene.time.delayedCall(1500, () => {
            this.scene.events.emit(INTERACTED_EVENT, event);
        });
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

    getPayoutForPosition(position: number): bigint {
        return BigInt(Math.floor(this.getCurrentStake() * (gameData.steps_payout_bps[position] / 10000)));
    }

    mayAdvance(): boolean {
        return Phaser.Math.Between(0, 10000 - 1) < gameData.success_rate_bps;
    }

}


export const mockFetchGame = async (): Promise<GameModel> => {
    // Construct a mocked game object based on your GameModel interface
    return Promise.resolve(gameData);

    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         resolve(gameData);
    //     }, 2000); 
    // });
};

export const mockFetchBalanceManager = async (): Promise<BalanceManagerModel> => {
    // Construct a mocked game object based on your GameModel interface
    const mockBm: BalanceManagerModel = {
        id: {
            id: "0x0"
        },
        balance: START_BALANCE,
        tx_allow_listed: {
            fields: {
                contents: [""]
            },
            type: "VecSet"

        },
        cap_id: ""
    };
    return Promise.resolve(mockBm);
    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         resolve(mockBm);
    //     }, 2000); 
    // });
};

export const mockFetchContext = async (): Promise<PiggyBankContextModel | undefined> => {
    // const mockContext: PiggyBankContextModel = {
    //     stake: 1e9,
    //     status: GAME_ONGOING_STATUS,
    //     win: 0,
    //     current_position: 1
    // };

    return Promise.resolve(undefined);
    // return Promise.resolve(mockContext);
    // return new Promise((resolve) => {
    //     setTimeout(() => {
    //         resolve(undefined);
    //     }, 10000);
    // });
}