export function ellipsizeString(str: string, length = 19) {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length - 3) + "...";
}
