const validateVPA = (vpa) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return regex.test(vpa);
};

const validateLuhn = (cardNumber) => {
    const cleaned = cardNumber.replace(/[\s-]/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned.charAt(i));

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return (sum % 10) === 0;
};

const getCardNetwork = (cardNumber) => {
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^60|^65|^8[1-9]/.test(cleaned)) return 'rupay';

    return 'unknown';
};

const validateExpiry = (month, year) => {
    const current = new Date();
    const currentMonth = current.getMonth() + 1;
    const currentYear = current.getFullYear();

    let expYear = parseInt(year);
    let expMonth = parseInt(month);

    if (expYear < 100) expYear += 2000;

    if (expMonth < 1 || expMonth > 12) return false;

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
};

module.exports = {
    validateVPA,
    validateLuhn,
    getCardNetwork,
    validateExpiry
};
