module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["<rootDir>/dist/"],
    // Map the `nanoid` import to a lightweight mock during tests to avoid ESM import parsing.
    moduleNameMapper: {
        "^nanoid$": "<rootDir>/__mocks__/nanoid.js",
    },
};
