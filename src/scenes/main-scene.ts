// import { GameModel } from "@/api/models/openplay-coin-flip";
import { Scene } from "phaser";
import BackendService, { IBackendService } from "../components/backend-service";
import { Dialog } from "../components/dialog";
import { ADVANCE_REQUESTED_EVENT, BALANCE_DATA, BALANCE_UPDATED_EVENT, CASH_OUT_REQUESTED_EVENT, COLUMN_WIDTH, CONTEXT_DATA, ERROR_EVENT, GAME_DATA, HEIGHT, INTERACTED_EVENT, MOBILE_UI_HEIGHT, PLATFORM_CLICKED_EVENT, PLATFORM_PASSED_TINT, STAKE_DATA, START_GAME_REQUESTED_EVENT, STATUS_UPDATED_EVENT, WORLD_HEIGHT, Y_POS } from "../constants";
import { GAME_ONGOING_STATUS, GAME_FINISHED_STATUS, EMPTY_POSITION } from "../sui/constants/piggybank-constants";
import { GameModel, InteractedWithGameModel, PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import MockBackendService from "../components/mock-backend-service";
import { PiggyState, ActionType } from "../components/enums";
import addDecoration from "./main-helpers/decorations";
import setupPlatforms from "./main-helpers/platforms";
import setupPiggy from "./main-helpers/piggy";



export class Main extends Scene {

    safespots: { x: number; y: number; text: string; }[];
    safespotObjects: Phaser.GameObjects.Rectangle[] | undefined;
    currentSpot: number;
    dialog: Dialog | undefined;
    pig: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    backendService: IBackendService | undefined;
    walkTwig: Phaser.Tweens.Tween | undefined;
    leftEnd: Phaser.GameObjects.Image | undefined;
    safespotColumns: Phaser.GameObjects.Container[] | undefined;
    worldWidth: number = 0;

    status: PiggyState = PiggyState.NO_GAME_IDLE;
    queuedAction: ActionType | undefined;
    gameUI: Phaser.Scenes.ScenePlugin | undefined;


    constructor() {
        super('Main');
        this.currentSpot = EMPTY_POSITION;
        this.safespots = [];
    }

    init() {
        // Load the context
        const contextData: PiggyBankContextModel | undefined = this.registry.get(CONTEXT_DATA);
        if (contextData && contextData.status === GAME_ONGOING_STATUS) {
            console.log("Game resumed", contextData);
            this.currentSpot = contextData.current_position;
            this.status = PiggyState.GAME_ONGOING_IDLE;
        }
        // Define width of the world based on the number of safe spots
        const gameData: GameModel | undefined = this.registry.get(GAME_DATA);
        if (!gameData) {
            console.error("Game data not found in the registry");
            return;
        }
        this.worldWidth = COLUMN_WIDTH * (gameData.steps_payout_bps.length + 1);

        // Initialize the backend service, passing this scene to allow event communication
        if (!(import.meta.env.VITE_DUMMY_BACKEND === 'true')) {
            this.backendService = new BackendService(this);
        }
        else {
            this.backendService = new MockBackendService(this);
        }

        // Set up the UI
        this.scene.launch('GameUIScene');
    }

    // resizeCamera() {
    //     const screenWidth = window.innerWidth;
    //     const screenHeight = window.innerHeight;


    //     let viewportHeight, zoomFactor;

    //     viewportHeight = screenHeight - MOBILE_UI_HEIGHT;
    //     zoomFactor = viewportHeight / WORLD_HEIGHT;
    //     // Set the viewport to fill the device width and the calculated height
    //     this.cameras.main.setViewport(0, 0, screenWidth, viewportHeight);

    //     // Apply the zoom factor so that WORLD_HEIGHT fits into the viewport height
    //     this.cameras.main.setZoom(zoomFactor);
    // }

    create() {
        this.physics.world.setBounds(0, 0, this.worldWidth, WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, this.worldWidth, WORLD_HEIGHT);

        // Initialize the viewport and zoom
        // this.resizeCamera();

        // Listen for resize events and UI ready event
        // this.scale.on('resize', this.resizeCamera, this);

        // === Left End Column ===
        // Place the left end asset at the center of the first column.
        const leftEndX = COLUMN_WIDTH / 2;
        this.leftEnd = this.add.image(leftEndX, HEIGHT / 2, "leftEnd").setOrigin(0.5);

        // === Add the decoration elements to the scene ===
        addDecoration(this);

        // === Dynamic Platforms ===
        setupPlatforms(this);

        // === Pig character ===
        setupPiggy(this);

        // === Error Dialog ===
        // Create the dialog component centered on the screen
        this.dialog = new Dialog(this, this.cameras.main.centerX, this.cameras.main.centerY, 400, 300);

        // === Camera ===
        // Follow pig with the camera
        if (this.pig) {
            this.cameras.main.startFollow(this.pig, true);
        }

        // === Event Listeners ===
        const uiScene = this.scene.get('GameUIScene');
        this.events.on(INTERACTED_EVENT, this.handleInteractedEvent, this);
        this.events.on(ERROR_EVENT, this.handleError, this);
        this.events.on(PLATFORM_CLICKED_EVENT, this.handlePlatformClicked, this);
        uiScene.events.on(START_GAME_REQUESTED_EVENT, this.handleStartGameRequested, this);
        uiScene.events.on(ADVANCE_REQUESTED_EVENT, this.handleAdvanceRequested, this);
        uiScene.events.on(CASH_OUT_REQUESTED_EVENT, this.handleCashOutRequested, this);

        // === Load the game ===
        this.loadGame();
    }

    handleStartGameRequested() {
        if (this.status === PiggyState.NO_GAME_IDLE) {
            this.updateVisualBalance((this.getCurrentBalance() || 0n) - BigInt(this.getCurrentStake()));
            this.moveTo(0);
            this.backendService?.handleStartGame();
        }
    }

    handleAdvanceRequested() {
        if (this.status === PiggyState.GAME_ONGOING_IDLE) {
            this.moveTo(this.currentSpot + 1);
            this.backendService?.handleAdvance();
        }
    }

    handleCashOutRequested() {
        if (this.status === PiggyState.ADVANCE_STAGE_2 && this.queuedAction == undefined) {
            this.queuedAction = ActionType.CASH_OUT;
        }
        else if (this.status === PiggyState.GAME_ONGOING_IDLE) {
            this.updateVisualBalance((this.getCurrentBalance() || 0n) + this.getPayoutForPosition(this.currentSpot));
            this.setStatus(PiggyState.CASHING_OUT);
            this.pig?.stop();
            this.pig?.play('big-jump').once('animationcomplete', () => {
                this?.pig?.play('blink');
            });
            this.backendService?.handleCashOut();
        }
        else {
            console.log("Cannot cash out now", this.status);
        }
    }


    handlePlatformClicked(targetIndex: number) {
        console.log("Platform clicked", targetIndex);
        if (!this.pig || !this.safespotColumns) return;

        // Abort if moving to an empty spot that is not the first one.
        if (this.currentSpot === EMPTY_POSITION && targetIndex !== 0) {
            console.log("Cannot move to an empty spot that is not the first one");
            return;
        }

        // Abort if trying to move to a spot that is not the next one.
        if (this.currentSpot !== EMPTY_POSITION && this.currentSpot + 1 !== targetIndex) {
            console.log("Cannot move to a spot that is not the next one");
            return;
        }

        // Can queue it
        if (this.status == PiggyState.ADVANCE_STAGE_2 && targetIndex > this.currentSpot && this.queuedAction == undefined) {
            this.queuedAction = ActionType.ADVANCE;
            return;
        }

        if (this.status != PiggyState.NO_GAME_IDLE && this.status != PiggyState.GAME_ONGOING_IDLE) {
            console.log("Game is not in the right state to advance", this.status);
            return;
        }

        console.log(`Advancing to spot ${targetIndex}`);

        if (targetIndex === 0) {
            this.updateVisualBalance((this.getCurrentBalance() || 0n) - BigInt(this.getCurrentStake()));
        }

        this.moveTo(targetIndex);

        if (targetIndex === 0) {
            this.backendService?.handleStartGame();
        }
        else {
            this.backendService?.handleAdvance();
        }
    }

    updateVisualBalance(newBalance: bigint) {
        this.events.emit(BALANCE_UPDATED_EVENT, newBalance);
    }

    getCurrentBalance(): bigint | undefined {
        return BigInt(this.registry.get(BALANCE_DATA));
    }

    getCurrentStake(): number {
        return this.registry.get(STAKE_DATA);
    }

    getPayoutForPosition(position: number): bigint {
        const gameData: GameModel | undefined = this.registry.get(GAME_DATA);
        if (!gameData) {
            console.error("Game data not found in the registry");
            return 0n;
        }
        return BigInt(Math.round(this.getCurrentStake() * (gameData.steps_payout_bps[position] / 10000)));
    }

    moveTo(targetIndex: number) {
        if (!this.pig || !this.safespotColumns) return;
        const platform = this.getPlatformForIndex(targetIndex);
        if (!platform) {
            console.error(`Platform not found at index ${targetIndex}`);
            return;
        }

        // Get the absolute position of the platform
        const destX = platform.x;
        const destY = platform.y;

        // Calculate the midpoint
        const startX = this.pig.x;
        const startY = this.pig.y;
        const midpointX = startX + (destX - startX) / 2;
        const midpointY = startY + (destY - startY) / 2;

        // Update the status
        this.setStatus(PiggyState.ADVANCE_STAGE_1);

        // First tween: Move from current position to the midpoint.
        this.walkTwig = this.tweens.add({
            targets: this.pig,
            x: midpointX,
            y: midpointY,
            duration: 2500,
            onStart: () => {

                this.pig?.anims.play('walk');
            },
        });
    }

    loadGame() {
        var status = PiggyState.NO_GAME_IDLE;
        this.currentSpot = EMPTY_POSITION;
        this.dialog?.hide();

        const contextData: PiggyBankContextModel | undefined = this.registry.get(CONTEXT_DATA);
        if (contextData && contextData.status === GAME_ONGOING_STATUS) {
            console.log("Game resumed", contextData);
            this.currentSpot = contextData.current_position;
            status = PiggyState.GAME_ONGOING_IDLE;
        }
        this.setStatus(status);

        // this.gameUI?.reload(this.status);

        // === Reset state ===
        if (this.walkTwig) {
            this.walkTwig.stop();
            this.walkTwig = undefined;
        }
        this.queuedAction = undefined;

        // === Reset piggy ===
        const pigX = this.currentSpot === EMPTY_POSITION ? this.leftEnd?.x : this.getPlatformForIndex(this.currentSpot)?.x || 0;
        this.pig?.setX(pigX);
        this.pig?.setAlpha(1);
        this.pig?.stop();
        this.pig?.anims.play('blink');
        this.pig?.setTexture("piggy-animations", "1-0.png");

        // === Reset platforms ===
        if (this.safespotColumns) {
            for (let i = 0; i < this.safespotColumns.length; i++) {
                const platform = this.getPlatformForIndex(i);
                if (platform) {
                    platform.clearTint();
                }
                const multiplierText = this.getMultiplierTextForIndex(i);
                if (multiplierText) {
                    multiplierText.setY(Y_POS);
                }
                if (this.currentSpot != EMPTY_POSITION && i <= this.currentSpot) {
                    platform?.setTint(PLATFORM_PASSED_TINT);
                    multiplierText?.setY(Y_POS + 150);
                }
            }
        }
    }

    handleInteractedEvent(interact: InteractedWithGameModel) {
        // === Update the registry ===
        this.registry.set(CONTEXT_DATA, interact.context);
        this.registry.set(BALANCE_DATA, interact.new_balance);
        // === Emit events ===
        this.events.emit(BALANCE_UPDATED_EVENT, interact.new_balance);

        if (!this.safespotColumns) return;
        console.log("Interacted event", interact);

        switch (this.status) {
            case PiggyState.ADVANCE_STAGE_1:
                // Game is started and piggy successfully advanced to the first spot.
                if ((interact.context.status === GAME_ONGOING_STATUS) ||
                    (interact.context.status === GAME_FINISHED_STATUS && interact.context.win > 0)) {
                    this.walkTwig?.stop();
                    this.setStatus(PiggyState.ADVANCE_STAGE_2);
                    // Advance
                    this.currentSpot = interact.context.current_position;

                    const platform = this.getPlatformForIndex(this.currentSpot);
                    if (!platform) {
                        console.error(`Platform not found at index ${this.currentSpot}`);
                        return;
                    }

                    // Small jump if the piggy is not at the last spot
                    // otherwise the big jump
                    this.pig?.anims.stop();
                    if (this.currentSpot < this.safespotColumns.length - 1) {
                        this.pig?.play('victory').once('animationcomplete', () => {
                            this.pig?.setTexture("piggy-animations", "1-0.png");
                            this.pig?.anims.play('blink');
                        });
                    }
                    else {
                        this.pig?.play('big-jump').once('animationcomplete', () => {
                            this.loadGame();
                        });
                    }

                    // Get the absolute position of the platform
                    const destX = platform.x;
                    const destY = platform.y;
                    // Second tween: Move from the current (midpoint) position to the final destination.
                    this.tweens.add({
                        targets: this.pig,
                        x: destX,
                        y: destY,
                        duration: 200,
                        ease: 'linear',
                        onStart: () => {
                            // Tween to slide the multiplier text down.
                            // Find the text object within the container.
                            const multiplierText = this.getMultiplierTextForIndex(this.currentSpot);
                            if (multiplierText) {
                                this.tweens.add({
                                    targets: multiplierText,
                                    y: multiplierText.y + 150, // adjust the offset as needed
                                    duration: 300,
                                    ease: 'Cubic.easeOut'
                                });
                            }
                        },
                        onComplete: () => {
                            // Instead of abruptly removing the knife, let it fall off-screen.
                            this.setStatus(PiggyState.GAME_ONGOING_IDLE);
                            let startColor = Phaser.Display.Color.ValueToColor(0xffffff);
                            let endColor = Phaser.Display.Color.ValueToColor(0x555555);
                            let colorObj = { t: 0 };
                            this.tweens.add({
                                targets: colorObj,
                                t: 100,
                                duration: 300,
                                onUpdate: () => {
                                    let interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(
                                        startColor,
                                        endColor,
                                        100,
                                        colorObj.t
                                    );
                                    let newTint = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
                                    platform.setTint(newTint);
                                },
                            });
                            if (interact.context.status === GAME_FINISHED_STATUS) {
                                // End the game
                                this.setStatus(PiggyState.WINNING);
                            }
                            else {
                                // Keep going
                                this.maybeProcessQueuedAction();
                            }
                        }

                    });
                }
                // Game is started and the piggy failed to advance to the first spot.
                else if (interact.context.status === GAME_FINISHED_STATUS && interact.context.win === 0n) {
                    console.log("Game over");
                    // Process the loss
                    this.setStatus(PiggyState.DYING);
                    this.walkTwig?.stop();  // Increase the time scale factor to speed it up.
                    this.pig?.anims.play('death').once('animationcomplete', () => {
                        this.loadGame();
                    });

                }
                break;
            case PiggyState.CASHING_OUT:
                this.loadGame();
                break;
            default:
                // Unexpected state
                console.error("Unexpected state", this.status);
                this.loadGame();
                break;
        }

    }

    maybeProcessQueuedAction() {
        const queuedAction = this.queuedAction;
        this.queuedAction = undefined;
        if (queuedAction === ActionType.ADVANCE) {
            this.handleAdvanceRequested();
        }
        else if (queuedAction === ActionType.CASH_OUT) {
            this.handleCashOutRequested();
        }

    }

    handleError(errorMsg: string) {
        this.dialog?.show("Error", errorMsg, "Reload", () => {
            this.loadGame();
        });
    }

    getPlatformForIndex(index: number): Phaser.GameObjects.Image | undefined {
        if (!this.safespotColumns) return;
        const columnContainer = this.safespotColumns[index];
        const platform = columnContainer.list.find((child) => child.name === "Point") as Phaser.GameObjects.Image;
        return platform;
    }

    getMultiplierTextForIndex(index: number): Phaser.GameObjects.Text | undefined {
        if (!this.safespotColumns) return;
        const columnContainer = this.safespotColumns[index];
        const multiplierText = columnContainer.list.find((child) => child instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text;
        return multiplierText;
    }

    private setStatus(status: PiggyState) {
        this.status = status;
        this.events.emit(STATUS_UPDATED_EVENT, status);
    }

}