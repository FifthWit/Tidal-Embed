import { Hono } from 'hono';

type Bindings = {
    SECRET_KEY: string
  }

const app = new Hono<{ Bindings: Bindings}>();



// Helper function to fetch media details
async function fetchMediaDetails(
  mediaType: 'movie' | 'tv',
  tmdbId: string | number,
  apiKey: string
): Promise<any> {
  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch media details: ${error.message}`);
  }
}

// Home route
app.get('/', (c) => {
  return c.json({
    message:
      'Visit /share/tmdb/:id for movies or /share/tmdb/:id/:season/:episode for TV shows',
    contribute: 'https://github.com/FifthWit/Tidal-Embed',
  });
});

// TMDB share route
app.get('/share/tmdb/:id/:season?/:episode?', async (c) => {
  try {
    const id = c.req.param('id');
    const season = c.req.param('season');
    const episode = c.req.param('episode');
    const apiKey = c.env.TMDB_READ_API_KEY;
    const name = c.env.name;
    const serviceUrl = c.env.url;
    console.log(apiKey)

    if ((season && !episode) || (!season && episode)) {
      return c.json(
        {
          error: 'Both season and episode must be provided together or not at all.',
        },
        400
      );
    }

    const mediaType = season && episode ? 'tv' : 'movie';
    const response = await fetchMediaDetails(mediaType, id, apiKey);

    // Validate response content
    const title = mediaType === 'movie' ? response.title : response.name;
    const description = response.overview || 'No description available.';
    const image = response.poster_path
      ? `https://image.tmdb.org/t/p/w500${response.poster_path}`
      : 'https://example.com/default-image.jpg';
    const url =
      mediaType === 'movie'
        ? `https://example.com/movie/${id}`
        : `https://example.com/tv/${id}/season/${season}/episode/${episode}`;

    let seasonData;
    if (mediaType == 'tv') {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?language=en-US`, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${apiKey}`
            }
        })
        let responseJson = await response.json()
        seasonData = responseJson
    }

    let creators = ''
    for (let i = 0; i < response.created_by.length; i++) {
        creators += response.created_by[i].name;
        if (i < response.created_by.length - 1) {
            creators += ', ';
        } else {
            creators += ' & ';
        }
    }

    // llm ahhhh code below
    const formattedTitle = title.toLowerCase().replace(/\s+/g, '-');
    return c.html(
      `
      <head>
        <meta property="og:title" content="Watch ${title} S${season}E${episode} on ${name}" />
        <meta property="og:description" content="${description} By ${creators}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:url" content="${serviceUrl}" />
        <meta property="og:type" content="video" />
        <body>Redirecting...</body>
        <script>
          setTimeout(function() {
            window.location.href = "${mediaType === 'tv' ? `${serviceUrl}/media/tmdb-tv-${id}-${formattedTitle}/${seasonData.id}/${seasonData.episodes[episode-1].id}` : `${serviceUrl}/media/tmdb-movie-${id}-${formattedTitle}`}";
          }, 500);
        </script>
      </head>
    `
    );
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Export the worker with env support
export default {
  fetch: app.fetch.bind(app),
};
