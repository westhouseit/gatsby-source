import Colors from 'colors'; // eslint-disable-line

Colors.black;

export const log = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (msg: string, ...args: any[]): void => console.log('info'.cyan, msg, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (msg: string, ...args: any[]): void => console.log('warning'.yellow, msg, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (msg: string, ...args: any[]): void => console.error('error'.red, msg, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  success: (msg: string, ...args: any[]): void => console.log('success'.green, msg, ...args),
};
