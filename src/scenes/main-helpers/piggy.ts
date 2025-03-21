import { Y_POS } from "../../constants";
import { EMPTY_POSITION } from "../../sui/constants/piggybank-constants";
import { Main } from "../main-scene";


export default function setupPiggy(scene: Main) {
    if (!scene.leftEnd) return;
    // Sprite
    const pigX = scene.currentSpot === EMPTY_POSITION ? scene.leftEnd.x : scene.getPlatformForIndex(scene.currentSpot)?.x || 0;
    scene.pig = scene.physics.add.sprite(pigX, Y_POS, "piggy");
    scene.pig.setDepth(10);
    scene.pig.setScale(0.4);
    // Animations
    const frameNames1 = scene.anims.generateFrameNames('piggy', {
        start: 1, end: 8, zeroPad: 0,
        prefix: 'Animation 1-', suffix: '.png'
    });
    scene.anims.create({ key: 'blink', frames: frameNames1, frameRate: 8, repeat: -1, repeatDelay: 2000, delay: 2000 });
    scene.pig.anims.play('blink');
    const frameNames2 = scene.anims.generateFrameNames('piggy', {
        start: 1, end: 8, zeroPad: 0,
        prefix: 'Animation 2-', suffix: '.png'
    });
    scene.anims.create({ key: 'walk', frames: frameNames2, frameRate: 16, repeat: -1 });
}