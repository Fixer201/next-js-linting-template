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

- [ ] `npm run lint` — 0 errors
- [ ] `npm run typecheck` — 0 type errors
- [ ] `npm run knip` — 0 dead code
- [ ] `npm run db:validate` — schema valid (if Prisma changed)
- [ ] `npm run build` — build succeeds

## Security checklist

- [ ] No secrets / API keys in code
- [ ] No `eval()`, `Function()`, `dangerouslySetInnerHTML` without need
- [ ] No `any` types — use Zod schemas or `unknown` with type guards
- [ ] Server-only code imports `server-only` package
- [ ] API responses validated with Zod at boundary

## Notes

<!-- Anything reviewers should know -->
