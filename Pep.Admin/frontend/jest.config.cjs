module.exports = {
    displayName: "pep-admin-app",
    globals: {
        __PORT__: 4217,
        __STARTCMD__: "npm start -- --port 4217",
        __TIMEOUT__: 90000
    },
    preset: "../../e2eTestUtils/jest-puppeteer-utils/jest-preset.js"
};
