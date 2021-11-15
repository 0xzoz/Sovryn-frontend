import React from 'react';
import { Helmet } from 'react-helmet-async';

import { useTranslation } from 'react-i18next';
import { translations } from '../../../locales/i18n';
import UserWallet from '../BridgeDepositPage/components/UserWallet';
import { useAccount } from '../../hooks/useAccount';
import { WithdrawContainer } from './containers/WithdrawContainer';

export function FastBtcPage() {
  const { t } = useTranslation();
  const account = useAccount();

  return (
    <>
      <Helmet>
        <title>{t(translations.fastBtcPage.meta.title)}</title>
        <meta
          name="description"
          content={t(translations.fastBtcPage.meta.description)}
        />
      </Helmet>
      <div
        className="tw-flex tw-flex-row tw-justify-between tw-items-start tw-w-full tw-p-5 tw-bg-gray-4 tw-relative"
        style={{ marginTop: '-4.4rem' }}
      >
        <UserWallet address={account} />
        <WithdrawContainer />
      </div>
    </>
  );
}
