"""A Jupyter Server extension that serves the bundled Aerynel web app.

The widget renders the full Aerynel single-page app inside an ``<iframe>``. On
remote deployments (JupyterHub and managed/shared hubs) the browser cannot reach
the kernel's ``localhost``, and raw-port proxying via ``jupyter-server-proxy`` is
frequently unavailable or disabled. This extension sidesteps both problems by
serving the bundled app from the Jupyter Server's own origin at
``{base_url}aerynel/app/`` -- the same authenticated origin that serves the
notebook, so it is reachable wherever the notebook itself is.

The files served here are only the static app bundle (the same public app
published at aerynel.app); no notebook or project data passes through this
route. Project state is exchanged separately over ``window.postMessage`` between
the kernel and the iframe. The bundle is therefore served without per-request
authentication, matching how Jupyter serves its own static assets.

The extension auto-enables on install via the
``etc/jupyter/jupyter_server_config.d/aerynel.json`` drop-in shipped in the
wheel; the package-level ``_jupyter_server_extension_points`` /
``_load_jupyter_server_extension`` hooks (in ``aerynel/__init__.py``) delegate
to :func:`load_jupyter_server_extension` below.

Note: tornado is imported lazily inside :func:`load_jupyter_server_extension`
(not at module load) so this module can be imported -- and the package tested --
without tornado installed. tornado is always present wherever a Jupyter Server
actually runs the extension.
"""

from __future__ import annotations

import pathlib
from typing import Any

# Mount point under the Jupyter Server base URL. Kept in sync with the front-end
# (_frontend.js), which loads "{base_url}aerynel/app/index.html".
APP_ROUTE = "aerynel/app"

_HERE = pathlib.Path(__file__).parent
_STATIC_APP = _HERE / "static" / "app"


def load_jupyter_server_extension(serverapp: Any) -> None:
    """Register the static-app route on a running Jupyter Server."""
    import mimetypes
    from tornado.web import StaticFileHandler
    from tornado.web import url_path_join

    # Guarantee the WebAssembly MIME type. The bundled app loads DuckDB-WASM
    # (and others) via WebAssembly.instantiateStreaming, which requires an
    # `application/wasm` Content-Type -- and the nosniff header below makes the
    # browser enforce it strictly. Python 3.11+ ships this mapping, but a host
    # whose mimetypes DB overrides it would otherwise serve `.wasm` as
    # octet-stream and break spatial queries.
    mimetypes.add_type("application/wasm", ".wasm")

    class _AppStaticHandler(StaticFileHandler):
        """Serve the bundled app's static files."""

        def set_default_headers(self) -> None:
            super().set_default_headers()
            self.set_header("X-Content-Type-Options", "nosniff")

    web_app = serverapp.web_app
    base_url = web_app.settings["base_url"]
    route = url_path_join(base_url, APP_ROUTE, "(.*)")
    # Match ensure_bundle()'s index.html check (not a bare is_dir) so an empty
    # bundle dir reports as missing rather than logging a misleading success.
    bundle_present = (_STATIC_APP / "index.html").is_file()
    web_app.add_handlers(".*$", [(route, _AppStaticHandler, {"path": str(_STATIC_APP)})])
    if bundle_present:
        serverapp.log.info("[aerynel] Serving the bundled app at %s%s/", base_url, APP_ROUTE)
    else:
        # A wheel built/installed without running the JS build (e.g. a dev
        # checkout) would otherwise 404 on every request with no explanation.
        # Emit only this warning (not the "Serving ..." line) so the log is clear.
        serverapp.log.warning(
            "[aerynel] Bundled app not found at %s; the %s/ route will return "
            "404. Reinstall the aerynel wheel or run `npm run build:embed`.",
            _STATIC_APP,
            APP_ROUTE,
        )
