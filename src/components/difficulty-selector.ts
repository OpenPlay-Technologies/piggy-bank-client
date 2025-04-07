import { darkenColor, lightenColor } from "../utils/colors";
import { IconButton } from "./icon-button";
import { DIFFICULTY_CHANGED_EVENT, DIFFICULTY_DATA } from "../constants";

interface DifficultyConfig {
    mainColor?: number;
    cornerRadius?: number;
    lineWidth?: number;
}

export default class DifficultySelector extends Phaser.GameObjects.Container {
    // State variables
    private difficultyIndex: number = 1; // default to "MEDIUM"
    private difficulties: string[] = ["EASY", "MEDIUM", "HARD"];

    // Configuration and state
    private mainColor: number;
    private cornerRadius: number;
    private lineWidth: number;

    // Game objects
    private graphics: Phaser.GameObjects.Graphics;
    private filledRect: Phaser.GameObjects.Graphics;
    private difficultyDisplayText: Phaser.GameObjects.Text;
    private leftButton: IconButton;
    private rightButton: IconButton;
    padding: number;
    bgPadding: number = 10; // Padding for button spacing

    // Constants
    private readonly buttonHeight: number = 70; // Fixed height for the inner rectangle

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
        config: DifficultyConfig = {}
    ) {
        super(scene, x, y);
        // Set initial default size; these can be changed later via resize()
        const defaultWidth = 300;
        const defaultHeight = 150;
        this.setSize(defaultWidth, defaultHeight);
        scene.add.existing(this);

        // --- CONFIG / STATE ---
        this.mainColor = config.mainColor ?? 0xffffff;
        this.cornerRadius = config.cornerRadius ?? 16;
        this.lineWidth = config.lineWidth ?? 2;
        this.padding = defaultWidth * 0.05;

        // --- DRAW OUTER STROKE (BORDER) ---
        this.graphics = scene.add.graphics();
        this.graphics.lineStyle(this.lineWidth, darkenColor(this.mainColor, 0.6), 2);
        this.graphics.fillStyle(0x000000, 0);
        this.graphics.strokeRoundedRect(0, 0, defaultWidth, defaultHeight, this.cornerRadius);
        this.add(this.graphics);

        // --- DRAW INNER FILLED ROUNDED RECTANGLE ---
        this.filledRect = scene.add.graphics();
        this.add(this.filledRect);

        // --- ADD NAVIGATION BUTTONS ---
        // Button size is set to the fixed button height.
        this.leftButton = new IconButton(
            scene,
            0, // Will be updated in updateLayout()
            0,
            this.mainColor,
            'chevron-left-icon',
            () => this.changeDifficulty(false)
        );
        this.add(this.leftButton);

        this.rightButton = new IconButton(
            scene,
            0, // Will be updated in updateLayout()
            0,
            this.mainColor,
            'chevron-right-icon',
            () => this.changeDifficulty(true)
        );
        this.add(this.rightButton);

        // --- ADD DIFFICULTY TEXT ---
        this.difficultyDisplayText = scene.add.text(0, 0, this.difficulties[this.difficultyIndex], {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + lightenColor(this.mainColor, 0.8).toString(16),
        });
        this.difficultyDisplayText.setOrigin(0.5, 0.5);
        this.add(this.difficultyDisplayText);

        // Initial layout update and state
        this.updateLayout();
        this.handleDifficultyChange();

        // Optionally, listen for external events:
        this.scene.events.on(DIFFICULTY_CHANGED_EVENT, this.handleDifficultyChange, this);
    }

    private handleDifficultyChange(): void {
        const currentDifficulty = this.getCurrentDifficulty();
        // Update registry (if using registry to store difficulty state)
        this.scene.registry.set(DIFFICULTY_DATA, currentDifficulty);
        // Update the displayed text
        this.difficultyDisplayText.setText(currentDifficulty);

        // Disable buttons at boundaries
        if (this.difficultyIndex === 0) {
            this.leftButton.setAlpha(0.5).disableInteractive();
        } else if (this.difficultyIndex === this.difficulties.length - 1) {
            this.rightButton.setAlpha(0.5).disableInteractive();
        } else {
            this.leftButton.setAlpha(1).setInteractive();
            this.rightButton.setAlpha(1).setInteractive();
        }
    }

    private getCurrentDifficulty(): string {
        return this.difficulties[this.difficultyIndex];
    }

    private changeDifficulty(increase: boolean): void {
        this.difficultyIndex = increase
            ? Math.min(this.difficultyIndex + 1, this.difficulties.length - 1)
            : Math.max(this.difficultyIndex - 1, 0);
        // Update the difficulty state and UI
        this.scene.registry.set(DIFFICULTY_DATA, this.getCurrentDifficulty());
        this.scene.events.emit(DIFFICULTY_CHANGED_EVENT);
    }

    /**
     * Updates the layout to ensure proper positioning of all elements.
     */
    private updateLayout(): void {
        const width = this.width;

        // Redraw inner filled rectangle
        this.filledRect.clear();
        this.filledRect.fillStyle(this.mainColor, 1);
        this.filledRect.fillRoundedRect(this.bgPadding, this.bgPadding, width - 2 * this.bgPadding, this.buttonHeight, this.cornerRadius);

        // Reposition navigation buttons
        const verticalCenter = this.buttonHeight / 2 + this.bgPadding;
        this.leftButton.setPosition(this.bgPadding + this.buttonHeight / 2, verticalCenter);
        this.leftButton.resize(this.buttonHeight, this.buttonHeight); // Ensure button size is fixed
        this.rightButton.setPosition(width - this.buttonHeight / 2 - this.bgPadding, verticalCenter);
        this.rightButton.resize(this.buttonHeight, this.buttonHeight); // Ensure button size is fixed
        // Center the difficulty text
        this.difficultyDisplayText.setPosition(width / 2, verticalCenter);
    }

    /**
     * Resizes the component.
     * @param width - New width of the component.
     * @param height - New height of the component.
     */
    public resize(width: number, height: number): void {
        this.setSize(width, height);
        this.padding = width * 0.05;

        // Redraw outer border
        this.graphics.clear();
        this.graphics.lineStyle(this.lineWidth, darkenColor(this.mainColor, 0.6), 2);
        this.graphics.fillStyle(0x000000, 0);
        this.graphics.strokeRoundedRect(0, 0, width, height, this.cornerRadius);

        // Update layout for inner elements
        this.updateLayout();
    }
}
