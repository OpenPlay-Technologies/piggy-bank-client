import { lightenColor } from "../utils/colors";

export class IconButton extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Graphics;
    private icon: Phaser.GameObjects.Image;
    private onClickCallback?: () => void;
    private btnWidth: number;
    private btnHeight: number;
    private color: number; // Store the color for redrawing
    public enabled: boolean;

    /**
     * @param scene - The Phaser Scene.
     * @param x - X position of the button's center.
     * @param y - Y position of the button's center.
     * @param color - Fill color (in hex, e.g., 0xff0000).
     * @param iconKey - The key of the loaded SVG icon texture.
     * @param onClickCallback - Optional callback when button is clicked.
     * @param enabled - Whether the button starts enabled.
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        color: number,
        iconKey: string,
        onClickCallback?: () => void,
        enabled: boolean = true
    ) {
        super(scene, x, y);

        // Set default dimensions – these can be updated later via resize()
        const defaultWidth = 50;
        const defaultHeight = 50;
        this.btnWidth = defaultWidth;
        this.btnHeight = defaultHeight;
        this.color = color;
        this.onClickCallback = onClickCallback;
        this.enabled = enabled;

        // Create the button background
        this.background = scene.add.graphics();
        this.drawButton(this.color);
        this.add(this.background);

        // Create the icon image.
        this.icon = scene.add.image(0, 0, iconKey);
        this.icon.setOrigin(0.5);
        this.add(this.icon);
        this.updateIconScale();

        // Set the container's size and interactive zone.
        this.setSize(defaultWidth, defaultHeight);
        this.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, defaultWidth, defaultHeight),
            Phaser.Geom.Rectangle.Contains
        );

        // Handle pointer events.
        this.on("pointerdown", () => {
            if (this.enabled && this.onClickCallback) {
                this.onClickCallback();
            }
        });

        // Set the initial visual state.
        this.updateVisualState();

        // Add the container to the scene.
        scene.add.existing(this);
    }

    /**
     * Draws the button background as a rounded rectangle.
     * @param color - The fill color.
     */
    private drawButton(color: number) {
        this.background.clear();
        const radius = 16; // Adjust the rounded corner radius as needed.
        this.background.fillStyle(color, 1);
        // Draw rectangle centered at (0,0)
        this.background.fillRoundedRect(-this.btnWidth / 2, -this.btnHeight / 2, this.btnWidth, this.btnHeight, radius);
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
     * Resizes the button.
     * @param width - New width of the button.
     * @param height - New height of the button.
     */
    public resize(width: number, height: number): void {
        this.btnWidth = width;
        this.btnHeight = height;
        this.removeInteractive(); // Disable interaction during resize
        this.setSize(width, height);
        this.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, width, height),
            Phaser.Geom.Rectangle.Contains
        );
        // Redraw background and update icon scaling.
        this.drawButton(this.color);
        this.updateIconScale();
    }

    /**
     * Enables or disables the button.
     * @param value - If false, the button is disabled.
     */
    public setEnabled(value: boolean) {
        this.enabled = value;
        this.updateVisualState();
    }

    /**
     * Updates the visual state (alpha) based on whether the button is enabled.
     */
    private updateVisualState() {
        this.setAlpha(this.enabled ? 1 : 0.5);
    }
}
