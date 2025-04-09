import { darkenColor, lightenColor } from "../utils/colors";
import { IconButton } from "./icon-button";
import { CONTEXT_DATA, DIFFICULTY_CHANGED_EVENT, DIFFICULTY_DATA, GAME_LOADED_EVENT, STATUS_DATA, STATUS_UPDATED_EVENT } from "../constants";
import { PiggyState } from "./enums";
import { PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { getCurrentDifficulty } from "../utils/registry";

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
    padding: number = 10;
    bgPadding: number = 4; // Padding for button spacing

    // Constants
    private readonly buttonHeight: number = 30; // Fixed height for the inner rectangle
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
        config: DifficultyConfig = {}
    ) {
        super(scene, x, y);
        // Set initial default size; these can be changed later via resize()
        const defaultWidth = 250;
        const defaultHeight = 60;
        this.setSize(defaultWidth, defaultHeight);
        scene.add.existing(this);

        // --- CONFIG / STATE ---
        this.mainColor = config.mainColor ?? 0xffffff;
        this.cornerRadius = config.cornerRadius ?? 8;
        this.lineWidth = config.lineWidth ?? 2;
        this.padding = 10;

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
            'chevron-left-icon',
            () => this.changeDifficulty(false)
        );
        this.add(this.leftButton);

        this.rightButton = new IconButton(
            scene,
            0, // Will be updated in updateLayout()
            0,
            'chevron-right-icon',
            () => this.changeDifficulty(true)
        );
        this.add(this.rightButton);

        // --- ADD DIFFICULTY TEXT ---
        this.difficultyDisplayText = scene.add.text(0, 0, this.difficulties[this.difficultyIndex], {
            fontSize: "16px",
            fontFamily: "Arial Black",
            color: "#" + lightenColor(this.mainColor, 0.8).toString(16),
        });
        this.difficultyDisplayText.setOrigin(0.5, 0.5);
        this.difficultyDisplayText.setResolution(window.devicePixelRatio); // Set resolution for better text quality
        this.add(this.difficultyDisplayText);

        // Initial layout update and state
        this.updateLayout();
        this.loadSetup();
        this.loadDifficultyFromContext();

        // Listen for events from the game scene
        const gameScene = this.scene.scene.get("Main");
        gameScene.events.on(GAME_LOADED_EVENT, () => this.loadDifficultyFromContext, this);
        gameScene.events.on(STATUS_UPDATED_EVENT, this.handleStatusUpdate, this);
    }

    loadSetup() {
        const initialStatus = this.scene.registry.get(STATUS_DATA) || "";
        this.handleStatusUpdate(initialStatus);
    }

    private loadDifficultyFromContext(): void {
        console.log("Loading difficulty index from context...");
        const context: PiggyBankContextModel | undefined = this.scene.registry.get(CONTEXT_DATA);
        if (context) {
            const difficulty = getCurrentDifficulty(this.scene.registry);
            if (!difficulty) {
                throw new Error("Difficulty not found in context data.");
            }
            this.difficultyIndex = this.difficulties.indexOf(difficulty);
            if (this.difficultyIndex === -1) {
                this.difficultyIndex = 0; // Default to first stake if not found
            }
            console.log("Difficulty index set to:", this.difficultyIndex);
        } else {
            this.difficultyIndex = 0; // Default to first stake if no context
        }
        this.handleDifficultyChange();
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
        this.updateVisualState();
    }

    private handleDifficultyChange(): void {
        const currentDifficulty = this.getSetDifficulty();
        // Update registry (if using registry to store difficulty state)
        this.scene.registry.set(DIFFICULTY_DATA, currentDifficulty);
        // Update the displayed text
        this.difficultyDisplayText.setText(currentDifficulty);
        this.scene.events.emit(DIFFICULTY_CHANGED_EVENT);

        this.updateActionButtons();
    }

    private updateActionButtons(): void {
        // Disable buttons at boundaries
        if (this.difficultyIndex === 0 || this.isGameOngoing) {
            this.leftButton.setEnabled(false);
        }
        else {
            this.leftButton.setEnabled(true);
        }

        if ((this.difficultyIndex === this.difficulties.length - 1) || this.isGameOngoing) {
            this.rightButton.setEnabled(false);
        } else {
            this.rightButton.setEnabled(true);
        }
    }

    private getSetDifficulty(): string {
        return this.difficulties[this.difficultyIndex];
    }

    private changeDifficulty(increase: boolean): void {
        this.difficultyIndex = increase
            ? Math.min(this.difficultyIndex + 1, this.difficulties.length - 1)
            : Math.max(this.difficultyIndex - 1, 0);
        // Update the difficulty state and UI
        this.handleDifficultyChange();
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
    public resize(width: number, height: number, stroke: boolean = true): void {
        this.setSize(width, height);

        this.graphics.clear();
        if (stroke) {
            this.graphics.lineStyle(this.lineWidth, darkenColor(this.mainColor, 0.6), 2);
            this.graphics.fillStyle(0x000000, 0);
            this.graphics.strokeRoundedRect(0, 0, width, height, this.cornerRadius);
        }

        // Update layout for inner elements
        this.updateLayout();
    }

    private updateVisualState(): void {
        this.alpha = this.isGameOngoing ? 0.5 : 1;
    }
}
