import React from 'react';
import { useTranslation } from 'react-i18next';
import { OrderTypes } from '../../types';
import { translations } from 'locales/i18n';
import cn from 'classnames';

interface Props {
  value: OrderTypes;
  onChange: (value: OrderTypes) => void;
}

export function OrderType({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="tw-flex tw-items-center tw-mt-4 tw-mb-6">
      <div
        className={cn(
          'tw-cursor-pointer tw-py-1.5 tw-px-2.5 tw-rounded-lg tw-bg-gray-7 hover:tw-opacity-100 tw-transition-opacity tw-duration-300 tw-text-sov-white',
          {
            'tw-opacity-25': value !== OrderTypes.MARKET,
          },
        )}
        onClick={() => onChange(OrderTypes.MARKET)}
      >
        {t(translations.spotTradingPage.tradeForm.market)}
      </div>
      <div
        className={cn(
          'tw-cursor-pointer tw-py-1.5 tw-px-2.5 tw-rounded-lg tw-bg-gray-7 hover:tw-opacity-100 tw-transition-opacity tw-duration-300 tw-text-sov-white',
          {
            'tw-opacity-25': value !== OrderTypes.LIMIT,
          },
        )}
        onClick={() => onChange(OrderTypes.LIMIT)}
      >
        {t(translations.spotTradingPage.tradeForm.limit)}
      </div>
    </div>
  );
}
