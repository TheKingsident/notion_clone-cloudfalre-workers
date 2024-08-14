import OpenAI from 'openai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
	OPEN_AI_KEY: string;
	AI: Ai;
}

const app = new Hono<{ Bindings: Bindings }>();


app.use(
	cors({
		origin: '*',
		allowHeaders: ['Content-Type', 'X-Custom-Header', 'Upgrade-Insecure-Requests'],
		allowMethods: ['GET', 'POST', 'OPTIONS', 'PUT'],
		exposeHeaders: ['Content-Length','X-Kuma-Revision'],
		maxAge: 600,
		credentials: true,
	})
);

app.post('/translateDocument', async (c) => {
	const { documentData, targetLanguage } = await c.req.json();

	const summaryResponse = await c.env.AI.run('@cf/facebook/bart-large-cnn', {
		input_text: documentData,
		max_length: 1000,
	});

	const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
		text: summaryResponse.summary,
		source_lang: 'en',
		target_lang: targetLanguage,
	});

	return new Response(JSON.stringify(response));
});

export default app;