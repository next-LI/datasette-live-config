from setuptools import setup
import os

VERSION = "0.6"


def get_long_description():
    with open(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "README.md"),
        encoding="utf8",
    ) as fp:
        return fp.read()


setup(
    name="datasette-config-editor",
    description="Datasette plugin allowing live configuration changes. WIP: Depends on next-LI/datasette branch with live config plugin hook.",
    long_description=get_long_description(),
    long_description_content_type="text/markdown",
    author="Brandon Roberts",
    url="https://github.com/next-LI/datasette-config-editor",
    license="Apache License, Version 2.0",
    version=VERSION,
    packages=["datasette_config_editor"],
    entry_points={"datasette": ["config_editor = datasette_config_editor"]},
    install_requires=[
        "datasette>=0.51",
        "asgi-csrf>=0.7",
        "starlette",
        "aiofiles",
        "python-multipart",
        "sqlite-utils",
        "requests",
        "GitPython>=3.1.14,<4.0",
    ],
    extras_require={
        "test": ["pytest", "pytest-asyncio", "asgiref", "httpx", "asgi-lifespan"]
    },
    package_data={"datasette_config_editor": [
        "static/*",
        "static/jsonform/deps/*",
        "static/jsonform/deps/opt/*",
        "static/jsonform/deps/underscore.js",
        "static/jsonform/deps/jquery.min.js",
        "static/jsonform/deps/opt/*",
        "static/jsonform/lib/*.js",
        "templates/*"
    ]},
)
