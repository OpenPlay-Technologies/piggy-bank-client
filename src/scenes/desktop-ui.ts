// import { PiggyState } from "../components/enums";
// import {
//     ADVANCE_REQUESTED_EVENT,
//     BALANCE_DATA,
//     BALANCE_UPDATED_EVENT,
//     CASH_OUT_REQUESTED_EVENT,
//     CONTEXT_DATA,
//     STAKE_CHANGED_EVENT,
//     STAKE_DATA,
//     START_GAME_REQUESTED_EVENT,
//     STATUS_UPDATED_EVENT
// } from "../constants";
// import { PiggyBankContextModel } from "../sui/models/openplay-piggy-bank";
// import { formatSuiAmount } from "../utils/helpers";
// import { isPortrait } from "../utils/resize";

// export class DesktopUIScene extends Phaser.Scene {
//     // State variables
//     private stakeIndex: number = 0;
//     private allowdStakes: number[] = [1e7, 2e7, 3e7, 5e7, 10e7];
//     private isGameOngoing: boolean = false;

//     // UI elements
//     private stakeText: Phaser.GameObjects.Text | undefined;
//     private balanceText: Phaser.GameObjects.Text | undefined;
//     private plusButton: Phaser.GameObjects.Text | undefined;
//     private minusButton: Phaser.GameObjects.Text | undefined;
//     private startGameButton?: Phaser.GameObjects.Text;
//     private advanceButton?: Phaser.GameObjects.Text;
//     private cashOutButton?: Phaser.GameObjects.Text;

//     // Dimensions for our UI background.
//     private readonly bgWidth: number = 400;
//     private readonly bgHeight: number = 200;

//     constructor() {
//         super({ key: 'DesktopUIScene' });
//     }

//     resizeCamera() {
//         const screenWidth = window.innerWidth;
//         const screenHeight = window.innerHeight;

//         // For non-portrait (landscape/desktop), position the UI using its defined dimensions.
//         const viewportX = (screenWidth - this.bgWidth) / 2;
//         const viewportY = screenHeight - this.bgHeight;
//         this.cameras.main?.setViewport(viewportX, viewportY, this.bgWidth, this.bgHeight);
//     }

//     create(): void {
//         // Initialize the viewport and zoom
//         this.resizeCamera();

//         // Listen for resize events
//         this.scale.on('resize', this.resizeCamera, this);
//         // Determine a base position for the UI.
//         // For example, center it horizontally and anchor it at the bottom.
//         const centerX = this.cameras.main.width / 2;
//         const bottomY = this.cameras.main.height - 10; // 10 pixels from bottom edge

//         // Create the background texture if it doesn't exist.
//         if (!this.textures.exists("ui-bg")) {
//             const bgGraphics = this.add.graphics();
//             bgGraphics.fillStyle(0x99999, 1);
//             bgGraphics.fillRect(0, 0, this.bgWidth, this.bgHeight);
//             bgGraphics.generateTexture("ui-bg", this.bgWidth, this.bgHeight);
//             bgGraphics.destroy();
//         }
//         // Create the background image centered at (centerX, bottomY)
//         // Setting the origin to (0.5, 1) will align its bottom edge with bottomY.
//         this.add.image(centerX, bottomY, "ui-bg").setOrigin(0.5, 1);

//         // Create balance text and stake text relative to the background.
//         // They are positioned relative to the background’s top left.
//         this.balanceText = this.add.text(centerX - this.bgWidth / 2 + 20, bottomY - this.bgHeight + 20, '', {
//             fontSize: "24px",
//             color: "#fff"
//         }).setScrollFactor(0);
//         this.stakeText = this.add.text(centerX - this.bgWidth / 2 + 20, bottomY - this.bgHeight + 60, '', {
//             fontSize: "24px",
//             color: "#fff"
//         }).setScrollFactor(0);

//         // Create plus and minus buttons for stake adjustment.
//         this.plusButton = this.add.text(centerX + this.bgWidth / 2 - 50, bottomY - this.bgHeight + 60, "+", {
//             fontSize: "32px",
//             color: "#0f0",
//             backgroundColor: "#000"
//         }).setInteractive().setScrollFactor(0);
//         this.plusButton.on("pointerdown", () => this.changeStake(true));

//         this.minusButton = this.add.text(centerX + this.bgWidth / 2 - 100, bottomY - this.bgHeight + 60, "-", {
//             fontSize: "32px",
//             color: "#f00",
//             backgroundColor: "#000"
//         }).setInteractive().setScrollFactor(0);
//         this.minusButton.on("pointerdown", () => this.changeStake(false));

//         // Initial setup.
//         this.handleStakeChange();
//         this.handleBalanceChange();
//         // Assume an initial status is stored in the registry.
//         const initialStatus = this.registry.get('status') || "";
//         this.handleStatusUpdate(initialStatus);

