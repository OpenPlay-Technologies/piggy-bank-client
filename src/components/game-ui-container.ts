import ActionButton from "../components/action-button";
import DifficultySelector from "../components/difficulty-selector";
import { PiggyState } from "../components/enums";
import StakeSelector from "../components/stake-selector";
import {
    ADVANCE_REQUESTED_EVENT,
    CASH_OUT_REQUESTED_EVENT,
    CONTEXT_DATA,
    DESKTOP_UI_HEIGHT,
    GAME_LOADED_EVENT,
    MOBILE_UI_HEIGHT,
    START_GAME_REQUESTED_EVENT,
    STATUS_UPDATED_EVENT
} from "../constants";
import { PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { isPortrait } from "../utils/resize";
import { BalanceContainer } from "./balance-container";

export class GameUIContainer extends Phaser.GameObjects.Container {
    // State variables
    private isGameOngoing: boolean = false;
    private isGameLoading: boolean = false;

    // UI elements
    private startGameButton?: ActionButton;
    private advanceButton?: ActionButton;
    private cashOutButton?: ActionButton;

    // Dimensions
    private startY: number = 0;
    private uiFrameWidth: number = 500;
    private stakeSelectorHeight: number = 100;
    private padding: number = 10;
    private difficultySelectorHeight: number = 60;

    background: any;
    plusButton: Phaser.GameObjects.Container | undefined;
    minusButton: Phaser.GameObjects.Container | undefined;
    stakeSelector: StakeSelector | undefined;
    difficultySelector: DifficultySelector | undefined;
    buttonHeight: number = 0;
    balanceContainer: BalanceContainer;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        // Create background texture if it doesn't exist
        if (!this.scene.textures.exists("ui-mobile-bg")) {
            const bgGraphics = this.scene.add.graphics();
            bgGraphics.fillStyle(0x222222, 1);
            bgGraphics.fillRect(0, 0, 800, 600);
            bgGraphics.generateTexture("ui-mobile-bg", 800, 600);
            bgGraphics.destroy();
        }
        this.background = this.scene.add.image(0, 0, "ui-mobile-bg").setOrigin(0, 0);
        // Add background to the container
        this.add(this.background);

        // Create buttons
        this.advanceButton = new ActionButton(this.scene, 0, 0, {
            color: 0xd19a19,
            text: "ADVANCE",
            onClick: () => this.handleAdvance(),
        });
        this.cashOutButton = new ActionButton(this.scene, 0, 0, {
            color: 0x4b9c5c,
            text: "CASH OUT",
            onClick: () => this.handleCashOut(),
        });
        this.startGameButton = new ActionButton(this.scene, 0, 0, {
            color: 0x8e8bc4,
            text: "START",
            onClick: () => this.handleStartGame(),
        });

        // Create stake and difficulty selectors
        this.stakeSelector = new StakeSelector(this.scene, 0, 0, {
            mainColor: 0x8e8bc4,
        });
        this.difficultySelector = new DifficultySelector(this.scene, 0, 0, {
            mainColor: 0x8e8bc4,
        });

        // Balance container
        this.balanceContainer = new BalanceContainer(this.scene, 0, 0);
        this.add(this.balanceContainer);

        // Add all UI elements to the container
        this.add([
            this.advanceButton,
            this.cashOutButton,
            this.startGameButton,
            this.stakeSelector,
            this.difficultySelector
        ]);

        // Initial setup.
        this.loadSetup();

        // Perform initial sizing
        this.resize();

        // Listen for resize events on the parent scene
        this.scene.scale.on('resize', this.resize, this);

        // Listen for events from the game scene
        const gameScene = this.scene.scene.get("Main");
        gameScene.events.on(STATUS_UPDATED_EVENT, this.handleStatusUpdate, this);
        gameScene.events.on(GAME_LOADED_EVENT, () => this.loadSetup, this);
    }

    loadSetup() {
        const initialStatus = this.scene.registry.get('status') || "";
        this.handleStatusUpdate(initialStatus);
        this.updateActionButtons();
    }

    resize() {
        // Get the current width and height from the Scale Manager
        const width = this.scene.scale.width / window.devicePixelRatio;
        const height = this.scene.scale.height / window.devicePixelRatio;
        this.width = width;
        this.height = height;

        if (height < 800){
            this.padding = 5;
            this.difficultySelectorHeight = 40;
        }
        else {
            this.padding = 10;
            this.difficultySelectorHeight = 60;
        }

        this.stakeSelectorHeight = 60;
        this.buttonHeight = 60;
        this.uiFrameWidth = 250;

        if (isPortrait(width, height)) {
            // Portrait mode
            console.log("Portrait mode detected");
            this.startY = height * (1 - MOBILE_UI_HEIGHT);

            if (this.background) {
                this.background.setDisplaySize(this.width, MOBILE_UI_HEIGHT * height);
                this.background.setPosition(0, this.startY);
            }

            // const rect = this.scene.add.rectangle(0, this.startY, this.width, MOBILE_UI_HEIGHT * height, 0xff0000);
            // this.add(rect);
            // rect.setOrigin(0, 0);
            // rect.setInteractive();
            // rect.setDepth(10);
            // rect.setScale(window.devicePixelRatio);
            // console.log("rect size", rect.width, rect.height);

            if (this.cashOutButton) {
                this.cashOutButton.setPosition((this.width - this.uiFrameWidth / 2) / 2, this.height - this.buttonHeight / 2 - this.padding - 60);
                this.cashOutButton.resize((this.uiFrameWidth - this.padding) / 2, this.buttonHeight);
            }
            if (this.advanceButton) {
                this.advanceButton.setPosition((this.width + this.uiFrameWidth / 2) / 2, this.height - this.buttonHeight / 2 - this.padding - 60);
                this.advanceButton.resize((this.uiFrameWidth - this.padding) / 2, this.buttonHeight);
            }
            if (this.startGameButton) {
                this.startGameButton.setPosition(this.width / 2, this.height - this.buttonHeight / 2 - this.padding - 60);
                this.startGameButton.resize(this.uiFrameWidth, this.buttonHeight);
            }
            if (this.stakeSelector) {
                this.stakeSelector.setPosition((this.width - this.uiFrameWidth) / 2, this.startY + this.padding);
                this.stakeSelector.resize(this.uiFrameWidth, this.stakeSelectorHeight);
            }
            if (this.difficultySelector) {
                this.difficultySelector.setPosition((this.width - this.uiFrameWidth) / 2, this.startY + this.stakeSelectorHeight + 2 * this.padding);
                this.difficultySelector.resize(this.uiFrameWidth, this.difficultySelectorHeight, false);
            }
            if (this.balanceContainer) {
                this.balanceContainer.setPosition(this.width / 2, this.height - this.buttonHeight / 2 - this.padding);
            }
        } else {
            // Desktop mode
            console.log("Desktop mode detected");
            this.startY = height * (1 - DESKTOP_UI_HEIGHT);

            if (this.background) {
                this.background.setDisplaySize(this.width, DESKTOP_UI_HEIGHT * height);
                this.background.setPosition(0, this.startY);
            }

            if (this.plusButton) {
                this.plusButton.setPosition((this.width + 100) / 2, this.startY + 100);
            }
            if (this.minusButton) {
                this.minusButton.setPosition((this.width - 100) / 2, this.startY + 100);
            }
            if (this.cashOutButton) {
                this.cashOutButton.setPosition((this.width + this.padding + this.uiFrameWidth / 2) / 2, this.startY + this.buttonHeight / 2 + this.padding);
                this.cashOutButton.resize((this.uiFrameWidth - this.padding) / 2, this.buttonHeight - this.padding);
            }
            if (this.advanceButton) {
                this.advanceButton.setPosition((this.width + this.padding + 1.5 * this.uiFrameWidth) / 2, this.startY + this.buttonHeight / 2 + this.padding);
                this.advanceButton.resize((this.uiFrameWidth - this.padding) / 2, this.buttonHeight - this.padding);
            }
            if (this.startGameButton) {
                this.startGameButton.setPosition((this.width + this.uiFrameWidth + this.padding) / 2, this.startY + this.buttonHeight / 2 + this.padding);
                this.startGameButton.resize(this.uiFrameWidth, this.buttonHeight - this.padding);
            }
            if (this.stakeSelector) {
                this.stakeSelector.setPosition(this.width / 2 - this.uiFrameWidth - this.padding / 2, this.startY + this.padding);
                this.stakeSelector.resize(this.uiFrameWidth, this.stakeSelectorHeight);
            }
            if (this.balanceContainer){
                this.balanceContainer.setPosition((this.width + this.uiFrameWidth + this.padding) / 2, this.startY + this.stakeSelectorHeight + 2 * this.padding + (this.difficultySelector?.height ?? 0)/2);
            }
            if (this.difficultySelector) {
                this.difficultySelector.setPosition(this.width / 2 - this.uiFrameWidth - this.padding / 2, this.startY + this.stakeSelectorHeight + 2 * this.padding);
                this.difficultySelector.resize(this.uiFrameWidth, this.height - this.startY - this.stakeSelectorHeight - 3 * this.padding);
            }
        }
    }

    public reload(status: string): void {
        this.handleStatusUpdate(status);
    }

    private handleStatusUpdate(status: string): void {
        switch (status) {
            case PiggyState.ADVANCE_STAGE_1:
                this.isGameLoading = true;
                this.isGameOngoing = true;
                break;
            case PiggyState.ADVANCE_STAGE_2:
                this.isGameLoading = false;
                this.isGameOngoing = true;
                break;
            case PiggyState.CASHING_OUT:
                this.isGameLoading = true;
                this.isGameOngoing = true;
                break;
            case PiggyState.DYING:
                this.isGameLoading = true;
                this.isGameOngoing = true;
                break;
            case PiggyState.WINNING:
                this.isGameLoading = true;
                this.isGameOngoing = true;
                break;
            case PiggyState.GAME_ONGOING_IDLE:
                this.isGameOngoing = true;
                this.isGameLoading = false;
                break;
            case PiggyState.NO_GAME_IDLE:
                this.isGameOngoing = false;
                this.isGameLoading = false;
                break;
            default:
                break;
        }
        this.updateActionButtons();
    }

    private updateActionButtons(): void {
        if (this.isGameLoading) {
            this.startGameButton?.setEnabled(false);
            this.advanceButton?.setEnabled(false);
            this.cashOutButton?.setEnabled(false);
        } else {
            this.startGameButton?.setEnabled(true);
            this.advanceButton?.setEnabled(true);
            this.cashOutButton?.setEnabled(true);
        }

        if (this.isGameOngoing) {
            this.advanceButton?.setVisible(true).setInteractive();
            this.cashOutButton?.setVisible(true).setInteractive();
            this.startGameButton?.setVisible(false).disableInteractive();
        } else {
            this.advanceButton?.setVisible(false).disableInteractive();
            this.cashOutButton?.setVisible(false).disableInteractive();
            this.startGameButton?.setVisible(true).setInteractive();
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
