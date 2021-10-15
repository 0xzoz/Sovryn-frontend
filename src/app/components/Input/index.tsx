import { HTMLInputProps } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import styles from './index.module.scss';

type IInputProps = Partial<
  Pick<
    HTMLInputProps,
    'value' | 'type' | 'placeholder' | 'min' | 'max' | 'step'
  >
> & {
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  dataActionId?: string;
  onChange: (value: string) => void;
};

export const Input: React.FC<IInputProps> = ({
  className,
  type,
  step,
  dataActionId,
  onChange,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onChangeWrapper = useCallback(event => onChange(event.target.value), [
    onChange,
  ]);

  const onStepUp = useCallback(event => inputRef.current?.stepUp(), []);
  const onStepDown = useCallback(event => inputRef.current?.stepDown(), []);

  return (
    <div className={classNames('tw-relative', className)}>
      <input
        ref={inputRef}
        className={styles.input}
        type={type}
        step={step}
        data-action-id={dataActionId}
        onChange={onChangeWrapper}
        {...rest}
      />
      {type === 'number' && step && (
        <>
          <button
            className={classNames(styles.stepButton, styles.up)}
            onClick={onStepUp}
          >
            <span />
          </button>
          <button
            className={classNames(styles.stepButton, styles.down)}
            onClick={onStepDown}
          >
            <span />
          </button>
        </>
      )}
    </div>
  );
};