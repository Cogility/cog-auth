export default function json(status, payload, tokenRequired=true) {
  return function(request) {
    // console.log('@@@@ Request headers: '+JSON.stringify(request.requestHeaders)+' for url: '+request.url);
    if (!tokenRequired || (request.requestHeaders && request.requestHeaders['Authorization'] === "PQC0PaupaLN2/mIN4jZ2aZZ6dlDQFu7XPxWn0GsqAwJ03KMwrOHKM=")) {
      // console.log('@@@@ Responding to request due to acceptable token');
      return [
        status,
        {'Content-Type': 'text/json'},
        JSON.stringify(payload)
      ];
    } else {
      console.log('@@@@ Rejecting request for lack of correct token');
      return [401,
        {'Content-Type': 'text/json'},
        JSON.stringify({"resultCode": -1, "description": "No token provided"})];
    }
  };
}
