import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import Head from 'next/dist/shared/lib/head';
import { GetStaticProps, GetStaticPaths } from 'next';
import { CardMedia, Container, Card } from '@material-ui/core';

import { IAnimeItem } from '@interfaces/interfaces';
import MainLayout from '@layouts/MainLayout';
import animeApi from '@services/api/anime';
import ReadMore from '@components/ReadMore';
import VideoPlayer from '@components/VideoPlayer';
import TableBlock from '@components/Table';
import GET_DETAIL_ANIME_INFO from '@services/queries/getDetailAnimeInfo';
import apolloClient from '@services/apolloClient';
import { SEO_ANIME_DETAIL_PAGE_TITLE } from 'constants/seo';
import styles from './AnimeDetail.module.scss';

type AnimePageProps = {
  fetchedItem: IAnimeItem;
};

export default function Anime({ fetchedItem }: AnimePageProps) {
  const [item, setItem] = useState<IAnimeItem>(fetchedItem);
  const router = useRouter();
  const { id } = router.query;
  const {
    id: animeId,
    names,
    description,
    banner_image: bannerImageHightQuality = null,
    type: { full_string: fullString = '' },
    player: { alternative_player: alternativePlayer },
    torrents,
    season,
    team,
    genres,
  } = item;

  const bannerImageLowQuality = `${process.env.IMAGE_URL}${animeId}.jpg`;

  useEffect(() => {
    setItem(fetchedItem);
    return () => {
      setItem(null);
    };
  }, [id]);

  return (
    <MainLayout clear>
      <Head>
        <title>{`${names.ru} - ${SEO_ANIME_DETAIL_PAGE_TITLE}`}</title>
        <meta
          property="og:title"
          content={names.ru}
        />
        <meta
          property="og:description"
          content={description}
        />
        <meta
          content={`${names.ru} - ${SEO_ANIME_DETAIL_PAGE_TITLE}`}
          property="og:title"
        />
      </Head>

      <div>
        <CardMedia
          component="img"
          height="300"
          image={
            `${!bannerImageHightQuality
              ? bannerImageLowQuality
              : bannerImageHightQuality}`
          }
          title={`${names.ru}`}
        />
      </div>

      <Container classes={{ root: styles.detailContent }}>
        <div className={styles.posterWrapper}>
          <Card classes={{ root: styles.poster }} variant="outlined">
            <CardMedia
              component="img"
              height="200"
              image={bannerImageLowQuality}
              title={`${names.ru}`}
            />
          </Card>

          <div className={styles.posterInfo}>
            <h1>{names.ru}</h1>

            <ul>
              <li>
                Вид релиза:
                <span className={styles.itemKey}>{fullString}</span>
              </li>

              <li>
                Сезон:
                <span
                  className={
                    styles.itemKey
                  }>{`${season.string} ${season.year}`}</span>
              </li>

              <li>
                Озвучка:
                <span className={styles.itemKey}>
                  {team.voice.join(', ')}
                </span>
              </li>

              <li>
                Жанры:
                <span className={styles.itemKey}>{genres.join(', ')}</span>
              </li>

              <li>
                Описание: <ReadMore text={description} />
              </li>
            </ul>
          </div>
        </div>

        <VideoPlayer alternativePlayer={alternativePlayer} />

        <div className="pb-50">
          <TableBlock list={torrents.list} />
        </div>
      </Container>
    </MainLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  //хз как по другому решить что бы все приложение не крашилось иза того что некоторых тайтлов нет в апи которую я использую для того что бы взять  bannerImage...
  const { id } = params;

  const fetchedItem = await animeApi.getAnimeById(id);

  try {
    const { data } = await apolloClient.query({
      query: GET_DETAIL_ANIME_INFO,
      variables: { search: `${id}` },
    });

    return {
      props: {
        fetchedItem: {
          ...fetchedItem,
          banner_image: data.Media.bannerImage,
        },
      },
      revalidate: 60,
    };
  } catch (error) {
    console.log(error);
    return {
      props: {
        fetchedItem: {
          ...fetchedItem,
          banner_image: null,
        },
      },
      revalidate: 60,
    };
  }
};