//         // Listen for events.
//         this.events.on(STAKE_CHANGED_EVENT, this.handleStakeChange, this);
//         this.events.on(STATUS_UPDATED_EVENT, this.handleStatusUpdate, this);
//         this.events.on(BALANCE_UPDATED_EVENT, this.handleBalanceChange, this);
//     }

//     public reload(status: string): void {
//         this.handleStakeChange();
//         this.handleBalanceChange();
//         this.handleStatusUpdate(status);
//     }

//     private handleStakeChange(): void {
//         const currentStake = this.getCurrentStake();
//         this.registry.set(STAKE_DATA, currentStake);
//         this.stakeText?.setText(`Stake: ${formatSuiAmount(currentStake)}`);
//         if (this.stakeIndex === 0) {
//             this.minusButton?.setAlpha(0.5).disableInteractive();
//         } else if (this.stakeIndex === this.allowdStakes.length - 1) {
//             this.plusButton?.setAlpha(0.5).disableInteractive();
//         } else {
//             this.minusButton?.setAlpha(1).setInteractive();
//             this.plusButton?.setAlpha(1).setInteractive();
//         }
//     }

//     private handleStatusUpdate(status: string): void {
//         switch (status) {
//             case PiggyState.ADVANCE_STAGE_1:
//             case PiggyState.ADVANCE_STAGE_2:
//             case PiggyState.CASHING_OUT:
//             case PiggyState.DYING:
//             case PiggyState.WINNING:
//             case PiggyState.GAME_ONGOING_IDLE:
//                 this.isGameOngoing = true;
//                 break;
//             case PiggyState.NO_GAME_IDLE:
//                 this.isGameOngoing = false;
//                 break;
//             default:
//                 break;
//         }
//         this.updateActionButtons();
//     }

//     private handleBalanceChange(): void {
//         const currentBalance: bigint = this.registry.get(BALANCE_DATA);
//         this.balanceText?.setText(`Balance: ${formatSuiAmount(currentBalance)}`);
//     }

//     public setVisualBalance(balance: bigint): void {
//         this.balanceText?.setText(`Balance: ${formatSuiAmount(balance)}`);
//     }

//     private changeStake(up: boolean): void {
//         this.stakeIndex = up
//             ? Math.min(this.stakeIndex + 1, this.allowdStakes.length - 1)
//             : Math.max(this.stakeIndex - 1, 0);
//         this.registry.set(STAKE_DATA, this.getCurrentStake());
//         this.events.emit(STAKE_CHANGED_EVENT);
//     }

//     private getCurrentStake(): number {
//         return this.allowdStakes[this.stakeIndex];
//     }

//     private updateActionButtons(): void {
//         // Remove existing action buttons if they exist.
//         if (this.startGameButton) {
//             this.startGameButton.destroy();
//             this.startGameButton = undefined;
//         }
//         if (this.advanceButton) {
//             this.advanceButton.destroy();
//             this.advanceButton = undefined;
//         }
//         if (this.cashOutButton) {
//             this.cashOutButton.destroy();
//             this.cashOutButton = undefined;
//         }

//         // Calculate a base Y position for the action buttons.
//         // For instance, position them above the UI background.
//         const baseY = this.cameras.main.height - this.bgHeight / 2 - 50;
//         const centerX = this.cameras.main.width / 2;

//         if (this.isGameOngoing) {
//             this.advanceButton = this.add.text(centerX - 70, baseY, "Advance", {
//                 fontSize: "24px",
//                 color: "#fff",
//                 backgroundColor: "#000"
//             }).setInteractive().setScrollFactor(0).setOrigin(0.5, 0.5);
//             this.advanceButton.on("pointerdown", () => this.handleAdvance());

//             this.cashOutButton = this.add.text(centerX + 70, baseY, "Cash Out", {
//                 fontSize: "24px",
//                 color: "#fff",
//                 backgroundColor: "#000"
//             }).setInteractive().setScrollFactor(0).setOrigin(0.5, 0.5);
//             this.cashOutButton.on("pointerdown", () => this.handleCashOut());
//         } else {
//             this.startGameButton = this.add.text(centerX, baseY, "Start Game", {
//                 fontSize: "24px",
//                 color: "#fff",
//                 backgroundColor: "#000"
//             }).setInteractive().setScrollFactor(0).setOrigin(0.5, 0.5);
//             this.startGameButton.on("pointerdown", () => this.handleStartGame());
//         }
//     }

//     private handleStartGame(): void {
//         this.events.emit(START_GAME_REQUESTED_EVENT);
//         console.log("Start game requested");
//     }

//     private handleAdvance(): void {
//         const contextData: PiggyBankContextModel | undefined = this.registry.get(CONTEXT_DATA);
//         if (!contextData) {
//             return;
//         }
//         this.events.emit(ADVANCE_REQUESTED_EVENT);
//         console.log("Advance requested");
//     }

//     private handleCashOut(): void {
//         this.events.emit(CASH_OUT_REQUESTED_EVENT);
//         console.log("Cash out requested");
//     }
// }
