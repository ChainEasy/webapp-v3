import { Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquiditySingleInfoBox } from './AddLiquiditySingleInfoBox';
import { AddLiquiditySingleSelectPool } from './AddLiquiditySingleSelectPool';
import { AddLiquiditySingleSpaceAvailable } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleSpaceAvailable';
import { useAppSelector } from 'redux/index';
import { AddLiquiditySingleAmount } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleAmount';
import { useCallback, useState } from 'react';
import { useApproveModal } from 'hooks/useApproveModal';
import { AddLiquiditySingleCTA } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleCTA';
import { useDispatch } from 'react-redux';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { getTokenById } from 'redux/bancor/bancor';
import {
  addLiquidityV2Single,
  addLiquidityV3Single,
} from 'services/web3/liquidity/liquidity';
import {
  addLiquiditySingleFailedNotification,
  addLiquiditySingleNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { useNavigation } from 'services/router';
import { ApprovalContract } from 'services/web3/approval';
import {
  ConversionEvents,
  sendLiquidityApprovedEvent,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from 'services/api/googleTagManager';
import { useWeb3React } from '@web3-react/core';
import { Pool } from 'services/observables/v3/pools';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  const { chainId } = useWeb3React();
  const dispatch = useDispatch();
  const tkn = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, pool.reserves[0].address)
  );
  const bnt = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, pool.reserves[1].address)
  );
  const { pushPortfolio, pushPools, pushLiquidityError } = useNavigation();
  const [isBNTSelected, setIsBNTSelected] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [spaceAvailableBnt, setSpaceAvailableBnt] = useState('');
  const [spaceAvailableTkn, setSpaceAvailableTkn] = useState('');
  const fiatToggle = useAppSelector<boolean>((state) => state.user.usdToggle);

  const selectedToken = isBNTSelected ? bnt! : tkn!;
  const setSelectedToken = useCallback(
    (token: Token) => {
      const isBNT = token.address === bnt!.address;
      setIsBNTSelected(isBNT);
    },
    [bnt]
  );

  const handleAmountChange = (amount: string, tkn?: Token) => {
    setAmount(amount);
    const usdAmount = new BigNumber(amount)
      .times(tkn ? tkn.usdPrice! : selectedToken.usdPrice!)
      .toString();
    setAmountUsd(usdAmount);
  };

  const addV3Protection = async () => {
    await addLiquidityV3Single();
  };
  const addV2Protection = async () => {
    const cleanAmount = prettifyNumber(amount);
    let transactionId: string;
    await addLiquidityV2Single(
      pool,
      selectedToken,
      amount,
      (txHash: string) => {
        transactionId = txHash;
        addLiquiditySingleNotification(
          dispatch,
          txHash,
          cleanAmount,
          selectedToken.symbol,
          pool.name
        );
      },
      () => {
        sendLiquiditySuccessEvent(transactionId);
        if (window.location.pathname.includes(pool.pool_dlt_id))
          pushPortfolio();
      },
      () => {
        sendLiquidityFailEvent('User rejected transaction');
        rejectNotification(dispatch);
      },
      (errorMsg) => {
        sendLiquidityFailEvent(errorMsg);
        addLiquiditySingleFailedNotification(
          dispatch,
          cleanAmount,
          selectedToken.symbol,
          pool.name
        );
      }
    );
  };

  const [onStart, ModalApprove] = useApproveModal(
    [{ amount, token: selectedToken }],
    addV2Protection,
    ApprovalContract.LiquidityProtection,
    sendLiquidityEvent,
    sendLiquidityApprovedEvent
  );

  const handleError = useCallback(() => {
    if (errorMsg) return errorMsg;
    if (!spaceAvailableBnt || !spaceAvailableTkn) {
      return '';
    }
    if (selectedToken.symbol === 'BNT') {
      const isSpaceAvailable = new BigNumber(spaceAvailableBnt).gte(
        amount || 0
      );
      if (isSpaceAvailable) {
        return '';
      } else {
        return 'Not enough space available';
      }
    } else {
      const isSpaceAvailable = new BigNumber(spaceAvailableTkn).gte(
        amount || 0
      );
      if (isSpaceAvailable) {
        return '';
      } else {
        return 'Not enough space available';
      }
    }
  }, [
    amount,
    errorMsg,
    selectedToken.symbol,
    spaceAvailableBnt,
    spaceAvailableTkn,
  ]);

  const handleCTAClick = useCallback(() => {
    setCurrentLiquidity(
      'Deposit Single',
      chainId,
      pool.name,
      selectedToken.symbol,
      amount,
      amountUsd,
      undefined,
      undefined,
      fiatToggle
    );
    sendLiquidityEvent(ConversionEvents.click);
    pool.isV3 ? addV3Protection() : onStart();
  }, [
    amount,
    amountUsd,
    chainId,
    fiatToggle,
    onStart,
    pool.name,
    pool.isV3,
    selectedToken.symbol,
  ]);

  if (!tkn) {
    pushLiquidityError();
    return <></>;
  }

  return (
    <Widget title="Add Liquidity" subtitle="Single-Sided" goBack={pushPools}>
      <AddLiquiditySingleInfoBox />
      <div className="px-10">
        <AddLiquiditySingleSelectPool pool={pool} />
        <AddLiquiditySingleAmount
          pool={pool}
          amount={amount}
          setAmount={setAmount}
          amountUsd={amountUsd}
          setAmountUsd={setAmountUsd}
          token={selectedToken}
          setToken={setSelectedToken}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
        />
      </div>
      <AddLiquiditySingleSpaceAvailable
        pool={pool}
        token={tkn}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        setAmount={handleAmountChange}
        spaceAvailableBnt={spaceAvailableBnt}
        setSpaceAvailableBnt={setSpaceAvailableBnt}
        spaceAvailableTkn={spaceAvailableTkn}
        setSpaceAvailableTkn={setSpaceAvailableTkn}
      />
      <AddLiquiditySingleCTA
        onStart={handleCTAClick}
        amount={amount}
        errorMsg={handleError()}
      />
      {ModalApprove}
    </Widget>
  );
};
