import { FC } from 'react';

import { useRouter } from 'next/router';

import { AnimeQuery } from '@interfaces/query';

import { ECollection, ELoadingStatus } from '@enums/enums';

import {
  API_ITEMS_LIMIT,
  DEFAULT_YEAR_FOR_QUERY, LOADED_ALL_TITLES, LOAD_MORE, NOT_FOUND_TITLES,
} from '@constants/common';
import { FILTER_MENU_MATCH_MEDIA } from '@constants/matchMedia';
import { ANIME_FILTERS_PAGE_DESCRIPTION, ANIME_FILTERS_PAGE_KEYWORDS, ANIME_FILTERS_PAGE_TITLE } from '@constants/seo';

import {
  fetchFilteredData, getFilterDataState, setFilteredData,
} from '@redux/slices/filteredData';
import {
  setYears, setFilterType, setFilterValuesFromQuery,
} from '@redux/slices/filters';
import { nextReduxWrapper } from '@redux/store';

import Error from '@ui/Error';
import InfiniteLoadMore from '@ui/InfiniteLoadMore';

import FilterCardList from '@components/FilterCardList';
import FilterMenu from '@components/FilterMenu';
import SeoHead from '@components/SeoHead';

import MainLayout from '@layouts/MainLayout';

import { getFilteredData, getYears } from '@services/api/anime';

import useAppDispatch from '@hooks/useAppDispatch';
import useAppSelector from '@hooks/useAppSelector';
import useMatchMedia from '@hooks/useMatchMedia';

import checkObjectValueAndExcludeKey from '@utils/checkObjectValueAndExcludeKey';
import entries from '@utils/entries';

import useFilterPageStyles from '@styles/FilterPage.styles';

const Animes: FC = () => {
  const classes = useFilterPageStyles();
  const {
    filteredData,
    loadingState,
  } = useAppSelector(getFilterDataState);
  const dispatch = useAppDispatch();
  const route = useRouter();
  const dataError = loadingState === ELoadingStatus.error;
  const dataPending = loadingState === ELoadingStatus.pending;
  const { query } = route;
  const {
    years, genres, seasons, voices,
  } = query as unknown as AnimeQuery;

  const loadMoreData = () => {
    dispatch(fetchFilteredData({
      filteredDataType: ECollection.anime,
      loadMore: true,
      params: {
        year: years,
        season_code: seasons,
        genres,
        voice: voices,
        after: `${filteredData.length}`,
        limit: API_ITEMS_LIMIT,
      },
    }));
  };

  const [isMobile] = useMatchMedia(FILTER_MENU_MATCH_MEDIA);

  return (
    <MainLayout full paddings fullHeight>
      <SeoHead
        tabTitle={ANIME_FILTERS_PAGE_TITLE}
        title={ANIME_FILTERS_PAGE_TITLE}
        description={ANIME_FILTERS_PAGE_DESCRIPTION}
        keywords={ANIME_FILTERS_PAGE_KEYWORDS}
      />

      <div className={classes.content}>
        {
          !filteredData.length
            ? <Error errorText={NOT_FOUND_TITLES} />
            : <div className={classes.filterCardListWrapper}>
              <FilterCardList filteredList={filteredData} />

              <InfiniteLoadMore
                isPending={dataPending}
                isError={dataError}
                loadMoreCallback={loadMoreData}
                errorText={LOADED_ALL_TITLES}
                defaultText={LOAD_MORE}
              />
            </div>
        }

        <FilterMenu isDesktopOrBelow={isMobile} />
      </div>
    </MainLayout>
  );
};

export const getServerSideProps = nextReduxWrapper.getServerSideProps(
  (store) => async (
    { query },
  ) => {
    const { filters: { filterType, filterItems } } = store.getState();

    const {
      years, genres, seasons, voices, after = '0',
    } = query as unknown as AnimeQuery;

    const currentCollectionType = ECollection.anime;
    const params = {
      year: years,
      genres,
      voice: voices,
      season_code: seasons,
      after,
    };

    if (filterType === ECollection.manga) {
      store.dispatch(setFilterType(currentCollectionType));
    }

    const currentParams = checkObjectValueAndExcludeKey(query, ['after', 'limit'])
      ? params
      : { ...params, year: DEFAULT_YEAR_FOR_QUERY, after };

    const animesResult = await getFilteredData({
      method: 'searchTitles',
      filters: [
        'id',
        'code',
        'names',
      ],
      params: {
        ...currentParams,
        limit: API_ITEMS_LIMIT,
      },
    }) || [];

    // if i use store.dispatch(fetchFilteredData) doesn't work all the time, i dont know why ( maybe HYDRATE
    if (animesResult.length) {
      store.dispatch(setFilteredData({ data: animesResult }));
    }

    if (!filterItems.years.length) {
      const yearsRes = await getYears();
      store.dispatch(setYears(yearsRes));
    }

    entries({ years, genres, seasons }).forEach(([key, value]) => {
      if (value) {
        const itemsFromQuery = value.split(',');
        store.dispatch(setFilterValuesFromQuery({ key, keyItems: itemsFromQuery }));
      }
    });

    return {
      props: {},
    };
  },
);

export default Animes;