const nxPreset = require('../jest.preset');

module.exports = {
  ...nxPreset,
  displayName: 'libs',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
};
