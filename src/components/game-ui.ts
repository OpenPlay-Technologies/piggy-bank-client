import { ADVANCE_REQUESTED_EVENT, BALANCE_DATA, BALANCE_UPDATED_EVENT, CASH_OUT_REQUESTED_EVENT, CONTEXT_DATA, STAKE_CHANGED_EVENT, STAKE_DATA, START_GAME_REQUESTED_EVENT, STATUS_UPDATED_EVENT } from "../constants";
import { Main } from "../scenes/main-scene";
import { PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { formatSuiAmount } from "../utils/helpers";
import { PiggyState } from "./enums";

export class GameUI extends Phaser.GameObjects.Container {
    // State variables
    private stakeIndex: number = 0;
    // private allowdStakes: number[] = [1e9, 2e9, 3e9, 5e9, 10e9];
    private allowdStakes: number[] = [1e7, 2e7, 3e7, 5e7, 10e7];
    private isGameOngoing: boolean = false;

    // UI elements
    private stakeText: Phaser.GameObjects.Text;
    private balanceText: Phaser.GameObjects.Text;
    private plusButton: Phaser.GameObjects.Text;
    private minusButton: Phaser.GameObjects.Text;
    private startGameButton?: Phaser.GameObjects.Text;
    private advanceButton?: Phaser.GameObjects.Text;
    private cashOutButton?: Phaser.GameObjects.Text;

    // Dimensions for our UI background.
    private readonly bgWidth: number = 400;
    private readonly bgHeight: number = 200;

    constructor(scene: Main, x: number, y: number) {
        super(scene, x, y);

        this.setDepth(100);

        // Create a background texture if it doesn't exist.
        if (!scene.textures.exists("ui-bg")) {
            const bgGraphics = scene.add.graphics();
            bgGraphics.fillStyle(0x333333, 1);
            bgGraphics.fillRect(0, 0, this.bgWidth, this.bgHeight);
            bgGraphics.generateTexture("ui-bg", this.bgWidth, this.bgHeight);
            bgGraphics.destroy();
        }
        // Create the background image.
        const background = scene.add.image(0, 0, "ui-bg");
        background.setOrigin(0.5, 1);
        this.add(background);

        // Create balance text and stake text.
        this.balanceText = scene.add.text(-this.bgWidth / 2 + 20, -this.bgHeight + 20, '', {
            fontSize: "24px",
            color: "#fff"
        });
        this.stakeText = scene.add.text(-this.bgWidth / 2 + 20, -this.bgHeight + 60, '', {
            fontSize: "24px",
            color: "#fff"
        });

        // Create plus and minus buttons for stake adjustment.
        this.plusButton = scene.add.text(this.bgWidth / 2 - 50, -this.bgHeight + 60, "+", {
            fontSize: "32px",
            color: "#0f0",
            backgroundColor: "#000"
        }).setInteractive()
        .setScrollFactor(0);
        
        this.plusButton.on("pointerdown", () => this.changeStake(true));

        this.minusButton = scene.add.text(this.bgWidth / 2 - 100, -this.bgHeight + 60, "-", {
            fontSize: "32px",
            color: "#f00",
            backgroundColor: "#000"
        }).setInteractive().setScrollFactor(0);
        this.minusButton.on("pointerdown", () => this.changeStake(false));

        // Add texts and buttons to the container.
        this.add([this.balanceText, this.stakeText, this.plusButton, this.minusButton]);

        // Fix the container on screen so it doesn't scroll with the camera.
        this.setScrollFactor(0);

        // Add this container to the scene.
        scene.add.existing(this);

        // Initial setup.
        this.handleStakeChange();
        this.handleBalanceChange();
        this.handleStatusUpdate(scene.status);

        // Event listeners.
        this.scene.events.on(STAKE_CHANGED_EVENT, this.handleStakeChange, this);
        this.scene.events.on(STATUS_UPDATED_EVENT, this.handleStatusUpdate, this);
        this.scene.events.on(BALANCE_UPDATED_EVENT, this.handleBalanceChange, this);
    }
    
    public reload(status: string): void {
        this.handleStakeChange();
        this.handleBalanceChange();
        this.handleStatusUpdate(status);
    }

    private handleStakeChange(): void {
        const currentStake = this.getCurrentStake();
        this.scene.registry.set(STAKE_DATA, currentStake);
        this.stakeText.setText(`Stake: ${formatSuiAmount(currentStake)}`);
        if (this.stakeIndex === 0) {
            this.minusButton.setAlpha(0.5).disableInteractive();
        } else if (this.stakeIndex === this.allowdStakes.length - 1) {
            this.plusButton.setAlpha(0.5).disableInteractive();
        } else {
            this.minusButton.setAlpha(1).setInteractive();
            this.plusButton.setAlpha(1).setInteractive();
        }
    }

    private handleStatusUpdate(status: string): void {
        switch (status) {
            case PiggyState.ADVANCE_STAGE_1:
            case PiggyState.ADVANCE_STAGE_2:
            case PiggyState.CASHING_OUT:
            case PiggyState.DYING:
            case PiggyState.WINNING:
            case PiggyState.GAME_ONGOING_IDLE:
                this.isGameOngoing = true;
                break;
            case PiggyState.NO_GAME_IDLE:
                this.isGameOngoing = false;
                break;
            default:
                break;
        }
        this.updateActionButtons();
    }

    private handleBalanceChange(): void {
        const currentBalance: bigint = this.scene.registry.get(BALANCE_DATA);
        this.balanceText.setText(`Balance: ${formatSuiAmount(currentBalance)}`);
    }

    public setVisualBalance(balance: bigint): void {
        this.balanceText.setText(`Balance: ${formatSuiAmount(balance)}`);
    }

    private changeStake(up: boolean): void {
        this.stakeIndex = up
            ? Math.min(this.stakeIndex + 1, this.allowdStakes.length - 1)
            : Math.max(this.stakeIndex - 1, 0);
        this.scene.registry.set(STAKE_DATA, this.getCurrentStake());
        this.scene.events.emit(STAKE_CHANGED_EVENT);
    }

    private getCurrentStake(): number {
        return this.allowdStakes[this.stakeIndex];
    }

    // Create (or re-create) the action buttons based on game state.
    private updateActionButtons(): void {
        // Remove existing action buttons.
        if (this.startGameButton) {
            this.startGameButton.destroy();
            this.startGameButton = undefined;
        }
        if (this.advanceButton) {
            this.advanceButton.destroy();
            this.advanceButton = undefined;
        }
        if (this.cashOutButton) {
            this.cashOutButton.destroy();
            this.cashOutButton = undefined;
        }

        // Create buttons based on game state.
        if (this.isGameOngoing) {
            this.advanceButton = this.scene.add.text(-70, -50, "Advance", {
                fontSize: "24px",
                color: "#fff",
                backgroundColor: "#000"
            }).setInteractive().setScrollFactor(0).setOrigin(0.5, 0.5);
            this.advanceButton.on("pointerdown", () => this.handleAdvance());

            this.cashOutButton = this.scene.add.text(70, -50, "Cash Out", {
                fontSize: "24px",
                color: "#fff",
                backgroundColor: "#000"
            }).setInteractive().setScrollFactor(0).setOrigin(0.5, 0.5);
            this.cashOutButton.on("pointerdown", () => this.handleCashOut());

            this.add([this.advanceButton, this.cashOutButton]);
        } else {
            this.startGameButton = this.scene.add.text(0, -50, "Start Game", {
                fontSize: "24px",
                color: "#fff",
                backgroundColor: "#000"
            }).setInteractive().setScrollFactor(0).setOrigin(0.5, 0.5);
            this.startGameButton.on("pointerdown", () => this.handleStartGame());
            this.add(this.startGameButton);
        }
    }

    private handleStartGame(): void {
        this.scene.events.emit(START_GAME_REQUESTED_EVENT);
        console.log("Start game requested");
    }

    private handleAdvance(): void {
        const contextData: PiggyBankContextModel | undefined = this.scene.registry.get(CONTEXT_DATA);
        if (!contextData) {
            return;
        }
        this.scene.events.emit(ADVANCE_REQUESTED_EVENT);
        console.log("Advance requested");
    }

    private handleCashOut(): void {
        this.scene.events.emit(CASH_OUT_REQUESTED_EVENT);
        console.log("Cash out requested");
    }
}
