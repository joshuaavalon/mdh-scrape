import { LoggableError } from "#error";


export function extractRegex(regex: RegExp, groupName: string): (input: string) => string {
  return input => {
    const value = regex.exec(input ?? "")?.groups?.[groupName];
    if (!value) {
      throw new LoggableError({ regex, groupName, input }, "Cannot extract value from input with regex");
    }
    return value;
  };
}
