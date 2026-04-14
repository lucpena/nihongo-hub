import { USER_DEFAULT_STEPS, USET_DEFAULT_MULT } from "./system";


// In React, interfaces are used to define the shape of props that a component expects. 
// They help in type-checking and provide better code readability. 
export interface SRSSettings {
    learningSteps: number[];        // Time intervals in minutes for learning steps
    graduatingMultiplier: number;   // Multiplier for calculating the next review interval after graduation
}

export interface SRSResult {
    stepIndex: number;              // Index of the current step in the learning process
    interval: number;               // Time interval in minutes until the next review
    dueDate: Date;                  // Date when the next review is due
}

export const calculateNextReview = (
    isCorrect: boolean,
    currentStepIndex: number,
    currentInterval: number, 
    settings: SRSSettings
): SRSResult => {
    const { learningSteps, graduatingMultiplier } = settings;
    const now = new Date();

    let nextStepIndex = currentStepIndex;
    let nextInterval = currentInterval;

    // Fallback value for user not having settings
    const steps = learningSteps && learningSteps.length > 0
        ? learningSteps
        : USER_DEFAULT_STEPS;
    // const multiplier = USET_DEFAULT_MULT || 1;

    if( !isCorrect ) {
        // Wrong answer: the card ressets
        nextStepIndex = 0;
        nextInterval = steps[0];
    }else {
        // Good answer: now verifies if it's a next step ou graduated
        if( currentStepIndex < steps.length - 1 ) {
            // Learning
            nextStepIndex = currentStepIndex + 1;
            nextInterval = steps[nextStepIndex];
        } else {
            // Graduated
            nextStepIndex = steps.length - 1;   // keep in the last one
            nextInterval = currentInterval;     // we can make it multiply, but first I want to keep it in the last one
            // nextInterval = Math.round(currentInterval * multiplier);
        }
    }

    // Now calculate the date (milisseconds)
    const dueDate = new Date(now.getTime() + nextInterval * 60 * 1000);

    return {
        stepIndex: nextStepIndex,
        interval: nextInterval,
        dueDate
    };
}