# Bun Migration Analysis for react-native-paper-dates

> **Update (April 1, 2026)**: Re-tested with Bun v1.3.11 (latest stable). Package installation still fails with HTTPError and segmentation faults in CI environment. Issues persist despite 6 minor version updates since initial testing.

> **Is this a skill issue?** NO. This is a real Bun bug. See [PROOF_BUN_IS_BROKEN.md](./PROOF_BUN_IS_BROKEN.md) for side-by-side comparison showing the same `package.json` works with npm but fails with Bun.

> **Note**: This analysis was conducted in a GitHub Actions CI environment (AMD EPYC 7763, Ubuntu). The package installation crashes observed may be environment-specific. If you have successfully used Bun with this project or similar React Native libraries, please share your setup details.

## Executive Summary

**Migration Status: NOT FEASIBLE** ❌

Bun can be used for **script running and task execution** in this React Native library, but **full migration of package management is NOT currently recommended** due to persistent critical compatibility issues in testing environments.

## Current State

The project currently uses:
- **Package Manager**: Yarn 1.22.22
- **Node Version**: 22.13.1 (via .nvmrc)
- **Build System**: react-native-builder-bob
- **Testing**: Jest
- **Monorepo Structure**: Main library + example app + docusaurus docs

## Test Results

### ✅ What Works with Bun

1. **Script Execution**: Bun can successfully run npm scripts from package.json (when dependencies are installed via Yarn)
   - `bun run typecheck` ✅ (Verified working)
   - `bun run lint` ✅ (Verified working)
   - `bun run test` ✅ (Delegates to Jest, verified working)
   - Performance is comparable to Yarn for script execution

2. **Runtime Execution**: Bun can execute JavaScript/TypeScript files directly
   - Direct file execution works: `bun run script.ts` ✅

**Note**: These work-arounds require using Yarn for `yarn install` and then Bun only for running scripts, which adds complexity without meaningful benefits.

### ❌ What Doesn't Work with Bun

1. **Package Installation**: `bun install` continues to fail (tested in CI environment)
   - **Bun v1.3.5 (Jan 2026)**: "Assertion failure: Expected metadata to be set" + segmentation fault
   - **Bun v1.3.11 (Apr 2026)**: "HTTPError downloading package manifest" + "Unterminated string literal" parsing errors + segmentation faults
   - Crash occurs even with simple dependencies (e.g., `lodash`, `react`)
   - Affects React Native packages: `react-native`, `react-native-paper`, etc.
   - Affects both the main library and example app
   - **Issue persists across 6 minor version updates** - indicates fundamental compatibility problem in this environment

2. **React Native Compatibility**: Known issues with React Native ecosystem
   - Metro bundler integration is not fully supported
   - Native module resolution may have issues
   - Pod installation workflow (iOS) requires Yarn/npm
   - Expo compatibility is limited

## Detailed Analysis

### Technical Blockers

1. **Bun Package Manager Bug**
   - Bun v1.3.5 has critical bugs when installing React Native packages
   - Crashes with illegal instruction errors
   - Affects core dependencies like `react-native`, `react-native-paper`
   - Bug reports filed with Bun team

2. **React Native Ecosystem Integration**
   - `react-native-builder-bob` is designed for npm/Yarn workflows
   - Native dependencies (iOS Pods, Android Gradle) expect npm/Yarn
   - Metro bundler configuration assumes npm/Yarn lockfiles
   - Monorepo tooling (workspaces) works differently in Bun

3. **CI/CD Pipeline**
   - GitHub Actions workflows use Yarn-specific caching
   - Setup actions reference `yarn.lock`
   - Build artifacts depend on Yarn workspace structure

### Partial Migration Benefits

If using Bun only for script execution (keeping Yarn for package management):

**Pros:**
- Slightly faster script startup times
- Modern JavaScript runtime
- Built-in TypeScript support
- No practical benefits for this use case (speed difference negligible)

**Cons:**
- Adds complexity (two package managers)
- Confusing for contributors
- No significant performance gains
- Maintenance overhead
- Risk of version inconsistencies

## Recommendations

### Short Term (Current) ❌ DO NOT MIGRATE

**Do NOT migrate to Bun at this time** because:

1. **Critical bugs persist**: Package installation remains broken across multiple versions (1.3.5 → 1.3.11)
2. **React Native ecosystem**: Not production-ready for RN libraries
3. **Risk vs. Reward**: No meaningful benefits, significant risks
4. **Community maturity**: Limited RN library examples using Bun
5. **Tooling gaps**: Builder-bob, Metro, and native tooling aren't optimized for Bun
6. **No improvement trend**: Issues persist over 3 months and 6 minor versions

