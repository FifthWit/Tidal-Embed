# Tidal Embed

Tidal Embed is a simple API written with Hono, and TypeScript.

 Designed for Cloudflare Workers. Meant for redirecting to movie-web urls with the goal of adding Open Graph content so sharing content can look cleaner with actual previews, while still keeping the goal of being lightweight with essientially no serverside code.

# Development

1. Create your enviornment variables with Wrangler CLI, or cloudflare dashboard. For this I'll give the commands for Wrangler:
- `npx wrangler put secret name`
- `npx wrangler put secret TMDB_READ_API_KEY`
- `npx wrangler put secret url`

Your API key will be private and needs to be taken from TMDB. The variables name, and url, will be published, the name will be something like `Sudo-Flix` or `P-Stream` while the url will be the url users are redirected to, with the url scheme being movie-web's so if youuse a custom scheme, you must edit it yourself.

2. To test your work, use an HTTP client like (Thunder Client)[https://thunderclient.com] to see the `<head>` of the document to see data about the open-graph tags, if you are making major changes, you can deploy it, then take the link and link it on a platform like Discord to see if it previews properly

Test with:
```
npm install
npm run dev
```

And to deploy:

```
npm run deploy
```


If you have any changes feel free to fork and pr, I'll make sure to give it a look!