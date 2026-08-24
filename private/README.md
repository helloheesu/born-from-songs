# Local-only project material

This directory keeps source material that must remain on the local machine.
Its real contents are ignored by Git; only this guide and the example source-map
schema are tracked.

Public or team-facing documents must not link to files in this directory. They
refer to stable `SRC-*` identifiers from `docs/project/SOURCE_REGISTER.md` and
include a shareable summary that can be understood without the original.

`source-map.local.yml` maps those identifiers to real local files. It is ignored
by Git and must use paths relative to this directory, never machine-specific
absolute paths.

Git ignore rules are not a backup. Keep the source archive in a local backup
such as Time Machine or an encrypted external disk.
