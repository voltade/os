import { NumberFormatter, Text } from '@mantine/core';

export default function UneditableMoneyCell({ value }: { value: number }) {
  return (
    <Text inherit className="tabular-nums" ta="right">
      <NumberFormatter
        prefix={'S$'}
        value={value}
        decimalSeparator={'.'}
        thousandSeparator
        decimalScale={2}
        fixedDecimalScale
      />
    </Text>
  );
}
