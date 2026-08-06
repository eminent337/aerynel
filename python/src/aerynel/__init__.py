"""Aerynel for Jupyter: the full Aerynel GIS app as an anywidget."""
from .map import Feature, Layer, Map

__all__ = ["Map", "Layer", "Feature"]


def _jupyter_server_extension_points():
    return [{"module": "aerynel"}]
