import type { APIRoute } from 'astro';
import { robotsTxt, siteEnv } from '../lib/siteEnv';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(siteEnv, site), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
