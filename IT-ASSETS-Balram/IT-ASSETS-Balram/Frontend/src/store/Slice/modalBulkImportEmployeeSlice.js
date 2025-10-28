// store/modalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isBulkUploadOpen: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openBulkUpload: (state) => {
      state.isBulkUploadOpen = true;
    },
    closeBulkUpload: (state) => {
      state.isBulkUploadOpen = false;
    },
  },
});

export const { openBulkUpload, closeBulkUpload } = modalSlice.actions;
export default modalSlice.reducer;
