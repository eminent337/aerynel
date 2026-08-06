// Hosts: web.aerynel.app (and viewer.aerynel.app, the original alias).
//
// This worker proxies the Aerynel web viewer at a clean subdomain by proxying
// to the build already published at aerynel.app/demo (GitHub Pages). See the
// hosting plan in the repo docs for how the domains are wired up.
//
// Both hostnames route to this worker. The viewer build uses relative asset
// paths, so requests map 1:1 regardless of which host they arrive on:
//   {web,viewer}.aerynel.app/<path>?<query> -> aerynel.app/demo/<path>?<query>
//
// Origin redirects (e.g. trailing slash) are followed server-side so the
// public hostname is preserved.

const ORIGIN = "https://aerynel.app/demo";

interface Env {}

export default {
  async fetch(request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const target = `${ORIGIN}${url.pathname}${url.search}`;

    // Drop credential headers a public static-asset proxy never needs; keep the
    // rest (e.g. Range, Accept-Encoding) so large-asset requests work.
    const headers = new Headers(request.headers);
    headers.delete("cookie");
    headers.delete("authorization");

    // Follow origin redirects (e.g. trailing slash) server-side to preserve the
    // public URL. This assumes aerynel.app/demo never redirects back to a
    // viewer host, which would otherwise make the worker loop on itself.
    try {
      return await fetch(target, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
        redirect: "follow",
      });
    } catch {
      return new Response("Bad Gateway", { status: 502 });
    }
  },
};
