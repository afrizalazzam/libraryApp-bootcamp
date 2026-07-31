import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LoanStatusFilter } from "@/lib/api/loans";

type UiState = {
  books: {
    categoryId: number | null;
    minRating: number | null;
  };
  loans: {
    status: LoanStatusFilter;
    search: string;
  };
  reviews: {
    search: string;
  };
};

const initialState: UiState = {
  books: { categoryId: null, minRating: null },
  loans: { status: "all", search: "" },
  reviews: { search: "" },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setBooksCategoryId(state, action: PayloadAction<number | null>) {
      state.books.categoryId = action.payload;
    },
    setBooksMinRating(state, action: PayloadAction<number | null>) {
      state.books.minRating = action.payload;
    },
    setLoansStatus(state, action: PayloadAction<LoanStatusFilter>) {
      state.loans.status = action.payload;
    },
    setLoansSearch(state, action: PayloadAction<string>) {
      state.loans.search = action.payload;
    },
    setReviewsSearch(state, action: PayloadAction<string>) {
      state.reviews.search = action.payload;
    },
  },
});

export const {
  setBooksCategoryId,
  setBooksMinRating,
  setLoansStatus,
  setLoansSearch,
  setReviewsSearch,
} = uiSlice.actions;

export default uiSlice.reducer;
