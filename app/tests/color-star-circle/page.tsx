import TestShell from "@/components/TestShell";
import CancellationTestApp from "@/components/CancellationTestApp";
import { STAR_CIRCLE_SHAPES, STAR_CIRCLE_TARGET_IDS } from "@/lib/cancellationTest";

export default function ColorStarCirclePage() {
  return (
    <TestShell title="หาดาวส้ม-วงกลมฟ้า">
      <CancellationTestApp
        config={{
          title: "หาดาวส้ม-วงกลมฟ้า",
          subtitle: "ฝึกแยกแยะรูปทรงและสีพร้อมกัน เตรียมสอบนักบิน กองทัพเรือ",
          shapePool: STAR_CIRCLE_SHAPES,
          targetIds: STAR_CIRCLE_TARGET_IDS,
        }}
      />
    </TestShell>
  );
}
