import { errorMessages as errorMessagesCore } from "../sui/models/openplay-core";
import { errorMessages as errorMessagesPiggyBank } from "../sui/models/openplay-piggy-bank";

/**
 * A helper function that returns a user-friendly error message
 * given the module name and the error code.
 *
 * @param moduleName - The name of the module (e.g., "coin_flip", "game").
 * @param errorCode - The numerical error code (e.g., 1, 2, 3, 4, 5).
 * @returns A user-friendly error string, or a default if not found.
 */
export function getErrorMessage(
    moduleName: string,
    errorCode: number
): string {
    const coreModuleErrors = errorMessagesCore[moduleName];
    if (!coreModuleErrors) {
        return "Unknown error. Please submit a bug report."
    }
    const message = coreModuleErrors[errorCode];
    if (!message) {
        return "Unknown error. Please submit a bug report"
    }
    return message;
}

/**
 * A helper function that returns a user-friendly error message
 * given the module name and the error code.
 *
 * @param moduleName - The name of the module (e.g., "coin_flip", "game").
 * @param errorCode - The numerical error code (e.g., 1, 2, 3, 4, 5).
 * @returns A user-friendly error string, or a default if not found.
 */
export function getPiggyBankErrorMessage(
    moduleName: string,
    errorCode: number
): string {
    if (moduleName && errorCode) {
        const piggyBankModuleErrors = errorMessagesPiggyBank[moduleName];
        if (piggyBankModuleErrors) {
            const message = piggyBankModuleErrors[errorCode];
            if (!message) {
                return "Unknown error. Please submit a bug report"
            }
            return message;
        }
    }

    // Fall back to core errors
    return getErrorMessage(moduleName, errorCode);
}


export function parseError(rawErrorMsg: string): [string, number] {
    // Regex to capture the name inside `Identifier("...")`
    const moduleNameRegex = /name: Identifier\("([^"]+)"\)/;

    // Regex to capture the error number after the final comma before `) in command`
    // Adjust this if the structure of the error changes in the future
    const errorNumberRegex = /},\s*(\d+)\)\s*in command/;

    // Attempt to match the module name
    const moduleNameMatch = rawErrorMsg.match(moduleNameRegex);
    const moduleName = moduleNameMatch ? moduleNameMatch[1] : "";

    // Attempt to match the error number
    const errorNumberMatch = rawErrorMsg.match(errorNumberRegex);
    const errorNumber = errorNumberMatch ? parseInt(errorNumberMatch[1], 10) : 0;

    return [moduleName, errorNumber];
}