import TestShell from "@/components/TestShell";
import CancellationTestApp from "@/components/CancellationTestApp";
import { MONO_SHAPES, MONO_TARGET_IDS } from "@/lib/cancellationTest";

export default function SymbolCancellationPage() {
  return (
    <TestShell title="ติ๊กสัญลักษณ์เป้าหมาย">
      <CancellationTestApp
        config={{
          title: "ติ๊กสัญลักษณ์เป้าหมาย",
          subtitle: "ฝึกสมาธิและความไวในการสังเกต เตรียมสอบนักบิน กองทัพเรือ",
          shapePool: MONO_SHAPES,
          targetIds: MONO_TARGET_IDS,
        }}
      />
    </TestShell>
  );
}
