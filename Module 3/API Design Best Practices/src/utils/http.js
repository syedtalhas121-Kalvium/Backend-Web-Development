function sendData(res, data, status = 200) {
  return res.status(status).json({ data });
}

function sendList(res, data, meta) {
  return res.status(200).json({ data, meta });
}

function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ error });
}

module.exports = {
  sendData,
  sendList,
  sendError
};
