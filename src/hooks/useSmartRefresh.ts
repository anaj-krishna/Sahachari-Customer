import { useCallback, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
} from "react-native";

export const useSmartRefresh = (
  refreshFn: () => Promise<void> | void
) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.resolve(refreshFn());
    } finally {
      setRefreshing(false);
    }
  }, [refreshFn]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      // 0 ya thoda sa negative -> top pe ho
      setIsAtTop(offsetY <= 0);
    },
    []
  );

  const getRefreshControlProps = (): RefreshControlProps => ({
    refreshing,
    onRefresh,
    enabled: isAtTop, // sirf top pe hone par pull-to-refresh chalega
  });

  return {
    refreshing,
    isAtTop,
    onRefresh,
    onScroll,
    getRefreshControlProps,
  };
};