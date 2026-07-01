"use client";

interface AddExperienceGuideModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

// 경험 항목을 새로 추가할 때마다 뜨는 안내 팝업. AI 대화 없이, 구체적으로 작성하도록 유도하는 문구만 보여준다.
export function AddExperienceGuideModal({ onConfirm, onCancel }: AddExperienceGuideModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-sm leading-relaxed text-gray-800">
          경험을 구체적으로 작성하셨을까요? 무엇을 어떻게 했는지, 어떤 역할이었는지, 어떤 마인드로 임했는지 등을 자세히 적을수록
          매칭 확률이 높아져요!
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
