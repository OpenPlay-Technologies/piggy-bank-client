// BalanceContainer.ts
import { BALANCE_DATA, BALANCE_UPDATED_EVENT, GAME_LOADED_EVENT } from "../constants";
import { lightenColor } from "../utils/colors";
import { mistToSUI } from "../utils/helpers";

export class BalanceContainer extends Phaser.GameObjects.Container {
  balanceLabel: Phaser.GameObjects.Text;
  balanceText: Phaser.GameObjects.Text;
  currencyText: Phaser.GameObjects.Text;
  mainColor: number;
  padding: number = 10;

  constructor(scene: Phaser.Scene, x: number, y: number, mainColor: number = 0x8e8bc4) {
    super(scene, x, y);
    this.mainColor = mainColor;
    
    // Create "BALANCE" label with its origin on the right.
    this.balanceLabel = scene.add.text(0, 0, 'BALANCE', {
      fontSize: "16px",
      fontFamily: "Arial Black",
      color: "#" + this.mainColor.toString(16)
    });
    // (1, 0.5) anchors the right edge of the text.
    this.balanceLabel.setOrigin(1, 0.5);
    this.balanceLabel.setResolution(window.devicePixelRatio);
    this.add(this.balanceLabel);

    // Create the balance value text with left origin.
    this.balanceText = scene.add.text(0, 0, '', {
      fontSize: "16px",
      fontFamily: "Arial Black",
      color: "#" + lightenColor(this.mainColor, 0.8).toString(16)
    });
    // (0, 0.5) anchors the left edge of the text.
    this.balanceText.setOrigin(0, 0.5);
    this.balanceText.setResolution(window.devicePixelRatio);
    this.add(this.balanceText);

    // Create the currency text ("SUI") with left origin.
    this.currencyText = scene.add.text(0, 0, 'SUI', {
      fontSize: "16px",
      fontFamily: "Arial Black",
      color: "#" + this.mainColor.toString(16)
    });
    this.currencyText.setOrigin(0, 0.5);
    this.currencyText.setResolution(window.devicePixelRatio);
    this.add(this.currencyText);

    // Load the current balance from the registry.
    this.loadBalance();

    // Initial layout of the texts.
    this.updateLayout();

    // Listen for events that update the balance.
    const gameScene = this.scene.scene.get("Main");
    gameScene.events.on(BALANCE_UPDATED_EVENT, this.handleBalanceChange, this);
    gameScene.events.on(GAME_LOADED_EVENT, this.loadBalance, this);
  }

  loadBalance() {
    const currentBalance = this.scene.registry.get(BALANCE_DATA) || 0n;
    this.setBalance(currentBalance);
  }

  handleBalanceChange(balance: bigint) {
    this.setBalance(balance);
  }

  setBalance(balance: bigint) {
    this.balanceText.setText(`${mistToSUI(Number(balance))}`);
    // After updating text content which might affect widths, update the layout.
    this.updateLayout();
  }

  /**
   * Updates the layout and re-centers the container's content.
   */
  updateLayout() {
    // Step 1: Layout the texts relative to a known baseline.
    // "BALANCE" label is positioned at (0,0); its origin (1, 0.5) means its right edge is at x = 0.
    this.balanceLabel.setPosition(0, 0);
    // Place the balance value text with a left padding.
    this.balanceText.setPosition(this.padding, 0);
    // Place the currency text right after the balance text plus padding.
    this.currencyText.setPosition(this.balanceText.x + this.balanceText.width + this.padding, 0);

    // Step 2: Calculate the overall bounds.
    // The left edge comes from the "BALANCE" label, which extends to the left because of its origin.
    const leftEdge = this.balanceLabel.x - this.balanceLabel.width; // since origin is (1, 0.5)
    // The right edge is the right side of the currency text.
    const rightEdge = this.currencyText.x + this.currencyText.width; // since origin is (0, 0.5)
    const totalWidth = rightEdge - leftEdge;
    
    // Determine the horizontal center of the assembled texts.
    const centerOffset = leftEdge + totalWidth / 2;
    
    // Step 3: Shift all children so that the calculated center becomes x = 0.
    // This repositions the texts relative to the container such that (0,0) is their center.
    this.balanceLabel.x -= centerOffset;
    this.balanceText.x -= centerOffset;
    this.currencyText.x -= centerOffset;
  }
}
