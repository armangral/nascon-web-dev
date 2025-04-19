import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  modalType: "upload" | "delete" | "none";
  courseId: string | null;

  openModal: (type: "upload" | "delete", courseId?: string) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: "none",
  courseId: null,

  openModal: (type, courseId = null) =>
    set({
      isOpen: true,
      modalType: type,
      courseId,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      modalType: "none",
      courseId: null,
    }),
}));
