import Colors from 'colors'; // eslint-disable-line

Colors.black;

export const log = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (msg: string, ...args: any[]): void => console.log('GSD_CMS'.blue, 'info'.cyan, msg, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (msg: string, ...args: any[]): void => console.log('GSD_CMS'.blue, 'warning'.yellow, msg, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (msg: string, ...args: any[]): void => console.error('GSD_CMS'.blue, 'error'.red, msg, ...args),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  success: (msg: string, ...args: any[]): void => console.log('GSD_CMS'.blue, 'success'.green, msg, ...args),
};
