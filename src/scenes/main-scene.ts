// import { GameModel } from "@/api/models/openplay-coin-flip";
import { Scene } from "phaser";
import BackendService from "../components/backend-service";
import { Dialog } from "../components/dialog";
import { WORLD_WIDTH, WORLD_HEIGHT } from "../constants";
import { GAME_ONGOING_STATUS, GAME_FINISHED_STATUS, EMPTY_POSITION } from "../sui/constants/piggybank-constants";
import { formatSuiAmount } from "../utils/helpers";
import { GameModel, InteractedWithGameModel, PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
import { BalanceManagerModel } from "../sui/models/openplay-core";

const START_POS_X = 100;
const START_POS_Y = 500;

export class Main extends Scene {

    safespots: { x: number; y: number; text: string; }[];
    safespotObjects: Phaser.GameObjects.Rectangle[] | undefined;
    currentSpot: number;
    dialog: Dialog | undefined;
    pig: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    balanceText: Phaser.GameObjects.Text | undefined;
    backendService: BackendService | undefined;
    walkTwig: Phaser.Tweens.Tween | undefined;
    isWalking: boolean = false;

    constructor() {
        super('Main');
        this.currentSpot = EMPTY_POSITION;
        this.safespots = [];
    }

    init() {
        // Safe to access the registry here:
        const gameData: GameModel | undefined = this.registry.get('gameData');
        this.safespots = gameData?.steps_payout_bps.map((bps, index) => {
            return { x: 400 + 400 * index, y: START_POS_Y, text: (bps / 10000).toFixed(2) + "x" };
        }) ?? [];

        // Load the context
        const contextData: PiggyBankContextModel | undefined = this.registry.get('contextData');
        if (contextData && contextData.status === GAME_ONGOING_STATUS) {
            console.log("Context data loaded", contextData);
            this.currentSpot = contextData.current_position;
        }

        // Initialize the backend service, passing this scene to allow event communication
        this.backendService = new BackendService(this);
    }

    create() {

        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        // this.pig = this.physics.add.image(START_POS_X, START_POS_Y, "pig");
        const startPigX = this.currentSpot === EMPTY_POSITION ? START_POS_X : this.safespots[this.currentSpot].x;
        const startPigY = this.currentSpot === EMPTY_POSITION ? START_POS_Y : this.safespots[this.currentSpot].y;
        this.pig = this.physics.add.sprite(startPigX, startPigY, "piggy");
        this.pig.setDepth(10);
        this.pig.setScale(0.4);

        // Animate the piggy
        const frameNames1 = this.anims.generateFrameNames('piggy', {
            start: 1, end: 8, zeroPad: 0,
            prefix: 'Animation 1-', suffix: '.png'
        });
        this.anims.create({ key: 'blink', frames: frameNames1, frameRate: 8, repeat: -1, repeatDelay: 2000, delay: 2000 });
        this.pig.anims.play('blink');

        const frameNames2 = this.anims.generateFrameNames('piggy', {
            start: 1, end: 8, zeroPad: 0,
            prefix: 'Animation 2-', suffix: '.png'
        });
        this.anims.create({ key: 'walk', frames: frameNames2, frameRate: 16, repeat: -1 });

        // Safespot visuals
        this.safespotObjects = this.safespots.map(spot => {
            // Create the rectangle
            const rect = this.add.rectangle(spot.x, spot.y, 200, 200, 0x000000);
            // Create a text object at the same coordinates
            const text = this.add.text(spot.x, spot.y, spot.text, {
                fontSize: '30px',
                color: '#ffffff'
            });
            // Set the text origin to center it on (spot.x, spot.y)
            text.setOrigin(0.5);
            return rect;
        });

        // Safespot logic
        this.safespotObjects.forEach((spotObject, index) => {
            spotObject.setInteractive();
            spotObject.on('pointerdown', () => this.processAdvance(index));
        });

        // Create the dialog component centered on the screen
        this.dialog = new Dialog(this, this.cameras.main.centerX, this.cameras.main.centerY, 400, 300);

        // // Example usage: Show dialog when needed
        // this.dialog.show("Piggy Bank", "Welcome to Piggy Bank! Click on the next safespot to start playing.");

        // Follow pig with the camera
        this.cameras.main.startFollow(this.pig, true);

        // Add the balance to the scene
        this.balanceText = this.add.text(10, 10, ``, {
            fontSize: '30px',
            color: '#ffffff'
        });
        this.updateBalance();

        // Listen to context updates
        this.events.on('interacted-event', this.handleInteractedEvent, this);
    }

    processAdvance(targetIndex: number) {
        if (!this.pig) return;

        // Abort if moving to an empty spot that is not the first one.
        if (this.currentSpot === EMPTY_POSITION && targetIndex !== 0) {
            return;
        }

        // Abort if trying to move to a spot that is not the next one.
        if (this.currentSpot !== EMPTY_POSITION && this.currentSpot + 1 !== targetIndex) {
            return;
        }

        console.log(`Advancing to spot ${targetIndex}`);

        if (targetIndex === 0) {
            this.events.emit('start-game-event');
        }
        else {
            this.events.emit('advance-event');
        }

        // Calculate start and destination positions.
        const startX = this.pig.x;
        const startY = this.pig.y;
        const destX = this.safespots[targetIndex].x;
        const destY = this.safespots[targetIndex].y;

        // Calculate midpoint from current spot to the destination.
        const midpointX = startX + (destX - startX) / 2;
        const midpointY = startY + (destY - startY) / 2;

        // First tween: Move from current position to the midpoint.
        this.walkTwig = this.tweens.add({
            targets: this.pig,
            x: midpointX,
            y: midpointY,
            duration: 2500,
            onStart: () => {
                // Simulate an artificial delay from the server (e.g., 1000ms).
                this.pig?.anims.play('walk');
            },
        });
        this.isWalking = true;
    }

    checkIfHit(targetIndex: number) {
        // Random chance the pig dies
        const hitChance = 0.0; // 30% chance to die
        if (Phaser.Math.RND.frac() < hitChance) {
            this.tweens.add({
                targets: this.pig,
                alpha: 0,
                duration: 500,
                ease: Phaser.Math.Easing.Cubic.Out,
                onComplete: () => {
                    this.resetGame();
                }
            });
        } else {
            // Advance
            this.currentSpot = targetIndex;

            if (this.currentSpot === this.safespots.length - 1) {
                // Win
                this.resetGame();
            }
            else {
                const destX = this.safespots[targetIndex].x;
                const destY = this.safespots[targetIndex].y;
                // Second tween: Move from the current (midpoint) position to the final destination.
                this.tweens.add({
                    targets: this.pig,
                    x: destX,
                    y: destY,
                    duration: 500,
                    ease: Phaser.Math.Easing.Cubic.Out,
                });
            }
        }
    }

    resetGame() {
        if (this.walkTwig){
            this.walkTwig.stop();
            this.walkTwig = undefined;
        }
        this.pig?.setX(START_POS_X);
        this.pig?.setY(START_POS_Y);
        this.pig?.setAlpha(1);
        this.currentSpot = EMPTY_POSITION;
        this.pig?.stop();
        this.pig?.setFrame(0);
    }

    updateBalance() {
        const balanceManagerData: BalanceManagerModel | undefined = this.registry.get('balanceManagerData');
        this.balanceText?.setText(`Balance: ${formatSuiAmount(balanceManagerData?.balance ?? 0)}`);
    }

    handleInteractedEvent(interact: InteractedWithGameModel) {

        console.log("Interacted event", interact);

        // Case where the piggy was advancing
        if (this.isWalking) {
        
            if (interact.context.status == GAME_ONGOING_STATUS) {
                console.log("Game ongoing - moving to next position");
                this.walkTwig?.stop();
                // Advance
                this.currentSpot = interact.context.current_position;
                const destX = this.safespots[this.currentSpot].x;
                const destY = this.safespots[this.currentSpot].y;
                // Second tween: Move from the current (midpoint) position to the final destination.
                this.tweens.add({
                    targets: this.pig,
                    x: destX,
                    y: destY,
                    duration: 300,
                    ease: Phaser.Math.Easing.Cubic.Out,
                    onComplete: () => {
                        this.pig?.anims.stop();
                        this.pig?.setFrame(0);
                    }
                });
            }
            else if (interact.context.status == GAME_FINISHED_STATUS) {
                this.walkTwig?.stop();
                console.log("Game finished - resetting");
                // Died or Won
                this.resetGame();
            }

            this.isWalking = false;
        }
    }

}