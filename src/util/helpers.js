const cfenv = require('cfenv')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: `${__dirname}/../../test/vcap.json`,
})

// parse service instance credentials from environment
const getCreds = instance => {
  return appEnv.getServiceCreds(instance)
}

// DRY up common error handling tasks
const handleError = ({ testState, error, errors }) => {
  try {
    console.log(error.stack)
    /* eslint-disable no-param-reassign */
    if (testState.results.message === 'OK') testState.results.message = error.message
  } catch (error) {
    testState.results.message = 'Caught unknown error.'
  }
  errors.inc()
  return testState.results
}

// instantite object to hold test state
const init = instance => {
  return {
    startTime: Date.now(),
    results: {
      instance,
      message: 'OK',
    },
  }
}

module.exports = {
  getCreds,
  handleError,
  init,
}
