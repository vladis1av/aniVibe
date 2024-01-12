import { FC, useEffect } from 'react';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useInView } from 'react-intersection-observer';

import useInfiniteLoadMoreStyles from './InfiniteLoadMore.styles';

type InfiniteLoadMoreProps = {
  isPending: boolean;
  isError: boolean;
  loadMore: () => void;
  errorText: string;
  defaultText: string;
};

const InfiniteLoadMore: FC<InfiniteLoadMoreProps> = ({
  isPending,
  isError,
  loadMore,
  errorText,
  defaultText,
}) => {
  const classes = useInfiniteLoadMoreStyles();

  const { inView, ref } = useInView({
    threshold: 0.2,
  });

  useEffect(() => {
    if (inView && !isError && !isPending) {
      loadMore();
    }
  }, [inView]);

  return <div className={classes.buttonWrapper} ref={ref}>
    <Button variant="outlined" onClick={loadMore} disabled={isPending || isError}>
      {
        isError ? errorText : defaultText
      }

      {isPending && (
        <CircularProgress size={20} color="primary" className={classes.loader} />
      )}
    </Button>
  </div>;
};

export default InfiniteLoadMore;
