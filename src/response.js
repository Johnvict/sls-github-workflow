function send(statusCode, data) {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
}

function error(error) {
  return {
    statusCode: 500,
    body: JSON.stringify({ status: "02", message: error.message }),
  };
}

module.exports = { send, error };
