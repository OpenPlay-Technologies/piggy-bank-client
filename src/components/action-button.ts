export interface ButtonOptions {
    color?: number;         // Button's main color (0xRRGGBB)
    text?: string;          // Text to display on the button
    textColor?: string;     // Text color (e.g., "#ffffff")
    fontSize?: string;      // Font size (e.g., "20px")
    fontFamily?: string;    // Font family (e.g., "Arial Black")
    onClick?: () => void;   // Callback function when button is clicked
}

export default class ActionButton extends Phaser.GameObjects.Container {
    private graphics: Phaser.GameObjects.Graphics;
    private label: Phaser.GameObjects.Text;
    private color: number;
    private _enabled: boolean = true;
    private buttonWidth: number = 200;
    private buttonHeight: number = 200;

    /**
     * @param scene - The Phaser Scene.
     * @param x - The x position of the button's center.
     * @param y - The y position of the button's center.
     * @param options - Optional configuration for the button.
     */
    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        options: ButtonOptions = {}
    ) {
        super(scene, x, y);

        // Default dimensions
        // Use explicit dimensions instead of relying on this.width/this.height
        this.setSize(this.buttonWidth, this.buttonHeight);
        // Destructure options with defaults
        const {
            color = 0x7f7fff,
            text = "Button",
            textColor = "#ffffff",
            fontSize = "16px",
            fontFamily = "Arial Black",
            onClick,
        } = options;

        this.color = color;

        // Create graphics for the button background and add it
        this.graphics = scene.add.graphics();
        this.add(this.graphics);

        // Create the label, set its origin to center, and add it
        this.label = scene.add.text(0, 0, text, {
            fontFamily,
            fontSize,
            color: textColor,
            fontStyle: "bold",
            align: "center",
        });
        this.label.setOrigin(0.5);
        this.label.setResolution(window.devicePixelRatio); // Set resolution for better text quality
        this.add(this.label);

        // Draw the button background and set container size
        this.redraw();


        // Attach the click event if provided (only triggers if enabled)
        if (onClick) {
            this.on("pointerdown", () => {
                if (this._enabled) {
                    onClick();
                }
            });
        }

        scene.add.existing(this);
    }

    /**
     * Redraws the button graphics using centered coordinates.
     */
    private redraw(): void {
        this.graphics.clear();

        // Define colors for top and bottom halves and the shadow effect.
        const halfW = this.buttonWidth / 2;
        const halfH = this.buttonHeight / 2;
        const cornerRadius = 8;
        const shadowOffsetY = this.buttonHeight * 0.05;

        // Shadow
        if (this._enabled) {
            this.graphics.fillStyle(Phaser.Display.Color.ValueToColor(this.color).darken(20).color, 0.3);
            this.graphics.fillRoundedRect(
                -halfW,
                -halfH + shadowOffsetY,
                this.buttonWidth,
                this.buttonHeight,
                cornerRadius
            );
        }

        // Top half
        this.graphics.fillStyle(Phaser.Display.Color.ValueToColor(this.color).color, 1);
        this.graphics.fillRoundedRect(
            -halfW,
            -halfH,
            this.buttonWidth,
            this.buttonHeight / 2,
            { tl: cornerRadius, tr: cornerRadius, bl: 0, br: 0 }
        );

        // Bottom half
        this.graphics.fillStyle(Phaser.Display.Color.ValueToColor(this.color).darken(10).color, 1);
        this.graphics.fillRoundedRect(
            -halfW,
            0,
            this.buttonWidth,
            this.buttonHeight / 2,
            { tl: 0, tr: 0, bl: cornerRadius, br: cornerRadius }
        );

        if (this._enabled) {
            this.setInteractive(
                new Phaser.Geom.Rectangle(0, 0, this.buttonWidth, this.buttonHeight),
                Phaser.Geom.Rectangle.Contains
            );
            this.alpha = 1;
        } else {
            this.disableInteractive();
            this.alpha = 0.5;
        }
    }

    /**
     * Enables or disables the button.
     * @param enabled true to enable; false to disable.
     */
    public setEnabled(enabled: boolean): void {
        this._enabled = enabled;
        this.redraw();
    }

    /**
     * Returns the current enabled state.
     */
    public isEnabled(): boolean {
        return this._enabled;
    }

    /**
     * Updates the button text.
     * @param newText The new text string to display.
     */
    public setText(newText: string): void {
        this.label.setText(newText);
    }

    /**
     * Resizes the button and updates the interactive hit area.
     * @param width - New width of the button.
     * @param height - New height of the button.
     */
    public resize(width: number, height: number): void {
        this.buttonWidth = width;
        this.buttonHeight = height;
        this.setSize(width, height);

        this.removeInteractive(); // Remove previous interactive area

        this.redraw();
    }
}
