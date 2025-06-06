import { Scene } from 'phaser';
import { BalanceManagerModel } from '../sui/models/openplay-core';
import { GameModel, PiggyBankContextModel } from '../sui/models/openplay-piggy-bank';
import { fetchBalanceManager } from '../sui/queries/balance-manager';
import { fetchContext, fetchGames } from '../sui/queries/piggy-bank';
import { mockFetchBalanceManager, mockFetchContext, mockFetchGames } from '../components/mock-backend-service';
import { GAME_DATA, BALANCE_MANAGER_DATA, CONTEXT_DATA, BALANCE_DATA, DIFFICULTY_DATA, GAME_MAP_DATA, CONTEXT_MAP_DATA } from '../constants';
import { OpenPlayGame } from '../game';
import { Difficulty } from '../components/enums';
import { GAME_ONGOING_STATUS } from '../sui/constants/piggybank-constants';

export class Preloader extends Scene {
    gameDataPromise: Promise<Record<Difficulty, GameModel | undefined>> | undefined;
    balanceManagerDataPromise: Promise<BalanceManagerModel | undefined> | undefined;

    // Flags to track asynchronous steps.
    private api1Done: boolean = false; // fetchGame contributes 20%
    private api2Done: boolean = false; // fetchBalanceManager contributes 20%
    private fetchContextStarted: boolean = false;
    private fetchContextDone: boolean = false; // fetchContext contributes 20%

    // Asset loading contributes 40% (as the remaining API calls total 60%).
    private assetsProgress: number = 0; // value between 0 and 40

    // Flag to indicate the logo fade-in is complete.
    private fadeInDone: boolean = false;

    // Sprite references.
    private logo!: Phaser.GameObjects.Sprite;
    private loaderSprite!: Phaser.GameObjects.Sprite;

    // Ensure we only transition once.
    private transitionStarted: boolean = false;
    fetchContextPromise: Promise<Record<Difficulty, PiggyBankContextModel | undefined>> | undefined;

    // Hold the fetchContext promise so we can wait on it later.

    constructor() {
        super('Preloader');
    }

    init(): void {
        // No rectangle loading bar; we'll use the loader spritesheet.
        // const { width } = this.cameras.main;
        // const baseLogoWidth = 800; // base width for scaling
        // const scaleFactor = width < baseLogoWidth ? width / baseLogoWidth : 1;
        // this.cameras.main.setZoom(scaleFactor);
    }

