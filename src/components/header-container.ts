// HeaderContainer.ts
import { BALANCE_BAR_HEIGHT_PX } from "../constants";
import { requestCloseGame } from "../openplay-connect/functions";
import { IconButton } from "./icon-button";

export class HeaderContainer extends Phaser.GameObjects.Container {
  background: Phaser.GameObjects.Image;
  closeButton: IconButton;
  title: Phaser.GameObjects.Image;
  padding: number = 10;
  closeButtonSize: number = BALANCE_BAR_HEIGHT_PX;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Create a background texture if it doesn't exist.
    if (!this.scene.textures.exists("ui-mobile-bg")) {
      const bgGraphics = this.scene.add.graphics();
      bgGraphics.fillStyle(0x222222, 1);
      bgGraphics.fillRect(0, 0, 800, 600);
      bgGraphics.generateTexture("ui-mobile-bg", 800, 600);
      bgGraphics.destroy();
    }
    this.background = this.scene.add.image(0, 0, "ui-mobile-bg").setOrigin(0, 0);
    this.add(this.background);

    // Create the close button (on the left).
    this.closeButton = new IconButton(
      scene,
      0, // Updated in resize()
      0,
      0x222222,
      'close-icon',
      () => requestCloseGame(),
      true
    );
    this.closeButton.resize(this.closeButtonSize, this.closeButtonSize);
    this.add(this.closeButton);

    // Create the title image (will appear on the right).
    this.title = this.scene.add.image(0, 0, "title");
    this.add(this.title);

    // Perform initial layout.
    this.resize();

    // Listen for resize events.
    this.scene.scale.on("resize", this.resize, this);
  }

  resize() {
    const width = this.scene.scale.width;
    const height = BALANCE_BAR_HEIGHT_PX;
    this.background.setDisplaySize(width, height);
    this.background.setPosition(0, 0);

    const centerY = height / 2;

    // Position the close button on the left.
    this.closeButton.setPosition(this.padding + this.closeButtonSize / 2, centerY);

    // Position the title on the right.
    // Setting the origin to (1, 0.5) aligns its right edge to the given x-position.
    this.title.setOrigin(1, 0.5);
    // Scale the title to fit within the header height (accounting for padding).
    const scale = (height - 2 * this.padding) / this.title.height;
    this.title.setScale(scale);
    this.title.setPosition(width - this.padding, centerY);
  }
}
