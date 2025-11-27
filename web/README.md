## Agentic Test Playground

Agentic Test Playground is a browser-based harness for running quick logic checks. It ships with ready-made assertions and a configurable expression runner so you can experiment without leaving the page.

### Local development

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the playground.

### Quality gates

```bash
npm run lint
npm run build
```

Linting enforces code style, and the build command guarantees the site is deployable.

### Deployment

Deploy straight to Vercel once checks pass:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-4b53a517
```

After deploy completes, verify the production URL:

```bash
curl https://agentic-4b53a517.vercel.app
```
