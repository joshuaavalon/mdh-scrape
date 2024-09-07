export function selectRegexValue(regex: RegExp, selected: string): string {
  const value = regex.exec(selected ?? "")?.groups?.value;
  if (!value) {
    throw new Error("Cannot select regex value");
  }
  return value;
}
