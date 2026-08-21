import { updateLink } from '../../../lib/links.js';
import { errorJson, json } from '../../../lib/responses.js';

export async function PATCH({ params, request }) {
  try {
    const input = await request.json();
    const link = await updateLink(params.id, input);

    return json({ link });
  } catch (error) {
    return errorJson(error);
  }
}
