// Experience

export const XP_VALUES = {
    CARD_CORRECT_ANSWER: 50,    // XP for a correct answer
    CARD_GRADUATION: 100,        // XP for graduating a card
    CARD_NEW: 5,                // XP for starting a new card
};

export const ACCOUNT_LEVEL_UP = 1000;

export const getXpForNextLevel = (currentLevel: number): number => {
    return ACCOUNT_LEVEL_UP - currentLevel;
}

// User
export const USER_DEFAULT_STEPS = [5, 20, 25, 60, 1440, 4320];
export const USET_DEFAULT_MULT = 1;