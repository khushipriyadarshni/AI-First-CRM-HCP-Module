import { createSlice } from '@reduxjs/toolkit';

const getCurrentDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
};

const getCurrentTime = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getInitialState = () => ({
  hcp_name: '',
  interaction_type: 'Meeting',
  date: getCurrentDate(),
  time: getCurrentTime(),
  attendees: '',
  topics_discussed: '',
  materials_shared: '',
  samples_distributed: '',
  sentiment: '',
  outcomes: '',
  follow_up_actions: ''
});

const initialState = getInitialState();

export const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    updateFormState: (state, action) => {
      // action.payload contains the new full form state dictionary
      return { ...state, ...action.payload };
    },
    resetForm: () => getInitialState(),
  },
});

export const { updateFormState, resetForm } = interactionSlice.actions;
export default interactionSlice.reducer;
