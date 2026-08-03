import TestShell from "@/components/TestShell";
import CancellationTestApp from "@/components/CancellationTestApp";
import { DIGIT_SHAPES, DIGIT_TARGET_IDS } from "@/lib/cancellationTest";

export default function NumberCancellationPage() {
  return (
    <TestShell title="ติ๊กเลข 6">
      <CancellationTestApp
        config={{
          title: "ติ๊กเลข 6",
          subtitle: "ฝึกแยกแยะตัวเลขอย่างรวดเร็ว เตรียมสอบนักบิน กองทัพเรือ",
          shapePool: DIGIT_SHAPES,
          targetIds: DIGIT_TARGET_IDS,
          rows: 28,
          cols: 36,
          totalTime: 120,
          pages: 2,
        }}
      />
    </TestShell>
  );
}
