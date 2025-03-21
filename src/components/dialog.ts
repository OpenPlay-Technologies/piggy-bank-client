import * as Phaser from 'phaser';

export class Dialog extends Phaser.GameObjects.Container {
  private titleText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private button: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super(scene, x, y);

    // Create a background rectangle
    const background = scene.add.rectangle(0, 0, width, height, 0x222222);
    background.setOrigin(0.5);
    this.add(background);

    // Create title text
    this.titleText = scene.add.text(0, -height / 2 + 20, '', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
    this.add(this.titleText);

    // Create content text
    this.contentText = scene.add.text(0, 0, '', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 40 },
    }).setOrigin(0.5);
    this.add(this.contentText);

    // Create a button
    this.button = scene.add.text(0, height / 2 - 40, 'OK', {
      fontSize: '20px',
      backgroundColor: '#0000ff',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5);
    this.button.setInteractive({ useHandCursor: true });
    this.add(this.button);

    // Hide dialog by default
    this.hide();

    // Hide dialog when the button is clicked
    this.button.on('pointerup', () => {
      this.hide();
    });

    background.setScrollFactor(0);
    this.titleText.setScrollFactor(0);
    this.contentText.setScrollFactor(0);
    this.button.setScrollFactor(0);

    this.setDepth(20);


    // Add this container to the scene
    scene.add.existing(this);
  }

  // Method to show the dialog with custom text
  public show(title: string, text: string, buttonText?: string, callBack?: () => void): void {
    this.titleText.setText(title);
    this.contentText.setText(text);
    if (buttonText) {
      this.button.setText(buttonText);
    }
    this.button.on('pointerup', () => {
      this.hide();
      if (callBack) {
        callBack();
      }
    });
    this.setVisible(true);
  }

  public hide(): void {
    this.setVisible(false);
  }
}