    preload(): void {

        const game = this.game as OpenPlayGame;

        if (!game.initData) {
            throw new Error('Game not initialized');
        }

        // ---------------------------
        // Load assets
        // ---------------------------
        // this.load.multiatlas('piggy', 'assets/spritesheets/piggy.json', 'assets/spritesheets');
        // this.load.multiatlas('piggy-2', 'assets/spritesheets/piggy-2.json', 'assets/spritesheets');
        this.load.multiatlas('piggy-animations', 'assets/spritesheets/piggy-animations.json', 'assets/spritesheets');
        this.load.image('leftEnd', 'assets/background/LeftEnd.png');
        this.load.image('TileableRoad_Bar', 'assets/background/TileableRoad_Bar.png');
        this.load.image('Point', 'assets/background/Point.png');
        this.load.image('FinalPoint', 'assets/background/FinalPoint.png');
        this.load.image('BloodStain', 'assets/background/BloodStain.png');
        this.load.image('Extra1', 'assets/background/Extra1.png');
        this.load.image('Extra2', 'assets/background/Extra2.png');
        this.load.image('hanging_meat_Extra', 'assets/background/hanging_meat_Extra.png');
        this.load.image('meat', 'assets/background/meat.png');
        this.load.image('knife', 'assets/props/knife.png');
        this.load.image('piggy-bank-background', 'assets/background/piggy-bank-background.png');

        this.load.image("plus-icon", "assets/ui/white-plus.png");
        this.load.image("minus-icon", "assets/ui/white-minus.png");
        this.load.image("chevron-left-icon", "assets/ui/white-chevron-left.png");
        this.load.image("chevron-right-icon", "assets/ui/white-chevron-right.png");
        this.load.image("close-icon", "assets/ui/white-x.png");

        this.load.image('title', 'assets/ui/Title2.png');

        this.load.image('error-title', 'assets/error/Title.png');
        this.load.image('error-header', 'assets/error/Header.png');
        this.load.image('error-popup', 'assets/error/Popup.png');
        this.load.image('error-button', 'assets/error/Restart.png');


        // ---------------------------
        // Create animations
        // ---------------------------
        // Logo fade-in animation: frames Logo00.png to Logo64.png (two-digit numbering)
        const logoFadeFrames = this.anims.generateFrameNames('openplay-loader', {
            start: 0,
            end: 64,
            zeroPad: 2,
            prefix: 'Logo',
            suffix: '.png'
        });
        this.anims.create({
            key: 'logoFade',
            frames: logoFadeFrames,
            frameRate: 30,
            repeat: 0
        });

        // Logo waving animation: frames Wave000.png to Wave060.png (three-digit numbering)
        const logoWaveFrames = this.anims.generateFrameNames('openplay-loader', {
            start: 0,
            end: 60,
            zeroPad: 3,
            prefix: 'Wave',
            suffix: '.png'
        });
        this.anims.create({
            key: 'logoWave',
            frames: logoWaveFrames,
            frameRate: 30,
            repeat: -1
        });

        // Loader bar "animation": frames Loader000.png to Loader249.png (three-digit numbering)
        // We create an animation for consistency but we won't play it as a loop.
        const loaderBarFrames = this.anims.generateFrameNames('openplay-loader', {
            start: 0,
            end: 249,
            zeroPad: 3,
            prefix: 'Loader',
            suffix: '.png'
        });
        this.anims.create({
            key: 'loaderBar',
            frames: loaderBarFrames,
            frameRate: 30,
            repeat: 0
        });

        // ---------------------------
        // Asset loading progress (assets contribute 40%)
        // ---------------------------
        this.load.on('progress', (progress: number) => {
            // progress is 0 to 1; multiply by 40 for a 40% contribution.
            this.assetsProgress = progress * 40;
        });

        // ---------------------------
        // Initiate API calls (each counts for 20%)
        // ---------------------------
        if (!(import.meta.env.VITE_DUMMY_BACKEND === 'true')) {
            console.log("fetching game and balance manager data");
            this.gameDataPromise = fetchGames();
            this.balanceManagerDataPromise = fetchBalanceManager(game.initData.balanceManagerId);
        } else {
            console.log("using dummy backend");
            this.gameDataPromise = mockFetchGames();
            this.balanceManagerDataPromise = mockFetchBalanceManager();
        }

        this.gameDataPromise
            ?.then(() => {
                this.api1Done = true;
            })
            .catch((error) => {
                console.error('Error in fetchGame:', error);
                this.api1Done = true;
            });

        this.balanceManagerDataPromise
            ?.then(() => {
                this.api2Done = true;
            })
            .catch((error) => {
                console.error('Error in fetchBalanceManager:', error);
                this.api2Done = true;
            });
    }

    create(): void {
        const { width, height } = this.cameras.main;

        // Create the logo sprite and position it a little higher.
        this.logo = this.add.sprite(width / 2, height / 2 - 50, 'openplay-loader');
        this.logo.play('logoFade');

        // When the fade-in animation is complete, start the wave animation and create the loader sprite.
        this.logo.on('animationcomplete', () => {
            this.fadeInDone = true;
            // Start the waving animation (logo letters waving)
            this.logo.play('logoWave');

            // Create the loader sprite just below the logo (closer than before).
            this.loaderSprite = this.add.sprite(width / 2, height / 2 + 80, 'openplay-loader');
            // Initialize its frame to show 0% progress.
            this.loaderSprite.setFrame(0);
        });
    }

