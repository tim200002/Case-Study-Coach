export function parseArrayFromJson<T>(json: string | null) {
  console.log("Here is the json: ", json);
  if (json === null) {
    return [];
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const jsonParsed = JSON.parse(json);
    if (Array.isArray(jsonParsed)) {
      return jsonParsed as T[];
    }
  }
  throw new Error("Invalid JSON: " + JSON.stringify(json));
}
