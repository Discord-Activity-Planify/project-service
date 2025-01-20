export const decodeToken = async (token: string) => {
    try {
        // Verify the token with Discord API
        const response = await fetch('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Discord API Error:', errorData);
            return { error: errorData.message || 'Failed to authenticate user', status: response.status };
        }

        const userData = await response.json();

        // Attach user data to the request object
        return { userId: userData.id}; // Discord user ID
    } catch (error: any) {
        console.error('Error verifying Discord token:', error.message);
        return { status: 500, error: 'Internal server error during authentication' };
    }
};
