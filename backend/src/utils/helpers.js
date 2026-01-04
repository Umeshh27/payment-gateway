const crypto = require('crypto');

const generateId = (prefix) => {
    const randomChars = crypto.randomBytes(8).toString('hex'); // 16 chars
    // Prompt asks for 16 alphanumeric. hex is alphanumeric (0-9, a-f).
    // However, "alphanumeric" usually implies a-z, A-Z, 0-9. 
    // Let's use a custom charset to be safer and more "alphanumeric" like typical IDs.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}${result}`;
};

module.exports = { generateId };
