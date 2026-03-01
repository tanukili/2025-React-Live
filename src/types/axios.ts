export type TErrorResponse = {
  message: string;
  success: boolean;
  error: {
    code: string;
    message: string;
  }
};