module.exports = {
  verbose: true,
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: ["js", "ts", "json"],
  testPathIgnorePatterns: ["<rootDir>/dist"],
};
