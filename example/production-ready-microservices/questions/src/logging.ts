import * as lambdaLog from 'lambda-log'

lambdaLog.options.dynamicMeta = () => ({
    xrayTraceId: process.env['_X_AMZN_TRACE_ID']
})

export const logger = lambdaLog