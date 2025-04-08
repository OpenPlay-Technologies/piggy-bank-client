import { BalanceBarContainer } from "../components/balance-bar-container";
import { GameUIContainer } from "../components/game-ui-container";

export class GameUIScene extends Phaser.Scene {
    private gameUIContainer!: GameUIContainer;
    private balanceBarContainer!: BalanceBarContainer;

    constructor() {
        super({ key: "GameUIScene" });
    }

    resizeCamera() {
        console.log("devicePixelRatio", window.devicePixelRatio);

        const zoomLEvel = window.devicePixelRatio;
        this.cameras.main.setZoom(zoomLEvel);
        this.cameras.main.centerOn(
            this.cameras.main.width / (2 * zoomLEvel),
            this.cameras.main.height / (2 * zoomLEvel)
        );
    }
    create(): void {
        this.resizeCamera();

        this.scale.on('resize', this.resizeCamera, this);

        // Instantiate and add the GameUIContainer to this scene.
        this.gameUIContainer = new GameUIContainer(this, 0, 0);
        this.add.existing(this.gameUIContainer);

        // 1. Scene upscalen zodat de devicePixelRatio geen verschil meer maakt
        // 2. De knoppen en text een vaste grootte geven in pixels: door de scale gaat het ook op gsm er goed uit zien
        // 3. Afhankelijk van de beschikbare hoogte en breedte (Gedeeld door de devicePixelRatio) de witruimtes aanpassen


        this.balanceBarContainer = new BalanceBarContainer(this, 0, 0);
        this.add.existing(this.balanceBarContainer);
        // this.balanceBarContainer.setScale(window.devicePixelRatio);
    }
}
