Add this to the package.json when running an Expo build:

```json
{
  "scripts": {
    "postinstall": "cd ../.. && pnpm build"
  }
}
```

Commands for running a build

```bash
npx cross-env APP_ENV=production eas build -p android --profile production
npx cross-env APP_ENV=preview eas build -p android --profile preview
npx cross-env APP_ENV=development eas build -p android --profile development
```
