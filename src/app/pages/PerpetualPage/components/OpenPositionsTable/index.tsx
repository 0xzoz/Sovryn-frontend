import React, { useMemo, useState } from 'react';
import { useAccount } from 'app/hooks/useAccount';
import { SkeletonRow } from 'app/components/Skeleton/SkeletonRow';
import { OpenPositionRow } from './OpenPositionRow';
import { PendingPositionRow } from './PendingPositionRow';
import { useTranslation } from 'react-i18next';
import { translations } from '../../../../../locales/i18n';
import { Pagination } from '../../../../components/Pagination';
import { useSelector } from 'react-redux';
import { selectTransactionArray } from 'store/global/transactions-store/selectors';
import { TxStatus, TxType } from 'store/global/transactions-store/types';
import { usePerpetual_OpenPosition } from '../../hooks/usePerpetual_OpenPositions';

interface IOpenPositionsTableProps {
  perPage: number;
}

export function OpenPositionsTable({ perPage }: IOpenPositionsTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const transactions = useSelector(selectTransactionArray);

  const { data, loading } = usePerpetual_OpenPosition(useAccount());

  const items = useMemo(
    () => (data ? data.slice(page * perPage - perPage, page * perPage) : []),
    [perPage, page, data],
  );

  const isEmpty = !loading && !items.length && !transactions.length;

  const onPageChanged = data => {
    setPage(data.currentPage);
  };

  const onGoingTransactions = useMemo(() => {
    return (
      transactions.length > 0 && (
        <>
          {transactions
            .filter(
              tx =>
                tx.type === TxType.PERPETUAL_OPEN &&
                [TxStatus.FAILED, TxStatus.PENDING].includes(tx.status),
            )
            .reverse()
            .map(item => (
              <PendingPositionRow key={item.transactionHash} item={item} />
            ))}
        </>
      )
    );
  }, [transactions]);

  return (
    <>
      <table className="tw-table">
        <thead>
          <tr>
            <th className="tw-w-full">
              {t(translations.perpetualPage.openPositionsTable.pair)}
            </th>
            <th className="tw-w-full tw-hidden xl:tw-table-cell">
              {t(translations.perpetualPage.openPositionsTable.positionSize)}
            </th>
            <th className="tw-w-full tw-hidden xl:tw-table-cell">
              {t(translations.perpetualPage.openPositionsTable.value)}
            </th>
            <th className="tw-w-full tw-hidden md:tw-table-cell">
              {t(translations.perpetualPage.openPositionsTable.entryPrice)}
            </th>
            <th className="tw-w-full tw-hidden xl:tw-table-cell">
              {t(translations.perpetualPage.openPositionsTable.markPrice)}
            </th>
            <th className="tw-w-full tw-hidden sm:tw-table-cell">
              {t(
                translations.perpetualPage.openPositionsTable.liquidationPrice,
              )}
            </th>
            <th className="tw-w-full tw-hidden 2xl:tw-table-cell">
              {t(translations.perpetualPage.openPositionsTable.margin)}
            </th>
            <th className="tw-w-full">
              {t(translations.perpetualPage.openPositionsTable.unrealized)}
            </th>
            <th className="tw-w-full">
              {t(translations.perpetualPage.openPositionsTable.realized)}
            </th>
            <th className="tw-w-full">
              {t(translations.perpetualPage.openPositionsTable.actions)}
            </th>
          </tr>
        </thead>
        <tbody>
          {isEmpty && (
            <tr>
              <td colSpan={99}>{t(translations.openPositionTable.noData)}</td>
            </tr>
          )}
          {onGoingTransactions}

          {loading && (
            <tr>
              <td colSpan={99}>
                <SkeletonRow />
              </td>
            </tr>
          )}

          {items?.map(item => (
            <OpenPositionRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>

      {items.length > 0 && (
        <Pagination
          totalRecords={items.length}
          pageLimit={perPage}
          pageNeighbours={1}
          onChange={onPageChanged}
        />
      )}
    </>
  );
}

OpenPositionsTable.defaultProps = {
  perPage: 5,
};
