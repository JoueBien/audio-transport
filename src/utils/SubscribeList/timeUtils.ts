/** Get a time in the fuiture using milloseconds.*/
export function nowPlusMS(ms: number) {
  return new Date().getTime() + ms;
}

/** Get a time in the fuiture using seconds.*/
export function nowPlusSec(seconds: number) {
  return new Date().getTime() + seconds * 1000;
}
