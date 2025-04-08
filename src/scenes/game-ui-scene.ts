import { BalanceBarContainer } from "../components/balance-bar-container";
import { GameUIContainer } from "../components/game-ui-container";
// import { HEIGHT, WIDTH } from "../constants";

export class GameUIScene extends Phaser.Scene {
    private gameUIContainer!: GameUIContainer;
    private balanceBarContainer!: BalanceBarContainer;

    constructor() {
        super({ key: "GameUIScene" });
    }

    resizeCamera() {
        const width = this.scale.width;
        const height = this.scale.height;

        console.log("width", width);
        console.log("height", height);


        // This logic can actually be re-used
        // We need to normalize the height of the screen to the expected height in pixels
        // and then we can work with hardcoded pixel value sizes
        // let zoomFactorY = height / HEIGHT;
        // let zoomFactorX = width / WIDTH;

        console.log("devicePixelRatio", window.devicePixelRatio);

        // Apply the zoom factor so that WORLD_HEIGHT fits into the viewport height
        // this.cameras.main.setZoom(window.devicePixelRatio);
        // this.cameras.main.setPosition(0, 0);
        // this.cameras.main.setZoom(1.05);
    }
    create(): void {
        this.resizeCamera();

        this.scale.on('resize', this.resizeCamera, this);

        // Instantiate and add the GameUIContainer to this scene.
        this.gameUIContainer = new GameUIContainer(this, 0, 0);
        this.add.existing(this.gameUIContainer);
        // this.gameUIContainer.setScale(window.devicePixelRatio);

        // this.cameras.main.centerOn(this.gameUIContainer.x, this.gameUIContainer.y);
        // this.cameras.main.centerOn(0, 0);
        const zoomLEvel = window.devicePixelRatio;
        this.cameras.main.setZoom(zoomLEvel);
        this.cameras.main.centerOn(
            this.cameras.main.width / (2 * zoomLEvel),
            this.cameras.main.height / (2 * zoomLEvel)
        );
        // Set zoom to 2x

        // Align the camera to top-left of the world (important!)

        // Optionally set camera bounds to match the world
        // cam.setBounds(0, 0, WIDTH, HEIGHT);

        // add a red rectangle to the scene
        // const rect = this.add.rectangle(0, 0, 430, 932/2, 0xff0000);
        // rect.setOrigin(0, 0);
        // rect.setInteractive();
        // rect.setDepth(10);
        // rect.setScale(window.devicePixelRatio);
        // console.log("rect size", rect.width, rect.height);

        // 1. Scene upscalen zodat de devicePixelRatio geen verschil meer maakt
        // 2. De knoppen en text een vaste grootte geven in pixels: door de scale gaat het ook op gsm er goed uit zien
        // 3. Afhankelijk van de beschikbare hoogte en breedte (Gedeeld door de devicePixelRatio) de witruimtes aanpassen


        this.balanceBarContainer = new BalanceBarContainer(this, 0, 0);
        this.add.existing(this.balanceBarContainer);
        // this.balanceBarContainer.setScale(window.devicePixelRatio);
    }
}
