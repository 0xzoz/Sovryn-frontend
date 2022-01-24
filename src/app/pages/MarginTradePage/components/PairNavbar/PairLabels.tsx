import React from 'react';
import { useTranslation } from 'react-i18next';
import { translations } from 'locales/i18n';
import { IPairs } from 'types/trading-pairs';
import { usePairList } from 'app/hooks/trading/usePairList';
import classNames from 'classnames';

interface IPairLabelsProps {
  pairs: IPairs;
  onChangeCategory: (value: string) => void;
  category: string;
}

export const PairLabels: React.FC<IPairLabelsProps> = ({
  pairs,
  onChangeCategory,
  category,
}) => {
  const { t } = useTranslation();
  //getting a list with currency labels
  const list = usePairList(pairs);
  const ALL = t(translations.spotTradingPage.pairNavbar.all);

  if (!list.length) return null;
  return (
    <>
      {list && (
        <div
          className={classNames(
            'tw-mr-4 tw-cursor-pointer tw-font-semibold tw-transition-opacity hover:tw-text-opacity-75 hover:tw-text-primary',
            {
              'tw-text-primary': category === '',
            },
          )}
          key={ALL}
          onClick={() => onChangeCategory(category !== ALL ? '' : ALL)}
        >
          {ALL}
        </div>
      )}
    </>
  );
};
