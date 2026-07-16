## Summary

<!-- Brief description of what this PR does -->

## Type of change

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] CI / tooling

## Quality gates passed

- [ ] `npm run format` — no formatting changes required
- [ ] `npm run lint:ci` — 0 errors and 0 warnings
- [ ] `npm run typecheck` — 0 type errors
- [ ] `npm run test:coverage` — tests and thresholds pass
- [ ] `npm run knip` — 0 dead code
- [ ] `npm run db:validate` — schema valid
- [ ] `npm run build` — build succeeds

## Security checklist

- [ ] No secrets / API keys in code
- [ ] No `eval()`, `Function()`, `dangerouslySetInnerHTML` without need
- [ ] No `any` types — use Zod schemas or `unknown` with type guards
- [ ] Server-only code imports `server-only` package
- [ ] API responses validated with Zod at boundary
- [ ] Prisma queries select only fields safe for the caller

## Database changes

- [ ] Schema changes include a committed migration, or this PR does not change the schema
- [ ] Migrations were applied to an empty database

## Notes

<!-- Anything reviewers should know -->
