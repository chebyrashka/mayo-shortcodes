import { createLink, listLinks } from '../../../lib/links.js';
import { errorJson, json } from '../../../lib/responses.js';

export async function GET() {
  try {
    return json({
      links: await listLinks()
    });
  } catch (error) {
    return errorJson(error);
  }
}

export async function POST({ request }) {
  try {
    const input = await request.json();
    const link = await createLink(input);

    return json({ link }, { status: 201 });
  } catch (error) {
    return errorJson(error);
  }
}
