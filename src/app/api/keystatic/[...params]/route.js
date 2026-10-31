import { makeRouteHandler } from '@keystatic/next/route-handler';
import { panelEnabled } from '@/lib/keystatic';
import config from '../../../../../keystatic.config';

const handlers = makeRouteHandler({ config });
const disabled = () => new Response('Not Found', { status: 404 });

export const GET = panelEnabled ? handlers.GET : disabled;
export const POST = panelEnabled ? handlers.POST : disabled;
