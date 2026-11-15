const mailpit = 'http://127.0.0.1:54324/api/v1';

export const clearMail = (email: string) =>
  fetch(`${mailpit}/search?query=${encodeURIComponent(`to:${email}`)}`, { method: 'DELETE' });

export async function latestCode(email: string) {
  for (let attempt = 0; attempt < 40; attempt++) {
    const search = await fetch(`${mailpit}/search?query=${encodeURIComponent(`to:${email}`)}`);
    const { messages } = (await search.json()) as { messages: { ID: string }[] };
    if (messages.length > 0) {
      const message = await fetch(`${mailpit}/message/${messages[0].ID}`);
      const body = (await message.json()) as { Text: string; HTML: string };
      return /\b(\d{6})\b/.exec(body.Text || body.HTML)![1];
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`No email arrived for ${email}`);
}
