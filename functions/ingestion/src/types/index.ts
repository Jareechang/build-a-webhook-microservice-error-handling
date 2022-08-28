export type Maybe<T> = T | null;

export interface ServiceError {
  message: string;
  context: Record<string, any>;
  operation: string;
  name: string;

  setOperation: (operation: string) => ServiceError;
  setContext: (context: Record<string, any>) => ServiceError;
};
