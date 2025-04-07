import { BALANCE_BAR_HEIGHT_PX, BALANCE_DATA, BALANCE_UPDATED_EVENT } from "../constants";
import { lightenColor } from "../utils/colors";
import { formatSuiAmount, mistToSUI } from "../utils/helpers";

interface BalanceBarConfig {
    mainColor?: number;
}


export class BalanceBarContainer extends Phaser.GameObjects.Container {

    background: Phaser.GameObjects.Image;
    padding: number = 10; // Padding for button spacing
    title: Phaser.GameObjects.Image;
    balanceLabel: Phaser.GameObjects.Text;
    mainColor: any;
    balanceText: Phaser.GameObjects.Text;
    currencyText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, config: BalanceBarConfig = {}) {
        super(scene, x, y);

        this.mainColor = config.mainColor ?? 0x8e8bc4;

    
        // Create background texture if it doesn't exist
        if (!this.scene.textures.exists("ui-mobile-bg")) {
            const bgGraphics = this.scene.add.graphics();
            bgGraphics.fillStyle(0x222222, 1);
            // bgGraphics.fillStyle(0xfcba03, 1);
            bgGraphics.fillRect(0, 0, 800, 600);
            bgGraphics.generateTexture("ui-mobile-bg", 800, 600);
            bgGraphics.destroy();
        }
        this.background = this.scene.add.image(0, 0, "ui-mobile-bg").setOrigin(0, 0);
        // Add background to the container
        this.add(this.background);

        // Add Piggy Bank title
        this.title = this.scene.add.image(0, 0, "title").setOrigin(0, 0).setDepth(1);

        // Balance label
        this.balanceLabel = scene.add.text(0, 0, 'BALANCE', {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + this.mainColor.toString(16),
        });
        this.balanceLabel.setOrigin(1, 0.5);
        this.add(this.balanceLabel);

        // Actual balance
        this.balanceText = scene.add.text(0, 0, '', {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + lightenColor(this.mainColor, 0.8).toString(16),
        });
        this.balanceText.setOrigin(1, 0.5);
        this.add(this.balanceText);
        const currentBalance = this.scene.registry.get(BALANCE_DATA) || 0n;
        this.handleBalanceChange(currentBalance);

        // Currency
        this.currencyText = scene.add.text(0, 0, 'SUI', {
            fontSize: "24px",
            fontFamily: "Arial Black",
            color: "#" + this.mainColor.toString(16),
        });
        this.currencyText.setOrigin(1, 0.5);
        this.add(this.currencyText);

        // Perform initial sizing
        this.resize();

        // Listen for resize events on the parent scene
        this.scene.scale.on('resize', this.resize, this);

        const gameScene = this.scene.scene.get("Main");
        gameScene.events.on(BALANCE_UPDATED_EVENT, this.handleBalanceChange, this);
    }

    resize() {
        // Get the current width and height from the Scale Manager
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        this.width = width;
        this.height = height;

        const centerY = BALANCE_BAR_HEIGHT_PX/2;

        if (this.background) {
            this.background.setDisplaySize(this.width, BALANCE_BAR_HEIGHT_PX);
            this.background.setPosition(0, 0);
        }

        if (this.title) {
            const scale = (-2 * this.padding + BALANCE_BAR_HEIGHT_PX) / this.title.height;
            this.title.setToTop();
            this.title.setScale(scale);
            this.title.setPosition(this.padding, this.padding);
        }

        if (this.currencyText) {
            this.currencyText.setPosition(this.width - this.padding, centerY);
        }

        if (this.balanceText) {
            this.balanceText.setPosition(this.currencyText.x - this.currencyText.width - this.padding, centerY);
        }

        if (this.balanceLabel) {
            this.balanceLabel.setPosition(this.balanceText.x - this.balanceText.width - this.padding, centerY);
        }

    }

    private handleBalanceChange(balance: bigint): void {
        this.balanceText?.setText(`${mistToSUI(Number(balance))}`);
    }

    public setVisualBalance(balance: bigint): void {
        this.balanceText?.setText(`Balance: ${formatSuiAmount(balance)}`);
    }




}