# Migration Steps for Docs App

This document outlines the steps to replace the Next.js docs app with the Vite-based docs app.

## Migration Steps

1. Backup the existing docs app:
```bash
mv apps/docs apps/docs-nextjs-backup
```

2. Rename the Vite docs app to replace the original:
```bash
mv apps/docs-vite apps/docs
```

3. Update any references in the monorepo configuration if needed.

4. Test the new docs app:
```bash 
cd apps/docs
npm install
npm run dev
```

5. Verify everything works correctly before committing the changes.

## Rollback Plan

If issues occur, you can revert to the original Next.js app:
```bash
mv apps/docs apps/docs-vite-failed
mv apps/docs-nextjs-backup apps/docs
```

## Post-Migration Tasks

1. Once the migration is confirmed successful, you can remove the backup:
```bash
rm -rf apps/docs-nextjs-backup
```

2. Update any documentation that references the Next.js app to reflect the Vite-based implementation.
