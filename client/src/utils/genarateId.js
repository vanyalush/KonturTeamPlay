export const generateGameId = () => {
    return Math.random().toString(36).slice(2, 7);
};