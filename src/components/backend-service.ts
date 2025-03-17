import { getOrCreateKeypair } from "../utils/keypair";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
// import { Transaction } from "@mysten/sui/transactions";


export default class BackendService {
    // Removed unused 'scene' property
    keypair: Ed25519Keypair;

    constructor(_scene: Phaser.Scene) {
        // Removed assignment to unused 'scene' property
        // Listen to the "buttonClicked" event emitted by the Phaser scene
        // this.scene.events.on('advance-event', this.handleAdvance, this);
        // this.scene.events.on('start-game-event', this.handleStartGame, this);
        this.keypair = getOrCreateKeypair();
    }

    // // Called when the button is clicked in the Phaser scene
    // private async handleAdvance(): Promise<void> {
    //     console.time('handleAdvanceTotal');
    //     try {
    //         console.log("Advancing");
    //         const balanceManagerData: BalanceManagerModel = this.scene.registry.get('balanceManagerData');
    //         const houseId = process.env.NEXT_PUBLIC_HOUSE_ID;
    //         const playCapId = process.env.NEXT_PUBLIC_PLAY_CAP_ID;
    //         const gameId = process.env.NEXT_PUBLIC_GAME_ID;

    //         if (!houseId || !playCapId || !gameId) {
    //             throw new Error("Missing environment variables");
    //         }

    //         console.time('buildSponsoredInteract');
    //         const sponsorSignature = await buildSponsoredInteract(
    //             this.keypair.toSuiAddress(),
    //             balanceManagerData.id.id,
    //             houseId,
    //             playCapId,
    //             gameId,
    //             ADVANCE_ACTION,
    //             1e7
    //         );
    //         console.timeEnd('buildSponsoredInteract');
    //         console.log(sponsorSignature);

    //         console.time('txSign');
    //         const tx = Transaction.from(sponsorSignature.bytes);
    //         const senderSignature = await tx.sign({
    //             signer: this.keypair,
    //         });
    //         console.timeEnd('txSign');

    //         console.time('executeSponsoredTransact');
    //         const result = await executeSponsoredTransact(
    //             sponsorSignature.bytes,
    //             senderSignature.signature,
    //             sponsorSignature.signature
    //         );
    //         console.timeEnd('executeSponsoredTransact');

    //         const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);
    //         let eventFound = false;

    //         if (interactEvent) {
    //             eventFound = true;
    //             const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
    //             this.scene.events.emit('interacted-event', parsedEvent);
    //         }

    //         // Measure the waitForTransaction timing when the promise resolves.
    //         console.time('waitForTransaction');
    //         waitForTransaction(result.digest).then(result => {
    //             const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);
    //             if (interactEvent && !eventFound) {
    //                 const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
    //                 this.scene.events.emit('interacted-event', parsedEvent);
    //             }
    //             console.timeEnd('waitForTransaction');
    //         })
    //             .catch((error) => {
    //                 throw error;
    //             });
    //     } catch (error) {
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         console.error(error.message);
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         // handleError(error.message);
    //     } finally {
    //         console.timeEnd('handleAdvanceTotal');
    //     }
    // }

    // // Called when the button is clicked in the Phaser scene
    // private async handleStartGame(): Promise<void> {
    //     try {
    //         console.log("Starting game");
    //         const balanceManagerData: BalanceManagerModel = this.scene.registry.get('balanceManagerData');
    //         const houseId = process.env.NEXT_PUBLIC_HOUSE_ID;
    //         const playCapId = process.env.NEXT_PUBLIC_PLAY_CAP_ID;
    //         const gameId = process.env.NEXT_PUBLIC_GAME_ID;

    //         if (!houseId || !playCapId || !gameId) {
    //             throw new Error("Missing environment variables");
    //         }

    //         const sponsorSignature = await buildSponsoredInteract(
    //             this.keypair.toSuiAddress(),
    //             balanceManagerData.id.id,
    //             houseId,
    //             playCapId,
    //             gameId,
    //             "StartGame",
    //             1e7
    //         )
    //         console.log(sponsorSignature);


    //         const tx = Transaction.from(sponsorSignature.bytes);
    //         const senderSignature = await tx.sign({
    //             signer: this.keypair,
    //         });

    //         const result = await executeSponsoredTransact(sponsorSignature.bytes, senderSignature.signature, sponsorSignature.signature);

    //         const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);
    //         let eventFound = false;

    //         if (interactEvent) {
    //             eventFound = true;
    //             const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
    //             this.scene.events.emit('interacted-event', parsedEvent);

    //         }

    //         waitForTransaction(result.digest).then(result => {
    //             const interactEvent = result.events?.find(x => x.type == INTERACT_EVENT_TYPE);

    //             if (interactEvent && !eventFound) {
    //                 const parsedEvent = interactEvent.parsedJson as InteractedWithGameModel;
    //                 this.scene.events.emit('interacted-event', parsedEvent);
    //             }
    //         })
    //             .catch((error) => {
    //                 // console.error(error.message);
    //                 // handleError(error.message);
    //                 throw error;
    //             });
    //     } catch (error) {
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         console.error(error.message);
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         // handleError(error.message);
    //     }
    // }
}
