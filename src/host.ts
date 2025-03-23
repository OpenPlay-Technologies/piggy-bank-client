import { getEnvKeypair } from "./utils/keypair";
import { INIT_REQUEST, INIT_RESPONSE, isMessage, Message, TX_SIGN_AND_EXECUTE_REQUEST, TX_SIGN_AND_EXECUTE_RESPONSE } from "./openplay-connect/messages";
import { Transaction } from "@mysten/sui/transactions";
import { getSuiClient } from "./sui/sui-client";
import { INTERACT_FUNCTION_TARGET } from "./sui/constants/piggybank-constants";

// Generate or retrieve the keypair
const keypair = getEnvKeypair();
console.log("Loaded Keypair:", keypair.toSuiAddress());

const client = getSuiClient();

// Get the iframe element
const iframe = document.getElementById('gameIframe') as HTMLIFrameElement;

// When the iframe is loaded, send an initial message to the game
iframe.onload = () => {
  // Listen to incoming messages from the iframe
  iframe.contentWindow?.addEventListener("message", (event: MessageEvent) => {
    const data = event.data;
    const window = iframe.contentWindow;

    if (!window) {
      return;
    }

    if (!isMessage(data)) {
      return;
    }

    switch (data.type) {
      case TX_SIGN_AND_EXECUTE_REQUEST:
        handleSignRequest(window, data);
        break;
      case TX_SIGN_AND_EXECUTE_RESPONSE:
        // Handle TX_SIGN_AND_EXECUTE_RESPONSE here
        break;
      case INIT_RESPONSE:
        if (data.isSuccessful) {
          console.log("Init successful");
        }
        else {
          console.error("Init failed:", data.errorMsg);
        }
        break;
      default:
        // This case should never happen due to our type guard.
        break;
    }
  });

  // Send the init
  const window = iframe.contentWindow;
  if (!window) {
    return;
  }

  const initData = {
    type: INIT_REQUEST,
    balanceManagerId: (import .meta.env.VITE_BALANCE_MANAGER_ID as string),
    houseId: (import .meta.env.VITE_HOUSE_ID as string),
    playCapId: (import .meta.env.VITE_PLAY_CAP_ID as string),
  };
  console.log("Sending init data:", initData);
  window.postMessage(initData, '*');
}

async function handleSignRequest(window: Window, data: Message) {
  if (data.type !== TX_SIGN_AND_EXECUTE_REQUEST) {
    return
  }

  const tx = Transaction.from(data.txJson);
  tx.setSender(keypair.toSuiAddress());

  try {
    if (!verifyTxData(tx)) {
      const postMessage: Message = {
        type: TX_SIGN_AND_EXECUTE_RESPONSE,
        requestId: data.request_id,
        isSuccessful: false,
        errorMsg: "Invalid transaction data",
      };
      window.postMessage(postMessage, '*');
    }

    const result = await client.signAndExecuteTransaction({
      signer: keypair, transaction: tx, options: {
        showRawEffects: true,
        showObjectChanges: true,
        showEvents: true,
      }
    });

    console.log("Transaction Result:", result);

    const postMessage: Message = {
      type: TX_SIGN_AND_EXECUTE_RESPONSE,
      requestId: data.request_id,
      result: result,
      isSuccessful: true,
    };
    window.postMessage(postMessage, '*');
  }
  catch (error) {
    const postMessage: Message = {
      type: TX_SIGN_AND_EXECUTE_RESPONSE,
      requestId: data.request_id,
      isSuccessful: false,
      errorMsg: error instanceof Error ? error.message : "An unknown error occurred",
    };
    window.postMessage(postMessage, '*');
  }
}

function verifyTxData(transaction: Transaction): boolean {
  const txData = transaction.getData();
  const txInputs = txData.inputs;

  // 1. Verify transaction commands
  if (txData.commands.length !== 1) {
    console.error("Transaction must have exactly one command");
    return false;
  }

  const moveCallCommand = txData.commands[0].MoveCall;
  if (!moveCallCommand) {
    console.error("Transaction must have a MoveCall command");
    return false;
  }

  // 2. Verify move call target
  const moveCallTarget = moveCallCommand.package + "::" + moveCallCommand.module + "::" + moveCallCommand.function;

  if (moveCallTarget !== INTERACT_FUNCTION_TARGET) {
    console.error("Invalid MoveCall target: ", moveCallTarget);
    return false;
  }

  // 3. Verify move call inputs
  const moveCallArgs = moveCallCommand.arguments;

  // Example verification on the gameId
  const gameIdArg = moveCallArgs[0];
  if (!(gameIdArg.$kind == "Input" && gameIdArg && txInputs[gameIdArg.Input].UnresolvedObject?.objectId == "0x3a3dc449dd74875134f1f5306b468afed94206cde4e91937bd284e0dab9f0e3a")) {
    console.error("Invalid Game Id");
    return false;
  }

  // const registryIdArg = moveCallArgs[1];
  // const balanceManagerIdArg = moveCallArgs[2];
  // const houseIdArg = moveCallArgs[3];
  // const playCapIdArg = moveCallArgs[4];

  return true;
}