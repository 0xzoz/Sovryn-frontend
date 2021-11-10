import { AssetSymbolRenderer } from 'app/components/AssetSymbolRenderer';
import { translations } from 'locales/i18n';
import React from 'react';
import { Trans } from 'react-i18next';
import { PerpetualPair } from 'utils/models/perpetual-pair';
import { usePerpetual_RecentTradesTable } from '../../hooks/usePerpetual_RecentTradesTable';
import styles from './index.module.scss';
import { RecentTradesTableRow } from './components/RecentTablesRow/index';

type RecentTradesTableProps = {
  pair: PerpetualPair;
};

export const RecentTradesTable: React.FC<RecentTradesTableProps> = ({
  pair,
}) => {
  const data = usePerpetual_RecentTradesTable();

  return (
    <table className={styles.recentTradesTable}>
      <thead className="tw-bg-black tw-sticky tw-top-0 tw-z-10">
        <tr>
          <th className="tw-h-6 tw-w-4/12 tw-pr-4 tw-pb-1 tw-text-right">
            <Trans
              i18nKey={translations.perpetualPage.recentTrades.price}
              components={[
                <AssetSymbolRenderer assetString={pair.quoteAsset} />,
              ]}
            />
          </th>
          <th className="tw-h-6 tw-w-4/12 tw-pr-4 tw-pb-1 tw-text-right">
            <Trans
              i18nKey={translations.perpetualPage.recentTrades.size}
              components={[
                <AssetSymbolRenderer assetString={pair.baseAsset} />,
              ]}
            />
          </th>
          <th className="tw-h-6 tw-pr-4 tw-pb-1 tw-text-right">
            <Trans
              i18nKey={translations.perpetualPage.recentTrades.time}
              components={[
                <AssetSymbolRenderer assetString={pair.baseAsset} />,
              ]}
            />
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        {data &&
          data.map((item, index) => (
            <RecentTradesTableRow
              key={item.id}
              row={item}
              isOddRow={index % 2 === 0}
            />
          ))}
      </tbody>
    </table>
  );
};
