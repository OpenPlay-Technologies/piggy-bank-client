import { Scene } from 'phaser';
import { BalanceManagerModel } from '../sui/models/openplay-core';
import { GameModel } from '../sui/models/openplay-piggy-bank';
import { fetchBalanceManager } from '../sui/queries/balance-manager';
import { fetchGame, fetchContext } from '../sui/queries/piggy-bank';

export class Preloader extends Scene {
    gameDataPromise: Promise<GameModel | undefined> | undefined;
    balanceManagerDataPromise: Promise<BalanceManagerModel | undefined> | undefined;

    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        // this.add.image(512, 384, 'background');

        const { width, height } = this.cameras.main;
        // Define dimensions for the progress bar outline.
        const progressBarWidth = 468;
        const progressBarHeight = 32;
        const barPadding = 4; // padding inside the outline

        // Calculate the inner width for the actual progress bar.
        const innerWidth = progressBarWidth - 2 * barPadding;

        // Create the outline rectangle centered on the screen.
        // The outline is centered at (width/2, height/2)
        this.add.rectangle(width / 2, height / 2, progressBarWidth, progressBarHeight)
            .setStrokeStyle(2, 0xffffff);

        // Create the progress bar itself.
        // Set the origin to (0, 0.5) so that it expands rightwards from its left edge.
        // Position it at the left edge of the outline plus some padding.
        const bar = this.add.rectangle(
            width / 2 - progressBarWidth / 2 + barPadding,
            height / 2,
            0, // start with 0 width
            progressBarHeight - 2 * barPadding,
            0xffffff
        ).setOrigin(0, 0.5);

        // Listen for the 'progress' event to update the progress bar's width.
        this.load.on('progress', (progress: number) => {
            // Set the bar's width proportionally to the progress.
            bar.width = innerWidth * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.multiatlas('piggy', 'assets/spritesheets/piggy.json', 'assets/spritesheets');

        // // Initiate the external API call; store the promise on the scene instance
        this.gameDataPromise = fetchGame(import .meta.env.VITE_GAME_ID);
        this.balanceManagerDataPromise = fetchBalanceManager(import .meta.env.VITE_BALANCE_MANAGER_ID);
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        Promise.all([this.gameDataPromise, this.balanceManagerDataPromise])
            .then(([gameData, balanceManagerData]) => {
                if (!gameData) {
                    throw new Error('Game data not found');
                }
                if (!balanceManagerData) {
                    throw new Error('Balance manager data not found');
                }

                // Store the data in the global registry
                this.registry.set('gameData', gameData);
                this.registry.set('balanceManagerData', balanceManagerData);

                fetchContext(gameData.contexts.fields.id.id, balanceManagerData.id.id).then((context: any) => {
                    this.registry.set('contextData', context);
                    // Transition to the next scene
                    this.scene.start('Main');
                }
                ).catch((error: any) => {
                    console.error('Error fetching context data:', error);
                }
                );
            })
            .catch((error) => {
                console.error('Error fetching game data:', error);
            });
    }
}