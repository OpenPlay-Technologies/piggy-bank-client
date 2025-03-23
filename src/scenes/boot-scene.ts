import { Scene } from 'phaser';
import { OpenPlayGame } from '../game';
import { INIT_DATA_READY_EVENT } from '../constants';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // The Boot Scene is typically used to load in any assets you require for your Preloader, 
        // such as a game logo or background. The smaller the file size of the assets, the better, 
        // as the Boot Scene itself has no preloader.
        this.load.multiatlas('openplay-loader', 'assets/loader/openplay-loader.json', 'assets/loader');
    }

    create() {
        const gameInstance = this.game as OpenPlayGame;

        // Check if the init data is already available
        if (gameInstance.initData) {
            // Proceed to Preloader scene immediately
            this.scene.start('Preloader');
        } else {
            // Add a waiting message in the center of the screen
            const { width, height } = this.cameras.main;
            this.add
                .text(width / 2, height / 2, 'Game not initialized', {
                    font: '20px Arial',
                    color: '#ffffff'
                })
                .setOrigin(0.5);

            // Wait until the init data is received
            gameInstance.events.once(INIT_DATA_READY_EVENT, () => {
                this.scene.start('Preloader');
            });
        }
    }
}
