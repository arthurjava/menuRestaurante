/** @type {import('@angular/build').KarmaConfigOptions} */
export default {
  basePath: '',
  frameworks: ['jasmine'],
  plugins: [
    require('karma-jasmine'),
    require('karma-chrome-launcher'),
    require('karma-jasmine-html-reporter'),
    require('karma-coverage'),
    require('@angular/build/plugins/karma')
  ],
  client: {
    jasmine: {
      random: true
    },
    clearContext: false
  },
  jasmineHtmlReporter: {
    showAll: true
  },
  coverageReporter: {
    dir: require('path').join(__dirname, './coverage/frontend'),
    subdir: '.',
    reporters: [
      { type: 'html' },
      { type: 'text-summary' }
    ],
    check: {
      global: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70
      }
    }
  },
  reporters: ['progress', 'kjhtml'],
  port: 9876,
  colors: true,
  logLevel: 'info',
  autoWatch: true,
  browsers: ['ChromeHeadless'],
  singleRun: false,
  restartOnFileChange: true
};