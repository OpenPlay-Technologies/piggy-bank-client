export enum PiggyState {
    NO_GAME_IDLE = "NO_GAME_IDLE",
    GAME_ONGOING_IDLE = "GAME_ONGOING_IDLE",
    ADVANCE_STAGE_1 = "ADVANCE_STAGE_1",
    ADVANCE_STAGE_2 = "ADVANCE_STAGE_2",
    CASHING_OUT = "CASHING_OUT",
    DYING = "DYING",
    WINNING = "WINNING"
}

export enum ActionType {
    Start = "Start",
    ADVANCE = "ADVANCE",
    CASH_OUT = "CASH_OUT"
}

export enum Difficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD"
}