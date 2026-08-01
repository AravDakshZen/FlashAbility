This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Self-host on a Raspberry Pi

This project builds to a fully static export (`out/`) plus a tiny, zero-dependency
Node web server (`deploy/serve.mjs`). You can run it on a Raspberry Pi (or any
device with Node.js ≥ 18) with no database and no npm install on-device — the
browser does all rendering, so no screen is needed on the Pi itself.

### Build once (on your dev machine)

```bash
npm run build          # static export -> out/
node scripts/deploy.mjs --gzip   # optional: pre-compress for faster transfer
```

`scripts/deploy.mjs` flags:
- `--build` — run `next build`
- `--gzip` — create `.gz` variants (served automatically when the client accepts gzip)
- `--all` (or no flags) — both of the above
- `--clean` — remove all generated `.gz` files

### Copy to the Pi

Copy the whole repo (or just `out/` + `deploy/serve.mjs`) to the Pi, e.g.:

```bash
rsync -av --exclude node_modules --exclude .next ./ pi@<pi-ip>:~/flashability/
```

### Run the server on the Pi

```bash
node deploy/serve.mjs          # serves ./out on port 8080
PORT=80 node deploy/serve.mjs  # port 80 (needs root or caps)
```

Open `http://<pi-ip>:8080/` from any phone/tablet/PC on the same network.

### Autostart with systemd

Create `/etc/systemd/system/flashability.service`:

```ini
[Unit]
Description=FlashAbility static server
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/flashability
ExecStart=/usr/bin/node deploy/serve.mjs 8080
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now flashability
```

