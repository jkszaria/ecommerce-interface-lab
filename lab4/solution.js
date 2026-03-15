function calculateTotal(...numbers) {
    if (numbers.some(n => typeof n !== "number")) {
        throw new TypeError("Invalid input: All arguments must be numbers");
    }
    return numbers.reduce((a,b) => a + b, 0);
}