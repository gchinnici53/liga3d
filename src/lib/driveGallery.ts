const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";

export type FotoGaleria = { id: string; nombre: string; thumb: string; full: string };

type ArchivoDrive = { id: string; name: string; thumbnailLink?: string };

// Lee las fotos de la carpeta de Google Drive configurada por variables de
// entorno (GOOGLE_DRIVE_API_KEY, GOOGLE_DRIVE_GALERIA_FOLDER_ID). La carpeta
// debe estar compartida como "Cualquiera con el enlace" para que la API
// funcione sin OAuth. Si falta la configuración, devuelve [] en silencio.
export async function listarFotosGaleria(): Promise<FotoGaleria[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_GALERIA_FOLDER_ID;
  if (!apiKey || !folderId) return [];

  const archivos: ArchivoDrive[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false and mimeType contains 'image/'`,
      key: apiKey,
      fields: "nextPageToken,files(id,name,thumbnailLink)",
      pageSize: "1000",
      orderBy: "name",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) break;

    const data = (await res.json()) as { nextPageToken?: string; files?: ArchivoDrive[] };
    archivos.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return archivos
    .filter((f) => f.thumbnailLink)
    .map((f) => ({
      id: f.id,
      nombre: f.name,
      thumb: f.thumbnailLink!.replace(/=s\d+$/, "=s400"),
      full: f.thumbnailLink!.replace(/=s\d+$/, "=s1600"),
    }));
}
