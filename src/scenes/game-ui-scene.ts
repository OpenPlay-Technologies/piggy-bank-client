import { PiggyState } from "../components/enums";
import {
    ADVANCE_REQUESTED_EVENT,
    BALANCE_DATA,
    BALANCE_UPDATED_EVENT,
    CASH_OUT_REQUESTED_EVENT,
    CONTEXT_DATA,
    MOBILE_UI_HEIGHT,
    STAKE_CHANGED_EVENT,
    STAKE_DATA,
    START_GAME_REQUESTED_EVENT,
    STATUS_UPDATED_EVENT
} from "../constants";
import { PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { formatSuiAmount } from "../utils/helpers";

export class GameUIScene extends Phaser.Scene {
    // State variables
    private stakeIndex: number = 0;
    private allowdStakes: number[] = [1e7, 2e7, 3e7, 5e7, 10e7];
    private isGameOngoing: boolean = false;

    // UI elements
    private stakeText: Phaser.GameObjects.Text | undefined;
    private balanceText: Phaser.GameObjects.Text | undefined;
    private startGameButton?: Phaser.GameObjects.Container | undefined;
    private advanceButton?: Phaser.GameObjects.Container | undefined;
    private cashOutButton?: Phaser.GameObjects.Container | undefined;


    // Dimensions
    private width: number = 0;
    private height: number = 0;
    private startY: number = 0;

    background: any;
    plusButton: Phaser.GameObjects.Container | undefined;
    minusButton: Phaser.GameObjects.Container | undefined;

    constructor() {
        super({ key: 'GameUIScene' });
    }

    resize() {
        // Get the current width and height from the Scale Manager
        const width = this.scale.width;
        const height = this.scale.height;

        this.width = width;
        this.height = height;
        this.startY = height - MOBILE_UI_HEIGHT;

        // If the background image exists, update its size and position
        if (this.background) {
            // Set the background to span the full width and bottom half height
            this.background.setDisplaySize(this.width, MOBILE_UI_HEIGHT);
            // Position it so that it sits at the bottom of the canvas
            this.background.setPosition(0, this.startY);
        }

        // Place the buttons and text
        if (this.plusButton) {
            this.plusButton.setPosition((this.width + 100) / 2, this.startY + 100);
        }
        if (this.minusButton) {
            this.minusButton.setPosition((this.width - 100) / 2, this.startY + 100);
        }
        if (this.advanceButton) {
            this.advanceButton.setPosition(this.width / 2, this.height - 90);
        }
        if (this.cashOutButton) {
            this.cashOutButton.setPosition(this.width / 2, this.height - 30);
        }
        if (this.startGameButton) {
            this.startGameButton.setPosition(this.width / 2, this.height - 90);
        }
        if (this.balanceText) {
            this.balanceText.setPosition(20, this.startY + 20);
        }
        if (this.stakeText) {
            this.stakeText.setPosition(20, this.startY + 40)
        };
    }

    create(): void {
        if (!this.textures.exists("ui-mobile-bg")) {
            const bgGraphics = this.add.graphics();
            // Fill with your desired color (e.g., 0x333333)
            bgGraphics.fillStyle(0x222222, 1);
            // Generate a rectangle texture (dimensions here are arbitrary)
            bgGraphics.fillRect(0, 0, 800, 600);
            bgGraphics.generateTexture("ui-mobile-bg", 800, 600);
            bgGraphics.destroy();
        }
        this.background = this.add.image(0, 0, "ui-mobile-bg").setOrigin(0, 0);

        // Add the background image using the generated texture
        // Set its origin to (0, 0) so positioning is from the top-left corner

        // Create balance text and stake text relative to the background.
        // They are positioned relative to the background’s top left.
        this.balanceText = this.add.text(0, 0, '', {
            fontSize: "20px",
            color: "#fff"
        }).setScrollFactor(0);
        this.stakeText = this.add.text(0, 0, '', {
            fontSize: "20px",
            color: "#fff"
        }).setScrollFactor(0);

        // Create the plus button container
        this.plusButton = this.add.container(0, 0);
        const plusCircle = this.add.circle(0, 0, 20, 0x444444);
        const plusText = this.add.text(0, 0, "+", {
            fontSize: "32px",
            color: "#0f0"
        });
        plusText.setOrigin(0.5);
        this.plusButton.add([plusCircle, plusText]);
        this.plusButton.setSize(40, 40);
        this.plusButton.setInteractive();
        this.plusButton.on("pointerdown", () => this.changeStake(true));

        // Create the minus button container
        this.minusButton = this.add.container(0, 0);
        const minusCircle = this.add.circle(0, 0, 20, 0x444444);
        const minusText = this.add.text(0, 0, "-", {
            fontSize: "32px",
            color: "#f00"
        });
        minusText.setOrigin(0.5);
        this.minusButton.add([minusCircle, minusText]);
        this.minusButton.setSize(40, 40);
        this.minusButton.setInteractive();
        this.minusButton.on("pointerdown", () => this.changeStake(false));

        // Buttons
        this.advanceButton = createButton(this, 100, 100, "Advance", () => this.handleAdvance());
        this.cashOutButton = createButton(this, 300, 100, "Cash Out", () => this.handleCashOut());
        this.startGameButton = createButton(this, 500, 100, "Start Game", () => this.handleStartGame());

        // Initial setup.
        this.handleStakeChange();
        const currentBalance = this.registry.get(BALANCE_DATA) || 0n;
        this.handleBalanceChange(currentBalance);
        // Assume an initial status is stored in the registry.
        const initialStatus = this.registry.get('status') || "";
        this.handleStatusUpdate(initialStatus);
        this.updateActionButtons();

        // Initialize the viewport and zoom
        this.resize();

        // Listen for resize events
        this.scale.on('resize', this.resize, this);

        // Listen for events.
        const gameScene = this.scene.get("Main");
        this.events.on(STAKE_CHANGED_EVENT, this.handleStakeChange, this);
        gameScene.events.on(STATUS_UPDATED_EVENT, this.handleStatusUpdate, this);
        gameScene.events.on(BALANCE_UPDATED_EVENT, this.handleBalanceChange, this);
    }

    public reload(status: string): void {
        this.handleStakeChange();
        const currentBalance = this.registry.get(BALANCE_DATA) || 0n;
        this.handleBalanceChange(currentBalance);
        this.handleStatusUpdate(status);
    }

    private handleStakeChange(): void {
        const currentStake = this.getCurrentStake();
        this.registry.set(STAKE_DATA, currentStake);
        this.stakeText?.setText(`Stake: ${formatSuiAmount(currentStake)}`);
        if (this.stakeIndex === 0) {
            this.minusButton?.setAlpha(0.5).disableInteractive();
        } else if (this.stakeIndex === this.allowdStakes.length - 1) {
            this.plusButton?.setAlpha(0.5).disableInteractive();
        } else {
            this.minusButton?.setAlpha(1).setInteractive();
            this.plusButton?.setAlpha(1).setInteractive();
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

    private handleBalanceChange(balance: bigint): void {
        this.balanceText?.setText(`Balance: ${formatSuiAmount(balance)}`);
    }

    public setVisualBalance(balance: bigint): void {
        this.balanceText?.setText(`Balance: ${formatSuiAmount(balance)}`);
    }

    private changeStake(up: boolean): void {
        console.log("Changing stake", up);
        this.stakeIndex = up
            ? Math.min(this.stakeIndex + 1, this.allowdStakes.length - 1)
            : Math.max(this.stakeIndex - 1, 0);
        this.registry.set(STAKE_DATA, this.getCurrentStake());
        this.events.emit(STAKE_CHANGED_EVENT);
    }

    private getCurrentStake(): number {
        return this.allowdStakes[this.stakeIndex];
    }

    private updateActionButtons(): void {
        if (this.isGameOngoing) {
            this.advanceButton?.setVisible(true).setInteractive();
            this.cashOutButton?.setVisible(true).setInteractive();
            this.startGameButton?.setVisible(false).disableInteractive();
        }
        else {
            this.advanceButton?.setVisible(false).disableInteractive();
            this.cashOutButton?.setVisible(false).disableInteractive();
            this.startGameButton?.setVisible(true).setInteractive();
        }
    }

    private handleStartGame(): void {
        this.events.emit(START_GAME_REQUESTED_EVENT);
        console.log("Start game requested");
    }

    private handleAdvance(): void {
        const contextData: PiggyBankContextModel | undefined = this.registry.get(CONTEXT_DATA);
        if (!contextData) {
            return;
        }
        this.events.emit(ADVANCE_REQUESTED_EVENT);
        console.log("Advance requested");
    }

    private handleCashOut(): void {
        this.events.emit(CASH_OUT_REQUESTED_EVENT);
        console.log("Cash out requested");
    }
}


// A helper function to create a button container with a rounded rectangle background and centered text
function createButton(scene: Phaser.Scene, x: number, y: number, label: string, callback: Function) {
    // Button dimensions and styling
    const buttonWidth = 170;
    const buttonHeight = 50;
    const borderRadius = 10;

    // Create a container at the desired position
    const container = scene.add.container(x, y);

    // Create a graphics object to draw the background
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x444444, 1);
    // Draw a rounded rectangle centered at (0,0)
    graphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);

    // Create the text, centered on the button
    const buttonText = scene.add.text(0, 0, label, {
        fontSize: '20px',
        color: '#fff',
        fontFamily: 'sans-serif',
        resolution: window.devicePixelRatio
    }).setOrigin(0.5);

    // Add both the graphics and text to the container
    container.add([graphics, buttonText]);

    // Add the pointerdown event listener to call the provided callback
    container.on('pointerdown', callback);

    container.setSize(buttonWidth, buttonHeight);

    return container;
}