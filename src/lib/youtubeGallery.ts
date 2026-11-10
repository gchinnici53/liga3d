const YOUTUBE_PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

export type VideoGaleria = { id: string; titulo: string; miniatura: string };

type ItemPlaylist = {
  snippet?: {
    title?: string;
    resourceId?: { videoId?: string };
    thumbnails?: {
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

// Lee los videos de la playlist de YouTube configurada por variables de
// entorno (YOUTUBE_API_KEY, YOUTUBE_PLAYLIST_ID). Si falta la configuración,
// devuelve [] en silencio.
export async function listarVideosGaleria(): Promise<VideoGaleria[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
  if (!apiKey || !playlistId) return [];

  const videos: VideoGaleria[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet",
      playlistId,
      maxResults: "50",
      key: apiKey,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`${YOUTUBE_PLAYLIST_ITEMS_URL}?${params.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;

    const data = (await res.json()) as { nextPageToken?: string; items?: ItemPlaylist[] };
    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      videos.push({
        id: videoId,
        titulo: item.snippet?.title ?? "Video",
        miniatura: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? "",
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}
