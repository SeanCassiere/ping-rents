# PingRents mobile application

## Build

_Before running a build_, ensure that the following postinstall script is present in the package.json of the app:

```json
{
  "scripts": {
    "postinstall": "cd ../.. && pnpm build"
  }
}
```

Make sure the `postinstall` script is NOT committed to the repository as it will interfere with the building of the server.

To build the app, run one of following commands based on the intended target environment:

```bash
# Development
eas build -p android --profile development

# Preview
eas build -p android --profile preview

# Production
eas build -p android --profile production
```

## Update

```bash
PUBLIC_API_URL="https://pingrents-api.pingstash.com" eas update --branch preview --message "my message"
```
