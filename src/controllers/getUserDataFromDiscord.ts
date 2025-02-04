import config from '../config';

const DISCORD_BOT_TOKEN = config.discord.botToken;
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10/users';
// Function to get user data from Discord API
export const getUserDataFromDiscord = async (userId: string) => {
    try {
        const response = await fetch(`${DISCORD_API_BASE_URL}/${userId}`, {
            headers: {
                Authorization: `Bot ${DISCORD_BOT_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        return {
            userId: data.id,
            username: data.username,
            avatar: data.avatar
                ? data.avatar
                : null
        };
    } catch (error) {
        console.error(`Error fetching Discord user data for userId ${userId}:`, error);
        return { userId, username: null, avatar: null };
    }
};
