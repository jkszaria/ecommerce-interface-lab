function safeDivide(a, b) {
    try {
        if (b === 0) throw new Error("Cannot divide by zero");
        return a / b;
    } catch (err) {
        return err.message;
    } finally {
        console.log("Operation attempted");
    }
}