    update(): void {
        // Only update the loader sprite if the fade-in is done and the loader exists.
        if ((this.fadeInDone && this.loaderSprite) || (import.meta.env.VITE_SKIP_LOADER) == "true") {
            // As soon as both API calls are done and fetchContext hasn't started, initiate fetchContext.
            if (this.api1Done && this.api2Done && !this.fetchContextStarted) {
                this.fetchContextStarted = true;
                // Start fetchContext once gameData and balanceManagerData are available.
                this.fetchContextPromise = Promise.all([this.gameDataPromise, this.balanceManagerDataPromise])
                    .then(([gameData, balanceManagerData]) => {
                        if (!gameData || !balanceManagerData) {
                            throw new Error('Missing data for fetchContext');
                        }

                        const difficulties = Object.keys(gameData) as Difficulty[];

                        const contextEntriesPromises = difficulties.map(async (difficulty) => {
                            let context;
                            if (import.meta.env.VITE_DUMMY_BACKEND === 'true') {
                                context = await mockFetchContext(difficulty);
                            } else {
                                const gameModel = gameData[difficulty];
                                if (!gameModel) {
                                    throw new Error(`Missing game data for difficulty ${difficulty}`);
                                }
                                context = await fetchContext(gameModel.contexts.fields.id.id, balanceManagerData.id.id);
                            }
                            // Return a tuple that will later be used to reconstruct an object.
                            return [difficulty, context] as const;
                        });

                        return Promise.all(contextEntriesPromises)
                            .then(entries => {
                                // Transform the array of tuples into an object keyed by difficulty.
                                return entries.reduce((acc, [difficulty, context]) => {
                                    acc[difficulty] = context;
                                    return acc;
                                }, {} as Record<Difficulty, PiggyBankContextModel | undefined>);
                            });
                    })
                    .then((context) => {
                        this.fetchContextDone = true;
                        return context;
                    })
                    .catch((error) => {
                        console.error('Error in fetchContext:', error);
                        this.fetchContextDone = true;
                        return {
                            [Difficulty.EASY]: undefined,
                            [Difficulty.MEDIUM]: undefined,
                            [Difficulty.HARD]: undefined
                        }
                    });
            }

            // Calculate overall progress (in percentage):
            // - Assets: up to 40%
            // - fetchGame: 20% if done
            // - fetchBalanceManager: 20% if done
            // - fetchContext: 20% if done
            const apiProgress =
                (this.api1Done ? 20 : 0) +
                (this.api2Done ? 20 : 0) +
                (this.fetchContextDone ? 20 : 0);
            const overallProgress = Math.min(this.assetsProgress + apiProgress, 100);

            // Update the loader sprite's frame to reflect progress.
            // There are 250 frames total (indexed 0–249).
            const totalFrames = 250;
            const frameIndex = Math.floor((overallProgress / 100) * (totalFrames - 1));
            const frameKey = 'Loader' + this.zeroPad(frameIndex, 3) + '.png';
            this.loaderSprite?.setFrame(frameKey);

            // If overall progress is complete (100%), transition to the main scene.
            if (overallProgress >= 100 && !this.transitionStarted) {
                this.transitionStarted = true;
                this.transitionToMain();
            }
        }
    }

    /**
     * Helper method to zero-pad numbers.
     */
    private zeroPad(num: number, places: number): string {
        return String(num).padStart(places, '0');
    }

    /**
     * Transitions to the Main scene once all promises (including fetchContext) have resolved.
     */
    private transitionToMain(): void {
        Promise.all([
            this.gameDataPromise,
            this.balanceManagerDataPromise,
            this.fetchContextPromise ?? Promise.resolve(undefined)
        ])
            .then(([gameData, balanceManagerData, contexts]) => {
                if (!gameData) {
                    throw new Error('Game data not found');
                }
                if (!balanceManagerData) {
                    throw new Error('Balance manager data not found');
                }
                if (!contexts){
                    throw new Error('Contexts data not found');
                }
                this.registry.set(CONTEXT_MAP_DATA, contexts);
                for (const difficulty of Object.keys(contexts)) {
                    const context: PiggyBankContextModel | undefined = contexts[difficulty as Difficulty];
                    if (context && context.status == GAME_ONGOING_STATUS) {
                        console.log("Found existing context for difficulty:", difficulty);
                        this.registry.set(DIFFICULTY_DATA, difficulty);
                        this.registry.set(CONTEXT_DATA, context);
                        break;
                    }
                }
                if (!this.registry.get(DIFFICULTY_DATA)) {
                    this.registry.set(DIFFICULTY_DATA, Difficulty.EASY);
                }

                console.log("Game data:", gameData);

                const currentGame = gameData[this.registry.get(DIFFICULTY_DATA) as Difficulty];
                if (!currentGame) {
                    throw new Error('Current game data not found');
                }
                this.registry.set(GAME_DATA, currentGame);
                this.registry.set(GAME_MAP_DATA, gameData);
                this.registry.set(BALANCE_MANAGER_DATA, balanceManagerData);
                this.registry.set(BALANCE_DATA, BigInt(balanceManagerData.balance) ?? BigInt(0));
                this.scene.start('Main');
            })
            .catch((error) => {
                console.error('Error during transition:', error);
            });
    }
}
