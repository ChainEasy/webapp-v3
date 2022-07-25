import { getUnlimitedLimited, sendGTM } from 'services/api/googleTagManager';

export enum WithdrawEvent {
  WithdrawPoolClick,
  WithdrawAmountView,
  WithdrawAmountContinue,
  WithdrawUnlimitedTokenView,
  WithdrawUnlimitedTokenContinue,
  WithdrawTokenRequest,
  WithdrawTokenConfirm,
  WithdrawCooldownRequest,
  WithdrawCooldownConfirm,
  WithdrawSuccess,
  WithdrawFailed,
  CompleteView,
  CompleteClose,
  WithdrawRemoveRewardView,
  WithdrawRemoveRewardContinue,
  WithdrawRemoveRewardRequest,
  WithdrawRemoveRewardConfirm,
  WithdrawCooldownAmountView,
  WithdrawCooldownAmountContinue,
  WithdrawCancelClick,
  WithdrawCancelApproveClick,
  WithdrawCancelWalletRequest,
  WithdrawCancelWalletConfirm,
  WithdrawCancelSuccess,
  WithdrawCancelFailed,
}

const withdrawTxtMap = new Map([
  [WithdrawEvent.WithdrawPoolClick, 'Withdraw Pool Click'],
  [WithdrawEvent.WithdrawAmountView, 'Withdraw Enter Amount View'],
  [WithdrawEvent.WithdrawAmountContinue, 'Withdraw Enter Amount Continue'],
  [
    WithdrawEvent.WithdrawUnlimitedTokenView,
    'Withdraw Init Unlimited Token View',
  ],
  [
    WithdrawEvent.WithdrawUnlimitedTokenContinue,
    'Withdraw Init Unlimited Token Continue',
  ],
  [WithdrawEvent.WithdrawTokenRequest, 'Withdraw Init Wallet Token Request'],
  [WithdrawEvent.WithdrawTokenConfirm, 'Withdraw Init Wallet Token Confirm'],
  [
    WithdrawEvent.WithdrawCooldownRequest,
    'Withdraw Init Wallet Cooldown Request',
  ],
  [
    WithdrawEvent.WithdrawCooldownConfirm,
    'Withdraw Init Wallet Cooldown Confirm',
  ],
  [WithdrawEvent.WithdrawSuccess, 'Withdraw Init Success'],
  [WithdrawEvent.WithdrawFailed, 'Withdraw Init Failed'],
  [WithdrawEvent.CompleteView, 'Withdraw Init Complete View'],
  [WithdrawEvent.CompleteClose, 'Withdraw Init Complete Close'],
  [WithdrawEvent.WithdrawRemoveRewardView, 'Withdraw FR Remove Reward View'],
  [
    WithdrawEvent.WithdrawRemoveRewardContinue,
    'Withdraw FR Remove Reward Continue',
  ],
  [
    WithdrawEvent.WithdrawRemoveRewardRequest,
    'Withdraw FR Wallet Remove Reward Request',
  ],
  [
    WithdrawEvent.WithdrawRemoveRewardConfirm,
    'Withdraw FR Wallet Remove Reward Confirm',
  ],
  [
    WithdrawEvent.WithdrawCooldownAmountView,
    'Withdraw FR Cooldown Amount View',
  ],
  [
    WithdrawEvent.WithdrawCooldownAmountContinue,
    'Withdraw FR Cooldown Amount Continue',
  ],
  [WithdrawEvent.WithdrawCancelClick, 'Withdraw Cancel CTA Click'],
  [WithdrawEvent.WithdrawCancelApproveClick, 'Withdraw Cancel Approve Click'],
  [WithdrawEvent.WithdrawCancelWalletRequest, 'Withdraw Cancel Wallet Request'],
  [WithdrawEvent.WithdrawCancelWalletConfirm, 'Withdraw Cancel Wallet Confirm'],
  [WithdrawEvent.WithdrawCancelSuccess, 'Withdraw Cancel Success'],
  [WithdrawEvent.WithdrawCancelFailed, 'Withdraw Cancel Failed'],
]);
interface CurrentWithdraw {
  withdraw_pool: string;
  withdraw_blockchain: string;
  withdraw_blockchain_network: string;
  withdraw_input_type?: string;
  withdraw_token: string;
  withdraw_token_amount?: string;
  withdraw_token_amount_usd?: string;
  withdraw_portion?: string;
  withdraw_display_currency?: string;
}

