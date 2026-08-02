import TestShell from "@/components/TestShell";
import CancellationTestApp from "@/components/CancellationTestApp";
import { SQUARE_TRIANGLE_SHAPES, SQUARE_TRIANGLE_TARGET_IDS } from "@/lib/cancellationTest";

export default function ColorSquareTrianglePage() {
  return (
    <TestShell title="หาสี่เหลี่ยมแดง-สามเหลี่ยมเหลือง">
      <CancellationTestApp
        config={{
          title: "หาสี่เหลี่ยมแดง-สามเหลี่ยมเหลือง",
          subtitle: "ฝึกแยกแยะรูปทรงและสีพร้อมกัน เตรียมสอบนักบิน กองทัพเรือ",
          shapePool: SQUARE_TRIANGLE_SHAPES,
          targetIds: SQUARE_TRIANGLE_TARGET_IDS,
        }}
      />
    </TestShell>
  );
}
