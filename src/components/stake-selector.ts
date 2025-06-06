import { darkenColor, lightenColor } from "../utils/colors";
import { IconButton } from "./icon-button";
import { mistToSUI } from "../utils/helpers";
import { CONTEXT_DATA, GAME_LOADED_EVENT, STAKE_CHANGED_EVENT, STAKE_DATA, STATUS_DATA, STATUS_UPDATED_EVENT } from "../constants";
import { PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { PiggyState } from "./enums";
import { GAME_ONGOING_STATUS } from "../sui/constants/piggybank-constants";

interface BetDifficultyConfig {
    mainColor?: number;
    buttonHeight?: number;
    cornerRadius?: number;
    lineWidth?: number;
}

export default class StakeSelector extends Phaser.GameObjects.Container {
    // State variables
    private stakeIndex: number = 0;
    private allowdStakes: number[] = [1e7, 5e7, 10e7, 20e7, 50e7, 1e9];

    // Configuration and state
    private mainColor: number;
    private cornerRadius: number;
    private lineWidth: number;

    // Game objects
    private graphics: Phaser.GameObjects.Graphics;
    private betLabel: Phaser.GameObjects.Text;
    private minusButton: IconButton;
    private plusButton: IconButton;
    private betDisplayText: Phaser.GameObjects.Text;
    private currencyText: Phaser.GameObjects.Text;
    padding: number;
    isGameOngoing: boolean = false;

    /**
     * @param scene - The Scene to which this UI component belongs.
     * @param x - The x position of this container.
     * @param y - The y position of this container.
     * @param config - Optional configuration (colors, dimensions, etc.)
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        config: BetDifficultyConfig = {}
    ) {
        super(scene, x, y);
        // Set initial default size; these can be changed later via resize()
        const defaultWidth = 300;
        const defaultHeight = 100;
        this.setSize(defaultWidth, defaultHeight);
        scene.add.existing(this);

        // --- CONFIG / STATE ---
        this.mainColor = config.mainColor ?? 0xffffff;
        this.cornerRadius = config.cornerRadius ?? 8;
        this.lineWidth = config.lineWidth ?? 2;
        this.padding = 10; // Padding based on width

        // --- DRAW OUTER BORDER ---
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(this.lineWidth, darkenColor(this.mainColor, 0.6), 2);
        this.graphics.fillStyle(0x000000, 0);
        this.graphics.strokeRoundedRect(0, 0, defaultWidth, defaultHeight, this.cornerRadius);
        this.add(this.graphics);

        // --- ADD TEXT LABEL ("BET") ---
        const verticalCenter = defaultHeight / 2;
        this.betLabel = scene.add.text(this.padding, verticalCenter, 'BET', {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: "#" + this.mainColor.toString(16),
        });
        this.betLabel.setOrigin(0, 0.5);
        this.betLabel.setResolution(window.devicePixelRatio); // Set resolution for better text quality
        this.add(this.betLabel);

        // --- CREATE PLUS and MINUS BUTTONS ---
        // Button size is computed as a fraction of container height
        // Plus button (rightmost)
        this.plusButton = new IconButton(
            scene,
            0,
            0,
            'plus-icon',
            () => this.changeStake(true),
            true,
            this.mainColor
        );
        this.add(this.plusButton);

        // Minus button (to the left of plus button)
        this.minusButton = new IconButton(
            scene,
            0,
            0,
            'minus-icon',
            () => this.changeStake(false),
            true,
            this.mainColor
        );
        this.add(this.minusButton);

        // --- ADD STAKE DISPLAY TEXTS ---
        const centerX = defaultWidth / 2;
        // Bet amount display text (right-aligned)
        this.betDisplayText = scene.add.text(centerX - 20, verticalCenter, '', {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: "#" + lightenColor(this.mainColor, 0.8).toString(16),
        });
        this.betDisplayText.setOrigin(0, 0.5);
        this.betDisplayText.setResolution(window.devicePixelRatio); // Set resolution for better text quality
        this.add(this.betDisplayText);

        // Currency text ("SUI") placed to the right of the bet amount
        this.currencyText = scene.add.text(centerX + 5, verticalCenter, 'SUI', {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: "#" + this.mainColor.toString(16),
        });
        this.currencyText.setOrigin(0, 0.5);
        this.currencyText.setResolution(window.devicePixelRatio); // Set resolution for better text quality
        this.add(this.currencyText);

        // Initial layout update and stake value update
        this.loadSetup();
        this.updateLayout();
        this.handleStakeChange();
        this.loadStakeIndexFromContext();

        this.scene.events.on(STAKE_CHANGED_EVENT, this.handleStakeChange, this);
        // Listen for events from the game scene
        const gameScene = this.scene.scene.get("Main");
        gameScene.events.on(GAME_LOADED_EVENT, this.loadStakeIndexFromContext, this);
        gameScene.events.on(STATUS_UPDATED_EVENT, this.handleStatusUpdate, this);
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

    loadSetup() {
        const initialStatus = this.scene.registry.get(STATUS_DATA) || "";
        this.handleStatusUpdate(initialStatus);
    }

    private handleStakeChange(): void {
        const currentStake = this.getCurrentStake();
        console.log("handleStakeChange called, currentStake:", currentStake);
        this.scene.registry.set(STAKE_DATA, currentStake);
        this.betDisplayText?.setText(`${mistToSUI(currentStake)}`);
        this.updateActionButtons();
    }

    private updateActionButtons(): void {
        if (this.stakeIndex === 0 || this.isGameOngoing) {
            this.minusButton?.setAlpha(0.5).disableInteractive();
        }
        else {
            this.minusButton?.setAlpha(1).setInteractive();
        }

        if (this.stakeIndex === this.allowdStakes.length - 1 || this.isGameOngoing) {
            this.plusButton?.setAlpha(0.5).disableInteractive();
        }
        else {
            this.plusButton?.setAlpha(1).setInteractive();
        }
    }

    private loadStakeIndexFromContext(): void {
        console.log("Loading stake index from context...");
        const context: PiggyBankContextModel | undefined = this.scene.registry.get(CONTEXT_DATA);
        if (context && context.status == GAME_ONGOING_STATUS) {
            const stakeAmount = Number(context.stake);
            this.stakeIndex = this.allowdStakes.indexOf(stakeAmount);
            if (this.stakeIndex === -1) {
                this.stakeIndex = 0; // Default to first stake if not found
            }
            console.log("Stake index set to:", this.stakeIndex);
        }
        this.handleStakeChange();
    }

    private getCurrentStake(): number {
        return this.allowdStakes[this.stakeIndex];
    }

    /**
     * Updates the layout and positions of all inner elements based on the current size.
     */
    private updateLayout(): void {
        const width = this.width;
        const height = this.height;
        this.padding = width * 0.05;
        const verticalCenter = height / 2;

        // --- Redraw outer border ---
        this.graphics.clear();
        this.graphics.lineStyle(this.lineWidth, darkenColor(this.mainColor, 0.6), 2);
        this.graphics.fillStyle(0x000000, 0);
        this.graphics.strokeRoundedRect(0, 0, width, height, this.cornerRadius);

        // --- Update "BET" label position ---
        this.betLabel.setPosition(this.padding, verticalCenter);

        // --- Update button sizes and positions ---
        // Here we calculate the button size as a fraction of container height.
        const buttonSize = 40;
        const buttonSpacing = 10;
        // Reposition plus button
        this.plusButton.setPosition(
            width - this.padding - buttonSize / 2,
            verticalCenter
        );
        this.plusButton.resize(buttonSize, buttonSize);
        // Reposition minus button (to the left of plus button)
        this.minusButton.setPosition(
            width - this.padding - buttonSpacing - buttonSize - buttonSize / 2,
            verticalCenter
        );
        this.minusButton.resize(buttonSize, buttonSize);

        // --- Update stake display texts positions ---
        this.betDisplayText.setPosition(this.betLabel.x + this.betLabel.width + this.padding, verticalCenter);
        this.currencyText.setPosition(this.betDisplayText.x + this.betDisplayText.width + 5, verticalCenter);
    }

    private changeStake(up: boolean): void {
        this.stakeIndex = up
            ? Math.min(this.stakeIndex + 1, this.allowdStakes.length - 1)
            : Math.max(this.stakeIndex - 1, 0);
        this.scene.registry.set(STAKE_DATA, this.getCurrentStake());
        this.scene.events.emit(STAKE_CHANGED_EVENT);
    }

    /**
     * Resizes the component.
     * @param width - New width of the component.
     * @param height - New height of the component.
     */
    public resize(width: number, height: number): void {
        this.setSize(width, height);
        // Update layout which will redraw the border and reposition all elements
        this.updateLayout();
    }
}
