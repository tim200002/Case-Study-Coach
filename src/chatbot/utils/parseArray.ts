export function parseArrayFromJson<T>(json: any | null) {
  console.log("Here is the json: ", json);
  if (json === null) {
    return [];
  } else {
    const jsonParsed = JSON.parse(json);
    if (Array.isArray(jsonParsed)) {
      return jsonParsed as T[];
    }
  }
  throw new Error("Invalid JSON: " + JSON.stringify(json));
}
