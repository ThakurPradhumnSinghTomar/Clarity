import { createSlice } from "@reduxjs/toolkit";


export const counterSlice = createSlice({
    name : 'focussing',
    initialState : {
        value:[]
    },
    reducers : {
        updateFocussingStudents : (state,focussingStudents) => {
            //state.value = focussingStudents
        }
    }
})

export const {updateFocussingStudents} = counterSlice.actions
export default counterSlice.reducer 