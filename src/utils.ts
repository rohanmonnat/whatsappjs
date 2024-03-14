export const isFetchDefined = () => {
  return typeof fetch === 'function';
};

export const isString = (value: any) => {
  return typeof value === 'string';
};

export const isUndefined = (value: any) => {
  return typeof value === 'undefined';
};

export const isFunction = (value: any) => {
  return typeof value === 'function';
};
