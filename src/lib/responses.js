export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers
    }
  });
}

export function errorJson(error) {
  return json(
    {
      error: error.message || 'Something went wrong.'
    },
    {
      status: error.status || 500
    }
  );
}
