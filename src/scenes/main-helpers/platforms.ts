import { COLUMN_WIDTH, GAME_DATA, HEIGHT, PLATFORM_CLICKED_EVENT, Y_POS } from "../../constants";
import { GameModel } from "../../sui/models/openplay-piggy-bank";
import { bpsToMultiplier } from "../../utils/helpers";
import { Main } from "../main-scene";

export default function setupPlatforms(scene: Main) {
    const gameData: GameModel | undefined = scene.registry.get(GAME_DATA);
    var currentColumnIndex = 1;
    scene.safespotColumns = []; // will store containers for each column
    gameData?.steps_payout_bps.forEach((bps, index) => {
        // Calculate the center x position for the current column
        const columnCenterX = COLUMN_WIDTH * currentColumnIndex + COLUMN_WIDTH / 2;

        // Add the road background for the column.
        const roadBar = scene.add.image(columnCenterX, HEIGHT / 2, "TileableRoad_Bar").setOrigin(0.5);

        // Place the platform (the safe spot) at the specified Y position.
        var platform: Phaser.GameObjects.Image;

        // If this is the final safe spot, apply a golden tint.
        if (index === gameData.steps_payout_bps.length - 1) {
            platform = scene.add.image(columnCenterX, Y_POS, "FinalPoint").setOrigin(0.5, 0.5);
        }
        else {
            platform = scene.add.image(columnCenterX, Y_POS, "Point").setOrigin(0.5, 0.5);
        }

        const platformIndex = currentColumnIndex - 1;
        platform.on('pointerdown', () => {
            // If the platform is locked, ignore this click
            if (platform.getData('clickLock')) {
                return;
            }
            // Lock the platform for a short time
            platform.setData('clickLock', true);
            scene.scene.scene.events.emit(PLATFORM_CLICKED_EVENT, platformIndex); // 1 offset for the left end column

            // Unlock after a brief delay (e.g., 50ms)
            scene.time.delayedCall(50, () => {
                platform.setData('clickLock', false);
            });
        });
        platform.setInteractive();
        platform.setName("Point");
        platform.setDepth(10);
        // Create a text style with white text, a black stroke, and a nice font.
        const textStyle = {
            fontFamily: 'Impact, sans-serif',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
        };

        // Create the text object displaying the bps and center it on the platform.
        const bpsText = scene.add.text(columnCenterX, Y_POS, bpsToMultiplier(bps), textStyle).setOrigin(0.5);
        bpsText.setResolution(window.devicePixelRatio); // Set the resolution for better clarity on mobile devices.

        // Group the road, platform, and text into a container for easier management.
        const columnContainer = scene.add.container(0, 0, [roadBar, platform, bpsText]);
        scene.safespotColumns?.push(columnContainer);

        currentColumnIndex++;
    });
}