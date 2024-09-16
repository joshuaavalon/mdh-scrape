import { LoggableError } from "#error";

/**
 * Extract value from string by group
 *
 * @param regex `/(?<value>.+)/u`
 * @param groupName value
 * @returns Selected group
 */
export function extractRegex(regex: RegExp, groupName = "value"): (input: string) => string {
  return input => {
    const value = regex.exec(input ?? "")?.groups?.[groupName];
    if (!value) {
      throw new LoggableError({ regex, groupName, input }, "Cannot extract value from input with regex");
    }
    return value;
  };
}
