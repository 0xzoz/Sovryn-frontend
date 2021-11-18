import React, { useEffect, useMemo, useState, useCallback } from 'react';
import cn from 'classnames';
// import { CSSTransition, SwitchTransition } from 'react-transition-group';
import {
  defaultValue,
  DepositContext,
  DepositContextStateType,
  DepositStep,
} from '../contexts/deposit-context';
import { MainScreen } from '../components/Deposit/MainScreen';
import { AddressForm } from '../components/Deposit/AddressForm';

import styles from '../fast-btc-page.module.css';
import { SidebarStepsDeposit } from '../components/Deposit/SidebarStepsDeposit';
import { useDepositSocket } from '../hooks/useDepositSocket';
import { StatusScreen } from '../components/Deposit/StatusScreen';

export const DepositContainer: React.FC = () => {
  const [state, setState] = useState<DepositContextStateType>(defaultValue);
  const { step } = state;

  const handleEvents = useCallback((type: string, value: any) => {
    if (type === 'txAmount') {
      setState(prevState => ({
        ...prevState,
        limits: { ...value, loading: false },
      }));
    }
    if (type === 'depositTx') {
      setState(prevState => ({
        ...prevState,
        depositTx: value,
        step: DepositStep.PROCESSING,
      }));
    }
    if (type === 'transferTx') {
      setState(prevState => ({
        ...prevState,
        transferTx: value,
        step: DepositStep.COMPLETED,
      }));
    }
  }, []);

  const { ready, getDepositAddress, getTxAmount } = useDepositSocket(
    handleEvents,
  );

  const handleAddressRequest = useCallback(
    (address: string) => {
      setState(prevState => ({ ...prevState, addressLoading: true }));
      getDepositAddress(address)
        .then(response => {
          setState(prevState => ({
            ...prevState,
            addressLoading: false,
            address: response.btcadr,
            step: DepositStep.ADDRESS,
          }));
        })
        .catch(error => {
          console.error(error);
          setState(prevState => ({
            ...prevState,
            addressLoading: false,
            address: '',
            addressError: error.message,
          }));
        });
    },
    [getDepositAddress],
  );

  const value = useMemo(
    () => ({
      ...state,
      ready,
      set: setState,
      requestDepositAddress: handleAddressRequest,
    }),
    [state, ready, setState, handleAddressRequest],
  );

  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      limits: { ...prevState.limits, loading: true },
    }));

    if (ready) {
      getTxAmount()
        .then(result => {
          setState(prevState => ({
            ...prevState,
            limits: { ...result, loading: false },
          }));
        })
        .catch(() => {
          setState(prevState => ({
            ...prevState,
            limits: { ...prevState.limits, loading: false },
          }));
        });
    }
  }, [ready, getTxAmount]);

  return (
    <DepositContext.Provider value={value}>
      <div className="tw-flex tw-flex-row tw-justify-between tw-items-center tw-w-full">
        <div
          className={cn(
            'tw-hidden tw-relative tw-z-50 tw-h-full md:tw-flex tw-flex-col tw-items-start tw-justify-center tw-pl-8',
            { invisible: false },
          )}
          style={{ minHeight: 'calc(100vh - 2.5rem)' }}
        >
          <SidebarStepsDeposit />
        </div>
        <div
          style={{
            minHeight: 'calc(100vh - 2.5rem)',
          }}
          className="tw-flex tw-flex-col tw-flex-1 tw-justify-center tw-items-center"
        >
          <div className={styles.container}>
            {/*<SwitchTransition>*/}
            {/*  <CSSTransition*/}
            {/*    key={step}*/}
            {/*    addEndListener={(node, done) =>*/}
            {/*      node.addEventListener('transitionend', done, false)*/}
            {/*    }*/}
            {/*    classNames="fade"*/}
            {/*  >*/}
            {step === DepositStep.MAIN && <MainScreen />}
            {step === DepositStep.ADDRESS && <AddressForm />}
            {[DepositStep.PROCESSING, DepositStep.COMPLETED].includes(step) && (
              <StatusScreen />
            )}
            {/*</CSSTransition>*/}
            {/*</SwitchTransition>*/}
          </div>
        </div>
      </div>
    </DepositContext.Provider>
  );
};