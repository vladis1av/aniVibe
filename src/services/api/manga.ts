import axios from 'redaxios';

import { MangaBase, MangaDetail, MangaWithPages } from '@interfaces/manga/manga';
import { MangaResponse, MangaServiceParams } from '@interfaces/manga/service';

import generateQuery from '@utils/api/generateQuery';
import getNextEnv from '@utils/config/getNextEnv';

const { publicRuntimeConfig: { HOST_MANGA_API } } = getNextEnv();

export const getMangaById = async (id: string): Promise<MangaDetail | null> => {
  try {
    const { data } = await axios.get<MangaResponse<MangaDetail | MangaDetail[]>>(
      encodeURI(`${HOST_MANGA_API}getMangaById?id=${id}`),
    );

    // if id === 0 returns array with manga
    if (data?.error || Array.isArray(data.response)) {
      return null;
    }

    return data.response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getMangaChapterById = async (
  mangaId: string,
  chapterId: string,
): Promise<MangaWithPages | null> => {
  try {
    const { data } = await axios.get<MangaResponse<MangaWithPages>>(
      encodeURI(`${HOST_MANGA_API}getMangaChapter?mangaId=${mangaId}&chapterId=${chapterId}`),
    );

    if (data.error) {
      return null;
    }

    return data.response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getMangas = async (params: MangaServiceParams): Promise<MangaResponse<MangaBase[]> | null> => {
  try {
    const query = generateQuery(params);

    const { data } = await axios.get<MangaResponse<MangaBase[]>>(
      encodeURI(`${HOST_MANGA_API}getMangas?${query}`),
    );
    console.error('getMangas HOST_MANGA_API', HOST_MANGA_API);

    return data;
  } catch (error) {
    console.error(error);
    console.error('getMangas catch HOST_MANGA_API', HOST_MANGA_API);
    return null;
  }
};
