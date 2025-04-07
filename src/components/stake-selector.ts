import { darkenColor, lightenColor } from "../utils/colors";
import { IconButton } from "./icon-button";
import { mistToSUI } from "../utils/helpers";
import { STAKE_CHANGED_EVENT, STAKE_DATA } from "../constants";

interface BetDifficultyConfig {
    mainColor?: number;
    buttonHeight?: number;
    cornerRadius?: number;
    lineWidth?: number;
}

export default class StakeSelector extends Phaser.GameObjects.Container {
    // State variables
    private stakeIndex: number = 0;
    private allowdStakes: number[] = [1e7, 2e7, 3e7, 5e7, 10e7];

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
        this.cornerRadius = config.cornerRadius ?? 16;
        this.lineWidth = config.lineWidth ?? 2;
        this.padding = defaultWidth * 0.05; // Padding based on width

        // --- DRAW OUTER BORDER ---
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(this.lineWidth, darkenColor(this.mainColor, 0.6), 2);
        this.graphics.fillStyle(0x000000, 0);
        this.graphics.strokeRoundedRect(0, 0, defaultWidth, defaultHeight, this.cornerRadius);
        this.add(this.graphics);

        // --- ADD TEXT LABEL ("BET") ---
        const verticalCenter = defaultHeight / 2;
        this.betLabel = scene.add.text(this.padding, verticalCenter, 'BET', {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + this.mainColor.toString(16),
        });
        this.betLabel.setOrigin(0, 0.5);
        this.add(this.betLabel);

        // --- CREATE PLUS and MINUS BUTTONS ---
        // Button size is computed as a fraction of container height
        // Plus button (rightmost)
        this.plusButton = new IconButton(
            scene,
            0,
            0,
            this.mainColor,
            'plus-icon',
            () => this.changeStake(true)
        );
        this.add(this.plusButton);

        // Minus button (to the left of plus button)
        this.minusButton = new IconButton(
            scene,
            0,
            0,
            this.mainColor,
            'minus-icon',
            () => this.changeStake(false)
        );
        this.add(this.minusButton);

        // --- ADD STAKE DISPLAY TEXTS ---
        const centerX = defaultWidth / 2;
        // Bet amount display text (right-aligned)
        this.betDisplayText = scene.add.text(centerX - 20, verticalCenter, '', {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + lightenColor(this.mainColor, 0.8).toString(16),
        });
        this.betDisplayText.setOrigin(0, 0.5);
        this.add(this.betDisplayText);

        // Currency text ("SUI") placed to the right of the bet amount
        this.currencyText = scene.add.text(centerX + 5, verticalCenter, 'SUI', {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + this.mainColor.toString(16),
        });
        this.currencyText.setOrigin(0, 0.5);
        this.add(this.currencyText);

        // Initial layout update and stake value update
        this.updateLayout();
        this.handleStakeChange();

        this.scene.events.on(STAKE_CHANGED_EVENT, this.handleStakeChange, this);
    }

    private handleStakeChange(): void {
        const currentStake = this.getCurrentStake();
        this.scene.registry.set(STAKE_DATA, currentStake);
        this.betDisplayText?.setText(`${mistToSUI(currentStake)}`);
        if (this.stakeIndex === 0) {
            this.minusButton?.setAlpha(0.5).disableInteractive();
        } else if (this.stakeIndex === this.allowdStakes.length - 1) {
            this.plusButton?.setAlpha(0.5).disableInteractive();
        } else {
            this.minusButton?.setAlpha(1).setInteractive();
            this.plusButton?.setAlpha(1).setInteractive();
        }
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
        const buttonSize = height * 0.8;
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
        const centerX = width / 2;
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
