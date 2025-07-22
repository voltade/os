import { NumberFormatter, Text } from '@mantine/core';

export default function UneditableNumberCell({ value }: { value: number }) {
  return (
    <Text inherit className="tabular-nums" ta="right">
      <NumberFormatter value={value} decimalSeparator={'.'} thousandSeparator />
    </Text>
  );
}
