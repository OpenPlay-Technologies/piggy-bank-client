import { COLUMN_WIDTH, GAME_DATA, HEIGHT, PLATFORM_CLICKED_EVENT, Y_POS } from "../../constants";
import { GameModel } from "../../sui/models/openplay-piggy-bank";
import { bpsToMultiplier } from "../../utils/helpers";
import { Main } from "../main-scene";

export default function setupPlatforms(scene: Main) {
    // Clear any previously set up platforms before creating new ones.
    clearPlatforms(scene);

    const gameData: GameModel | undefined = scene.registry.get(GAME_DATA);
    let currentColumnIndex = 1;
    // Initialize the array that will store containers for each column.
    scene.safespotColumns = [];

    gameData?.steps_payout_bps.forEach((bps, index) => {
        // Calculate the center x position for the current column.
        const columnCenterX = COLUMN_WIDTH * currentColumnIndex + COLUMN_WIDTH / 2;

        // Add the road background for the column.
        const roadBar = scene.add.image(columnCenterX, HEIGHT / 2, "TileableRoad_Bar").setOrigin(0.5);

        // Create the platform image at the specified Y position.
        let platform: Phaser.GameObjects.Image;
        if (index === gameData.steps_payout_bps.length - 1) {
            // For the final safe spot, use the "FinalPoint" image.
            platform = scene.add.image(columnCenterX, Y_POS, "FinalPoint").setOrigin(0.5, 0.5);
        } else {
            platform = scene.add.image(columnCenterX, Y_POS, "Point").setOrigin(0.5, 0.5);
        }

        const platformIndex = currentColumnIndex - 1;
        platform.on('pointerdown', () => {
            // Ignore click if the platform is locked.
            if (platform.getData('clickLock')) {
                return;
            }
            // Lock the platform briefly to prevent rapid multiple clicks.
            platform.setData('clickLock', true);
            scene.scene.scene.events.emit(PLATFORM_CLICKED_EVENT, platformIndex);

            // Unlock after a short delay (50ms).
            scene.time.delayedCall(50, () => {
                platform.setData('clickLock', false);
            });
        });
        platform.setInteractive();
        platform.setName("Point");
        platform.setDepth(10);

        // Define text style.
        const textStyle = {
            fontFamily: 'Impact, sans-serif',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        };

        // Create and center the text displaying the bps multiplier.
        const bpsText = scene.add.text(columnCenterX, Y_POS, bpsToMultiplier(bps), textStyle).setOrigin(0.5);
        bpsText.setResolution(window.devicePixelRatio);

        // Group the road, platform, and text into a container for easier management.
        const columnContainer = scene.add.container(0, 0, [roadBar, platform, bpsText]);
        scene.safespotColumns!.push(columnContainer);

        currentColumnIndex++;
    });
}

export function clearPlatforms(scene: Main) {
    // Check if there are any previously set up platform columns.
    if (scene.safespotColumns && scene.safespotColumns.length > 0) {
        scene.safespotColumns.forEach((container: Phaser.GameObjects.Container) => {
            // Destroy each container and all its children.
            container.destroy(true);
        });
        // Reset the safespotColumns array.
        scene.safespotColumns = [];
    }
}