let currentWithdraw: CurrentWithdraw;
export const setCurrentWithdraw = (currWithdraw: CurrentWithdraw) =>
  (currentWithdraw = currWithdraw);

export const sendWithdrawEvent = (
  event: WithdrawEvent,
  unlimitied_selection?: boolean,
  error?: string,
  reward?: boolean
) => {
  const data = {
    event: withdrawTxtMap.get(event),
    event_properties: {
      ...currentWithdraw,
      unlimitied_selection: getUnlimitedLimited(!!unlimitied_selection),
      error,
      withdraw_type:
        reward === undefined ? reward : reward ? 'from_reward' : 'from_wallet',
    },
    ga_event: {
      category: 'Withdraw',
    },
  };
  sendGTM(data);
};

export enum WithdrawACEvent {
  CTAClick,
  ApproveClick,
  WalletUnlimitedRequest,
  WalletUnlimitedConfirm,
  WalletRequest,
  WalletConfirm,
  Success,
  Failed,
}

const withdrawACTxtMap = new Map([
  [WithdrawACEvent.CTAClick, 'CTA Click'],
  [WithdrawACEvent.ApproveClick, 'Approve Click'],
  [WithdrawACEvent.WalletUnlimitedRequest, 'Wallet Unlimited View'],
  [WithdrawACEvent.WalletUnlimitedConfirm, 'Wallet Unlimited Continue'],
  [WithdrawACEvent.WalletRequest, 'Wallet Request'],
  [WithdrawACEvent.WalletConfirm, 'Wallet Confirm'],
  [WithdrawACEvent.Success, 'Success'],
  [WithdrawACEvent.Success, 'Failed'],
]);

const getWithdrawACText = (event: WithdrawACEvent) =>
  'Withdraw AC ' + withdrawACTxtMap.get(event);

export const sendWithdrawACEvent = (
  event: WithdrawACEvent,
  unlimitied_selection?: boolean,
  error?: string
) => {
  const data = {
    event: getWithdrawACText(event),
    event_properties: {
      ...currentWithdraw,
      unlimitied_selection: getUnlimitedLimited(!!unlimitied_selection),
      error,
    },
    ga_event: {
      category: 'Withdraw',
    },
  };
  sendGTM(data);
};

export enum WithdrawBonusEvent {
  CTAClick,
  ClaimClick,
  ClaimEarnClick,
  WalletRequest,
  WalletConfirm,
  Success,
  Failed,
}

const withdrawBonusTxtMap = new Map([
  [WithdrawBonusEvent.CTAClick, 'CTA Click'],
  [WithdrawBonusEvent.ClaimClick, 'Claim Click'],
  [WithdrawBonusEvent.ClaimEarnClick, 'Claim & Earn Click'],
  [WithdrawBonusEvent.WalletRequest, 'Wallet Request'],
  [WithdrawBonusEvent.WalletConfirm, 'Wallet Confirm'],
  [WithdrawBonusEvent.Success, 'Success'],
  [WithdrawBonusEvent.Failed, 'Failed'],
]);

const getWithdrawBonusText = (event: WithdrawBonusEvent) =>
  'Withdraw Bonus ' + withdrawBonusTxtMap.get(event);

export const sendWithdrawBonusEvent = (
  event: WithdrawBonusEvent,
  unlimitied_selection?: boolean,
  error?: string
) => {
  const data = {
    event: getWithdrawBonusText(event),
    event_properties: {
      ...currentWithdraw,
      unlimitied_selection: getUnlimitedLimited(!!unlimitied_selection),
      error,
    },
    ga_event: {
      category: 'Withdraw',
    },
  };
  sendGTM(data);
};
