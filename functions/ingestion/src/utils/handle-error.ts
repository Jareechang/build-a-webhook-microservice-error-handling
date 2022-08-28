
import {
  APIGatewayProxyResult
} from 'aws-lambda';

import {
  CommonError,
  AwsSqsServiceError,
  VerifySignatureError,
} from '@app/errors';

import logger from '@app/services/logger';
import asyncLocalStorage from '@app/utils/async-local-storage';

import { ServiceError } from '@app/types';

function handleLog(
  error: ServiceError | Error,
  response: APIGatewayProxyResult,
) {
  let logDetails: any = { message: error.message };
  if (error instanceof CommonError) {
    logDetails.operation = error.operation;
    logDetails.context = error.context;
  }
  logDetails.clientResponse = response;
  logger.error(logDetails);
}

export default function handleError(
  error: ServiceError | Error
) : APIGatewayProxyResult {
  const requestId: string = asyncLocalStorage.getStore().get('awsRequestId');
  const response : any = {
    statusCode: 500,
    body: {
      errorTrackingId: requestId,
      message: 'Something went wrong',
      errors: []
    },
  };
  switch (error.constructor.name) {
    // Authentication failure or signature mis-match
    case VerifySignatureError.name:
      response.statusCode = 401;
      break;
    // SQS error - server error
    case AwsSqsServiceError.name:
      break;
    default:
      break;
  }
  response.body.message = error.message;
  response.body.errors.push(error.message);
  response.body = JSON.stringify(response.body);
  // Logging
  handleLog(error, response);
  return response;
}
