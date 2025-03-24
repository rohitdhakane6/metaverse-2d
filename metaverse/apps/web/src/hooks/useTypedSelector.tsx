import { TypedUseSelectorHook, useSelector } from "react-redux";
import { RootState } from "@/store";

// This hook is a typed version of the useSelector hook
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
