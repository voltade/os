import { Text } from '@mantine/core';

export default function UneditableTextCell({ value }: { value: string }) {
  return <Text inherit>{value}</Text>;
}
