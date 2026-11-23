import { projeStili } from '../temalar/proje-stili';
export const GET = async () => new Response(await projeStili(), { headers: { 'content-type': 'text/css; charset=utf-8' } });
