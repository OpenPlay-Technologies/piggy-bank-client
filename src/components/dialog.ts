import * as Phaser from 'phaser';
import ActionButton from './action-button';

export class Dialog extends Phaser.GameObjects.Container {
	// Images for our assets
	private popupImage: Phaser.GameObjects.Image;
	private headerImage: Phaser.GameObjects.Image;
	private actionButton: ActionButton;

	// Text objects for dynamic content
	private headerText: Phaser.GameObjects.Text;
	private contentText: Phaser.GameObjects.Text;
	private buttonText?: Phaser.GameObjects.Text;

	private margin: number = 10; // Margin for button positioning
	wordWrap: number = 0;
	onClick: (() => void) | undefined;
	buttonOffset: number = 0;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number
	) {
		super(scene, x, y);

		// Create the popup background using 'error-popup'
		this.popupImage = scene.add.image(0, 0, 'error-popup');
		this.popupImage.setOrigin(0.5);
		this.add(this.popupImage);

		// Create the header board using 'error-header'
		// Place header so its center is exactly at the top edge of the popup,
		// meaning half of the header will be above the popup and half inside.
		this.headerImage = scene.add.image(0, 0, 'error-header');
		this.headerImage.setOrigin(0.5, 0.5);
		this.add(this.headerImage);

		// Create the header title text that sits on top of the header.
		// (We use a text object so we can update its value dynamically via show().)
		this.headerText = scene.add.text(0, 0, '', {
			fontSize: '24px',
			color: '#ffffff',
			fontFamily: "Arial Black",
		}).setOrigin(0.5);
		this.add(this.headerText);

		// Create the main content text
		// Position it just below the header.
		this.contentText = scene.add.text(0, 0, '', {
			fontSize: '16px',
			fontFamily: "Arial Black",
			color: '#ffffff',
			align: 'center',
			resolution: window.devicePixelRatio // Set resolution for better text quality
		}).setOrigin(0.5, 0);
		this.add(this.contentText);

		// Create the button using 'error-button'
		this.actionButton = new ActionButton(scene, 0, 0, {
			color: 0x70db79
		});
		this.add(this.actionButton);


		// this.buttonImage = scene.add.image(0, this.popupImage.displayHeight / 2 - 40, 'error-button');
		// this.buttonImage.setOrigin(0.5);
		// this.buttonImage.setInteractive({ useHandCursor: true });
		// this.add(this.buttonImage);

		// (Optional) If you want to allow a dynamic label on the button,
		// create a text object and center it on top of the button image.
		// This text will be updated in the show() method if a buttonText is provided.
		// Otherwise, if your button asset already has the desired text, this can be skipped.
		// Here we create it but leave it empty by default.
		this.buttonText = scene.add.text(0, 0, '', {
			fontSize: '20px',
			color: '#ffffff',
			resolution: window.devicePixelRatio // Set resolution for better text quality
		}).setOrigin(0.5);
		this.add(this.buttonText);

		// Initially hide the dialog
		this.hide();

		this.setDepth(20);
		scene.add.existing(this);
	}

	/**
	 * Shows the dialog with the provided title, content text, and optional button label and callback.
	 * @param title The header/title text to display (overlaid on the header board).
	 * @param text The main content text of the dialog.
	 * @param btnText An optional label for the button (if not provided, the button image is used as is).
	 * @param callBack An optional callback to execute when the button is pressed.
	 */
	public show(title: string, text: string, btnText?: string, callBack?: () => void): void {
		// Update header title and content text.
		this.headerText.setText(title);
		this.contentText.setText(text);

		// Update button text if provided; if not, clear it.
		if (btnText) {
			if (this.actionButton) {
				this.actionButton.setText(btnText);
			}
		} else if (this.actionButton) {
			this.actionButton.setText('');
		}

		this.actionButton.setOnClick(() => {
			if (callBack) {
				callBack();
			}
		});

		this.setVisible(true);
	}

	public hide(): void {
		this.setVisible(false);
	}

	public resize(width: number, height: number): void {
		this.setSize(width, height);
		this.wordWrap = width * 0.85; // Set word wrap width to 80% of the container's width
		this.buttonOffset = height * 0.1; // Set button offset to 10% of the container's height
		
		// Update the popup background to fill the entire container.
		this.popupImage.setDisplaySize(width, height);
		

		// ----- Header (title board) -----
		// Define header size as a percentage of container width and height.
		const headerWidth = width * 0.8;  // header takes 80% of the container's width
		const headerHeight = height * 0.2; // header takes 20% of the container's height
		this.headerImage.setDisplaySize(headerWidth, headerHeight);
		// Position header so that its center is on the top edge of the popup.
		this.headerImage.setPosition(0, -height / 2);

		// Update header text position to match the header board.
		this.headerText.setPosition(0, this.headerImage.y);

		// ----- Button -----
		// Scale the button image to be 50% of the container's width.
		const buttonWidth = width * 0.5;
		const buttonHeight = height * 0.15;
		this.actionButton.resize(buttonWidth, buttonHeight);
		this.actionButton.setPosition(0, height / 2 - buttonHeight / 2 - this.margin - this.buttonOffset);

		// ----- Content Text -----
		// Position the content text just below the header.
		// The header's bottom edge is headerImage.y + (headerHeight / 2). Add a small margin.
		// Calculate the top boundary of the content area: just below the header.
		// Reposition the content text to always start just below the header.
		const contentStartY = this.headerImage.y + (headerHeight / 2) + this.margin;
		// Set origin so the text begins at the top (and is horizontally centered)
		this.contentText.setOrigin(0.5, 0.5);
		// Update word wrap width if needed
		this.contentText.setWordWrapWidth(this.wordWrap);

		// Assuming these values have been computed in container-local coordinates:
		const contentEndY = this.actionButton.y - (this.actionButton.displayHeight / 2) - this.margin*2;
		const allowedHeight = contentEndY - contentStartY;
		const allowedWidth = this.wordWrap;

		const centerY = contentStartY + (allowedHeight / 2);
		this.contentText.setPosition(0, centerY);

		// Convert the local mask rectangle to world coordinates.
		// The container's position in the scene is (this.x, this.y).
		const maskWorldX = this.x - allowedWidth / 2;
		const maskWorldY = this.y + contentStartY;

		// Create the rectangle in world space.
		const contentMaskRect = new Phaser.Geom.Rectangle(maskWorldX, maskWorldY, allowedWidth, allowedHeight);

		// Create a graphics object for the mask. Make sure it is not added to the display list.
		const maskGraphics = this.scene.make.graphics({ x: 0, y: 0 });
		maskGraphics.fillStyle(0xffffff);
		maskGraphics.fillRectShape(contentMaskRect);

		// Create the geometry mask from the graphics and apply it to the content text.
		const geometryMask = maskGraphics.createGeometryMask();
		this.contentText.setMask(geometryMask);
	}
}