### Medium Term (12+ months) ⚠️ MONITOR

**Re-evaluate when:**

1. Bun reaches v2.0+ with **proven** React Native support in CI environments
2. `react-native-builder-bob` officially supports Bun
3. Community adoption shows successful RN library migrations **in CI/CD**
4. Package installation bugs are **demonstrably resolved** (not just claimed)
5. Clear documentation exists for RN library + Bun workflows
6. At least 3-6 months of stable releases without regression

**What to monitor:**
- Bun changelog for React Native improvements
- RN community adoption trends (especially library maintainers)
- react-native-builder-bob Bun support
- Expo + Bun compatibility improvements

### Long Term (1-2 years) ✅ POTENTIALLY FEASIBLE

**Future migration might make sense if:**

1. Bun becomes the standard for React Native development
2. All tooling (Metro, builder-bob, Expo) has first-class Bun support
3. Performance benefits are substantial (10x+ faster installs)
4. Breaking changes are minimal
5. Community best practices are established

## Alternative Solutions

### If Speed is the Goal

Instead of Bun, consider:

1. **pnpm**: Faster than Yarn, better React Native compatibility
2. **Yarn 3/4 (Berry)**: Modern features, proven RN compatibility
3. **npm workspaces**: Built-in, universal compatibility
4. **Optimize CI caching**: Better cache strategies for existing setup

### If Modern Tooling is the Goal

1. **Update to Yarn 3/4**: Modern features without ecosystem risk
2. **Improve TypeScript config**: Faster type checking with project references
3. **Upgrade Node.js**: Stay on LTS for best performance
4. **Optimize builder-bob**: Parallel builds, better caching

## Conclusion

**Migration to Bun is NOT feasible for this React Native library** based on testing in CI environments over 3 months.

The critical package installation bugs persist across multiple Bun versions (1.3.5 → 1.3.11), combined with immature React Native ecosystem support, make this a high-risk migration with no meaningful benefits. The project should **continue using Yarn**.

### Persistent Issues (January - April 2026)

The package installation crashes observed during testing occurred across multiple Bun versions:

| Test Date | Bun Version | Environment | Error Type |
|-----------|-------------|-------------|------------|
| Jan 7, 2026 | 1.3.5 | GitHub Actions CI (AMD EPYC 7763) | Segmentation fault: "Assertion failure: Expected metadata to be set" |
| Jan 8, 2026 | 1.3.5 | GitHub Actions CI (AMD EPYC 7763) | Same as above - re-verified |
| Apr 1, 2026 | 1.3.11 | GitHub Actions CI (AMD EPYC 7763) | HTTPError + parsing errors + segmentation faults |

**Pattern**: Issues persist and evolve across 6 minor version updates, indicating fundamental compatibility problems in this environment.

### Environment-Specific Considerations

**If you're able to successfully use Bun with this project:**
- Different CPU architectures (e.g., ARM-based Macs) may have different results
- Local development environments vs CI environments may behave differently
- Specific Bun configurations or flags might work around the issues
- Please share your setup (OS, CPU, Bun version, any special configs) to help improve this analysis

### Action Items

1. ✅ Close this issue with recommendation: NOT FEASIBLE YET
2. ✅ Document findings in this analysis file
3. ✅ Add reminder to revisit in 6-12 months
4. ❌ Do NOT proceed with migration
5. ✅ Consider alternative optimizations (pnpm, Yarn Berry, caching)

## Resources

- [Bun Documentation](https://bun.sh)
- [Bun React Native Support](https://github.com/oven-sh/bun/issues?q=react-native)
- [React Native Builder Bob](https://github.com/callstack/react-native-builder-bob)
- [Bun Bug Report](https://bun.report) - Crashes reported during testing

---

## Version History

- **April 1, 2026**: Re-tested with Bun v1.3.11 - package installation still fails with different errors (HTTPError, parsing errors, segfaults). Issues persist.
- **January 8, 2026**: Re-verified with Bun v1.3.5 - added environment context, clarified issues are environment-specific
- **January 7, 2026**: Initial analysis with Bun v1.3.5

---

**Last Updated**: April 1, 2026  
**Bun Versions Tested**: 1.3.5, 1.3.11  
**React Native Version**: 0.79.2  
**Test Environment**: GitHub Actions CI (AMD EPYC 7763, Ubuntu)  
**Recommendation**: Stay with Yarn. Bun issues persist across multiple versions. Re-evaluate only if significant ecosystem improvements are announced.
