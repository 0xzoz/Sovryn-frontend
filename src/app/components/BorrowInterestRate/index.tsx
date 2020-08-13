/**
 *
 * BorrowInterestRate
 *
 */
import React from 'react';
import { Tooltip } from '@blueprintjs/core';
import { Asset } from 'types/asset';
import { useBorrowInterestRate } from 'hooks/borrow/useBorrowInterestRate';
import { LoadableValue } from '../LoadableValue';
import { weiToFixed } from 'utils/blockchain/math-helpers';

interface Props {
  asset: Asset;
  weiAmount: string;
}

export function BorrowInterestRate(props: Props) {
  const { value, loading } = useBorrowInterestRate(
    props.asset,
    props.weiAmount,
  );

  return (
    <div className="mb-2">
      <div>Interest ARP</div>
      <div>
        <LoadableValue
          value={
            <Tooltip content={<>{weiToFixed(value, 18)} %</>}>
              <>{weiToFixed(value, 4)} %</>
            </Tooltip>
          }
          loading={loading}
        />
      </div>
    </div>
  );
}
