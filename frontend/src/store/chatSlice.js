import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    { id: 1, sender: 'ai', text: 'Hello! I am your AI assistant. Describe your HCP interaction, and I will instantly log it for you.' }
  ],
  isLoading: false,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
});

export const { addMessage, setLoading } = chatSlice.actions;
export default chatSlice.reducer;
