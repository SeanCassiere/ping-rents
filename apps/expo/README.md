Add this to the package.json when running an Expo build:

```json
{
  "scripts": {
    "postinstall": "cd ../.. && pnpm build"
  }
}
```
