// Runs on EAS before a build (npm script "eas-build-pre-install"). A preview or production build that still points at
// the placeholder server would install fine and then fail to log anyone in, so it is stopped here instead.
const profile = process.env.EAS_BUILD_PROFILE || '';
const url = (process.env.EXPO_PUBLIC_API_URL || '').trim();

if (profile === 'preview' || profile === 'production') {
  const problems = [];
  if (!url.startsWith('https://')) problems.push('EXPO_PUBLIC_API_URL must start with https://');
  if (/example\.com/.test(url)) problems.push('EXPO_PUBLIC_API_URL still has the placeholder api.example.com: set your real API address in eas.json');
  if (problems.length > 0) {
    console.error(`\nBuild stopped (${profile}):\n - ${problems.join('\n - ')}\n`);
    process.exit(1);
  }
}
