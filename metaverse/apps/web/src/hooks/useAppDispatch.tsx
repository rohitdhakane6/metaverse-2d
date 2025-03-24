import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

// This hook returns the typed dispatch function
const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
