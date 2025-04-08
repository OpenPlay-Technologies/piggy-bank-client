import { darkenColor } from "../utils/colors";

export class IconButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private icon: Phaser.GameObjects.Image;
    private onClickCallback?: () => void;
    private btnWidth: number;
    private btnHeight: number;
    public enabled: boolean;
    private color: number | undefined;
    private disabledColor: number | undefined;

    /**
     * @param scene - The Phaser Scene.
     * @param x - X position of the button's center.
     * @param y - Y position of the button's center.
     * @param color - Fill color (in hex, e.g., 0xff0000). Defaults to white if not provided.
     * @param iconKey - The key of the loaded SVG icon texture.
     * @param onClickCallback - Optional callback when button is clicked.
     * @param enabled - Whether the button starts enabled.
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        iconKey: string,
        onClickCallback?: () => void,
        enabled: boolean = true,
        color?: number,
    ) {
        super(scene, x, y);

        // Store the given color.
        this.color = color;
        // Compute a disabled color (darker shade) by scaling the RGB channels.
        if (this.color) {
            this.disabledColor = darkenColor(this.color, 0.5);
        }

        // Set default dimensions – these can be updated later via resize()
        const defaultWidth = 50;
        const defaultHeight = 50;
        this.btnWidth = defaultWidth;
        this.btnHeight = defaultHeight;
        this.onClickCallback = onClickCallback;
        this.enabled = enabled;

        // Create and draw the button background.
        this.background = scene.add.graphics();
        // Draw the background using the enabled or disabled color.
        this.drawButton();
        // Add the background as the first child so that it is rendered behind the icon.
        this.addAt(this.background, 0);

        // Create the icon image.
        this.icon = scene.add.image(0, 0, iconKey);
        this.icon.setOrigin(0.5);
        this.add(this.icon);
        this.updateIconScale();

        // Set the container's size and interactive hit zone.
        this.setSize(defaultWidth, defaultHeight);

        // Handle pointer events.
        this.on("pointerdown", () => {
            if (this.enabled && this.onClickCallback) {
                this.onClickCallback();
            }
        });

        // Add the container to the scene.
        scene.add.existing(this);
    }

    /**
     * Updates the icon scale so it fits within 50% of the button's dimensions.
     */
    private updateIconScale() {
        const iconScaleX = (this.btnWidth * 0.5) / this.icon.width;
        const iconScaleY = (this.btnHeight * 0.5) / this.icon.height;
        const scale = Math.min(iconScaleX, iconScaleY);
        this.icon.setScale(scale);
    }

    /**
     * Draws the button background with the specified fill color.
     * @param fillColor - The fill color to use for the background.
     */
    private drawButton(): void {
        // Clear any previous drawings.
        this.background.clear();

        if (this.enabled && this.color) {
            // Set the fill style with full opacity.
            this.background.fillStyle(this.color, 1);
            // Draw the rectangle centered around (0,0).
            this.background.fillRoundedRect(-this.btnWidth / 2, -this.btnHeight / 2, this.btnWidth, this.btnHeight, 8);
        }

        if (!this.enabled && this.disabledColor) {
            // Set the fill style with full opacity.
            this.background.fillStyle(this.disabledColor, 1);
            // Draw the rectangle centered around (0,0).
            this.background.fillRoundedRect(-this.btnWidth / 2, -this.btnHeight / 2, this.btnWidth, this.btnHeight, 8);
        }
    }

    /**
     * Resizes the button.
     * @param width - New width of the button.
     * @param height - New height of the button.
     */
    public resize(width: number, height: number): void {
        this.btnWidth = width;
        this.btnHeight = height;
        // Temporarily disable interactive zone during resize.
        this.removeInteractive();
        this.setSize(width, height);
        this.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        // Redraw the background and update the icon's scale.
        this.drawButton();
        this.updateIconScale();
    }

    /**
     * Enables or disables the button.
     * When disabled, the icon opacity is reduced and the background color darkened.
     * @param value - If false, the button is disabled.
     */
    public setEnabled(value: boolean) {
        this.enabled = value;
        // Adjust icon opacity.
        this.icon.setAlpha(value ? 1 : 0.5);
        // Update the background color accordingly.
        this.drawButton();
    }
}
