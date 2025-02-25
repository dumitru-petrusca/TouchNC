/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  // testEnvironment: "node",
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
};