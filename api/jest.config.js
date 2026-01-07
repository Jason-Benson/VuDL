module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["<rootDir>/dist/"],
    // Transform ESM packages in node_modules that Jest ignores by default.
    // `nanoid` ships as ESM; include it so ts-jest will transform it for tests.
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!nanoid)"],
    // Map the `nanoid` import to a lightweight mock during tests to avoid ESM import parsing.
    moduleNameMapper: {
        "^nanoid$": "<rootDir>/__mocks__/nanoid.js",
    },
};
