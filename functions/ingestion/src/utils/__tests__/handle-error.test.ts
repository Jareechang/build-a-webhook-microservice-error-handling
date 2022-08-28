import { handleError } from '@app/utils';

import logger from '@app/services/logger';

import {
  AwsSqsServiceError,
  VerifySignatureError
} from '@app/errors';

const mockRequestId = 'test-123';

jest.mock('@app/services/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  }
}));

jest.mock('@app/utils/async-local-storage', () => ({
  __esModule: true,
  default: ({
    getStore: () => new Map()
      .set('awsRequestId', mockRequestId),
  })
}));

describe('utils/handle-error', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  // Unhandled error
  describe('case: unhandled error', () => {
    it('should return 500 as status code', () => {
      const error = new Error('test');
      const errorResponse = handleError(error);
      expect(errorResponse.statusCode).toBe(500);
    });
    it('should return the correct body response (JSON.stringify)', () => {
      const error = new Error('test');
      const errorResponse = handleError(error);
      expect(errorResponse.body).toBe(JSON.stringify({
        errorTrackingId: mockRequestId,
        message: error.message,
        errors: [error.message]
      }));
    });
  });

  // VerifySignatureError
  describe('case: VerifySignatureError', () => {
    it('should return 401 as status code (unauthorized)', () => {
      const error = new VerifySignatureError('test');
      const errorResponse = handleError(error);
      expect(errorResponse.statusCode).toBe(401);
    });
    it('should return the correct body response (JSON.stringify)', () => {
      const error = new VerifySignatureError('test');
      const errorResponse = handleError(error);
      expect(errorResponse.body).toBe(JSON.stringify({
        errorTrackingId: mockRequestId,
        message: error.message,
        errors: [error.message]
      }));
    });
    it('should include the context in the logger', () => {
      const error = new VerifySignatureError('test')
        .setContext({
          a: 'a',
          b: 'b'
        });
      const response = handleError(error);
      expect(logger.error).toBeCalledWith({
        message: error.message,
        context: {
          a: 'a',
          b: 'b'
        },
        clientResponse: response,
        operation: ''
      });
    });
    it('should include the operation in the logger', () => {
      const error = new VerifySignatureError('test')
        .setContext({
          a: 'a',
          b: 'b'
        })
        .setOperation('utils/verify-signature');
      const response = handleError(error);
      expect(logger.error).toBeCalledWith({
        message: error.message,
        context: {
          a: 'a',
          b: 'b'
        },
        clientResponse: response,
        operation: 'utils/verify-signature'
      });
    });
  });

  // AwsSqsServiceError
  describe('case: AwsSqsServiceError', () => {
    it('should return 500 as status code', () => {
      const error = new AwsSqsServiceError('test');
      const errorResponse = handleError(error);
      expect(errorResponse.statusCode).toBe(500);
    });
    it('should return the correct body response (JSON.stringify)', () => {
      const error = new AwsSqsServiceError('test');
      const errorResponse = handleError(error);
      expect(errorResponse.body).toBe(JSON.stringify({
        errorTrackingId: mockRequestId,
        message: error.message,
        errors: [error.message]
      }));
    });
    it('should include the context in the logger', () => {
      const error = new AwsSqsServiceError('test')
        .setContext({
          a: 'a',
          b: 'b'
        });
      const response = handleError(error);
      expect(logger.error).toBeCalledWith({
        message: error.message,
        context: {
          a: 'a',
          b: 'b'
        },
        clientResponse: response,
        operation: ''
      });
    });
    it('should include the operation in the logger', () => {
      const error = new AwsSqsServiceError('test')
        .setContext({
          a: 'a',
          b: 'b'
        })
        .setOperation('services/sqs-service');
      const response = handleError(error);
      expect(logger.error).toBeCalledWith({
        message: error.message,
        context: {
          a: 'a',
          b: 'b'
        },
        clientResponse: response,
        operation: 'services/sqs-service'
      });
    });
  });
});

