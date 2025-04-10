import { Dialog } from "../components/dialog";
import { GameUIContainer } from "../components/game-ui-container";
import { HeaderContainer } from "../components/header-container";
import { ERROR_EVENT, RELOAD_REQUESTED_EVENT } from "../constants";
import { parseError, getPiggyBankErrorMessage } from "../utils/error-messages";
import { isPortrait } from "../utils/resize";

export class GameUIScene extends Phaser.Scene {
    private gameUIContainer!: GameUIContainer;
    headerContainer: HeaderContainer | undefined;
    dialog: Dialog | undefined;
    centerX: number = 0;
    centerY: number = 0;

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

        const width = this.scale.width / window.devicePixelRatio;
        const height = this.scale.height / window.devicePixelRatio;

        this.centerX = width / 2;
        this.centerY = height / 2;

        console.log("dialog width", this.scale.width / window.devicePixelRatio * 0.8);

        let dialogWidth = 0
        let dialogHeight = 0;

        if (isPortrait(width, height)) {
            dialogWidth = 300;
            dialogHeight = 400;
        }
        else {
            dialogWidth = 600;
            dialogHeight = 400;
        }

        console.log("dialog dimensions", dialogWidth, dialogHeight);

        this.dialog?.setPosition(this.centerX, this.centerY);
        this.dialog?.resize(dialogWidth, dialogHeight);
    }
    create(): void {

        this.scale.on('resize', this.resizeCamera, this);

        // Instantiate and add the GameUIContainer to this scene.
        this.gameUIContainer = new GameUIContainer(this, 0, 0);
        this.add.existing(this.gameUIContainer);


        this.headerContainer = new HeaderContainer(this, 0, 0);
        this.add.existing(this.headerContainer);
        // this.balanceBarContainer.setScale(window.devicePixelRatio);

        // === Error Dialog ===
        // Create the dialog component centered on the screen
        this.dialog = new Dialog(this, 0, 0);
        this.add.existing(this.dialog);

        this.resizeCamera();

        // Listen to events
        const gameScene = this.scene.get("Main");
        gameScene.events.on(ERROR_EVENT, this.handleError, this);

    }

    handleError(errorMsg: string) {
        const parsed = parseError(errorMsg);
        const msg = getPiggyBankErrorMessage(parsed[0], parsed[1]);
        this.dialog?.show("Error", msg, "Reload", () => {
            this.events.emit(RELOAD_REQUESTED_EVENT);
            this.dialog?.hide();
        });
    }
}
