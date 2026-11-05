# Own Goal amendment

Implemented from locally recorded origin/main c7e6b8b3db4a9a3057522a6c81952ea40ae6f1ee in an isolated source copy. Existing checkouts and scout data were left intact.

- Page 2 replaces Treatment with Own Goal (OG) for outfield players and goalkeepers, including GK Only.
- Saving retains the responsible player/team and awards exactly one goal to the opponent.
- Timeline, backup/restore and structured exports retain the Own Goal event.
- Historic Treatment events remain supported.
- Existing goalkeeper Goal outcomes retain their opposing-team score behaviour.

Validation: 102 automated tests passed, including actual UI rendering/save/reload, both team sides, outfield/GK scoring, backup/export and attribution correction. Static production build passed.

Release candidate build 2026.10.25.1 updates the service-worker cache. Production deployment and physical-device visual acceptance remain outstanding. Rollback source: c7e6b8b3db4a9a3057522a6c81952ea40ae6f1ee.

The source and tests are committed separately from unrelated app work.
