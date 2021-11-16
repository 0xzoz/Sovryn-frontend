import { contractReader } from 'utils/sovryn/contract-reader';
import { useEffect, useState } from 'react';
import { useCacheCallWithValue } from '../useCacheCallWithValue';
import { ethers, BigNumber } from 'ethers';
import { LimitOrder } from 'app/pages/SpotTradingPage/types';

function orderParser(orderArray: string[], hash: string): LimitOrder {
  const [
    maker,
    fromToken,
    toToken,
    amountIn,
    amountOutMin,
    recipient,
    deadline,
    created,
    v,
    r,
    s,
  ] = orderArray;
  return {
    maker,
    fromToken,
    toToken,
    amountIn: BigNumber.from(amountIn),
    amountOutMin: BigNumber.from(amountOutMin),
    recipient,
    deadline: BigNumber.from(deadline),
    created: BigNumber.from(created),
    v,
    r,
    s,
    hash,
  };
}

export function useGetLimitOrders(
  account: string,
  page: number = 0,
  limit: number = 100,
  isMargin = false,
) {
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const { value: hashes, loading: loadingHashes } = useCacheCallWithValue<
    Array<Array<string>>
  >('orderBook', 'getOrders', [], account, page, limit);

  useEffect(() => {
    const updateResult = async () => {
      const hashesOrders = await contractReader.call<[string]>(
        'orderBook',
        'hashesOfMaker',
        [account, page, limit],
      );

      const list = hashes
        .filter(hash => hash['0'] !== ethers.constants.AddressZero)
        .map((item, i) => orderParser(item, hashesOrders[i]));

      const canceledOrders = await contractReader.call(
        'settlement',
        'checkCanceledHashes',
        [list.map(item => item.hash)],
      );
      const filledOrders = await contractReader.call(
        'settlement',
        'checkFilledAmountHashes',
        [list.map(item => item.hash)],
      );

      list.forEach((item, i) => {
        item.canceled = !!canceledOrders[i]?.canceled;
        item.filledAmount = filledOrders[i]?.amount;
      });
      console.log('list: ', list);
      setOrders(list);
      setLoading(false);
    };

    if (hashes && !loadingHashes) {
      updateResult();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashes, loadingHashes]);

  return {
    value: orders.filter(item => !item.canceled),
    loading: loadingHashes || loading,
  };
}