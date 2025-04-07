import { BalanceBarContainer } from "../components/balance-bar-container";
import { GameUIContainer } from "../components/game-ui-container";

export class GameUIScene extends Phaser.Scene {
    private gameUIContainer!: GameUIContainer;
    private balanceBarContainer!: BalanceBarContainer;

    constructor() {
        super({ key: "GameUIScene" });
    }

    create(): void {
        // Instantiate and add the GameUIContainer to this scene.
        this.gameUIContainer = new GameUIContainer(this, 0, 0);
        this.add.existing(this.gameUIContainer);

        this.balanceBarContainer = new BalanceBarContainer(this, 0, 0);
        this.add.existing(this.balanceBarContainer);
    }
}
